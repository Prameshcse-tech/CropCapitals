const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const pool = require('./db');
const { uploadFileToSupabase } = require('./s3');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.json());

const isProduction = process.env.NODE_ENV === 'production';
app.set('trust proxy', 1); // needed on Render so secure cookies work behind their proxy

app.use(session({
    secret: process.env.SESSION_SECRET || 'secretkey',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: isProduction,               // cookie only sent over HTTPS in prod
        sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-domain (Vercel <-> Render)
        maxAge: 24 * 60 * 60 * 1000          // 1 day
    }
}));

// ===== Auth Routes =====

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields required" });
        }

        const userRole = ['farmer', 'investor', 'admin'].includes(role) ? role : 'investor';

        // Check if user already exists
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const result = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, userRole]
        );

        const user = result.rows[0];
        req.session.user = user;
        res.json({ success: true, user });
    } catch (error) {
        console.error('❌ Register error:', error);
        res.status(500).json({ success: false, message: "Registration failed" });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password required" });
        }

        const userResult = await pool.query('SELECT id, email, password, name, role FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const user = userResult.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        req.session.user = { id: user.id, email: user.email, name: user.name, role: user.role };
        res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Logout
app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Get current user
app.get('/api/user', async (req, res) => {
    if (req.session.user) {
        // Refresh user data from database to get latest role and verified status
        try {
            const result = await pool.query('SELECT id, email, name, role, verified FROM users WHERE id = $1', [req.session.user.id]);
            if (result.rows.length > 0) {
                req.session.user = result.rows[0];
                return res.json({ user: result.rows[0] });
            }
        } catch (err) {
            console.error('Error fetching user:', err);
        }
        return res.json({ user: req.session.user });
    }
    res.json({ user: null });
});

// Update profile
app.post('/api/update-profile', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "Not logged in" });
        }

        const { name, email, currentPassword, newPassword } = req.body;
        const userId = req.session.user.id;

        if (!name || !email || !currentPassword) {
            return res.status(400).json({ success: false, message: "Name, email, and current password required" });
        }

        // Verify current password
        const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const passwordMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password);
        if (!passwordMatch) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        // Check if email is already in use by another user
        if (email !== req.session.user.email) {
            const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
            if (emailCheck.rows.length > 0) {
                return res.status(400).json({ success: false, message: "Email already in use" });
            }
        }

        let updateQuery = 'UPDATE users SET name = $1, email = $2';
        let params = [name, email];

        // If new password provided, hash and update it
        if (newPassword && newPassword.trim()) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateQuery += ', password = $3';
            params.push(hashedPassword);
        }

        updateQuery += ' WHERE id = $' + (params.length + 1) + ' RETURNING id, name, email, role';
        params.push(userId);

        const result = await pool.query(updateQuery, params);
        const updatedUser = result.rows[0];

        req.session.user = updatedUser;
        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('❌ Update profile error:', error);
        res.status(500).json({ success: false, message: "Update failed" });
    }
});

// ===== Project Routes =====

// Get all projects
app.get('/api/projects', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: "Not logged in" });
        }

        const result = await pool.query('SELECT id, name, goal, funded, description, image, status FROM projects ORDER BY id');
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Get projects error:', error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get single project detail
app.get('/api/projects/:id', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: "Not logged in" });
        }

        const { id } = req.params;
        const result = await pool.query(
            'SELECT id, name, goal, funded, description, image, status, created_at FROM projects WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('❌ Get project detail error:', error);
        res.status(500).json({ message: "Server error" });
    }
});

// ===== Investment Routes =====

// Create investment
app.post('/api/invest', async (req, res) => {
    try {
        const { projectId, amount } = req.body;

        if (!req.session.user) {
            return res.status(401).json({ message: "Not logged in" });
        }

        if (!projectId || !amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid project or amount" });
        }

        // Check if project exists
        const projectResult = await pool.query('SELECT id, goal, funded FROM projects WHERE id = $1', [projectId]);
        if (projectResult.rows.length === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        const project = projectResult.rows[0];

        // Check if investment would exceed goal
        if (project.funded + amount > project.goal) {
            return res.status(400).json({ success: false, message: "Investment amount exceeds project goal" });
        }

        // Start transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Create investment record
            await client.query(
                'INSERT INTO investments (user_id, project_id, amount) VALUES ($1, $2, $3)',
                [req.session.user.id, projectId, amount]
            );

            // Update project funded amount
            await client.query(
                'UPDATE projects SET funded = funded + $1 WHERE id = $2',
                [amount, projectId]
            );

            await client.query('COMMIT');
            res.json({ success: true, message: "Investment successful" });
        } catch (innerError) {
            await client.query('ROLLBACK');
            throw innerError;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('❌ Investment error:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Get user investments
app.get('/api/investments', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: "Not logged in" });
        }

        const result = await pool.query(
            `SELECT i.id, i.amount, i.created_at, p.name as projectName, p.goal, p.funded
             FROM investments i
             JOIN projects p ON i.project_id = p.id
             WHERE i.user_id = $1
             ORDER BY i.created_at DESC`,
            [req.session.user.id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('❌ Get investments error:', error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get user investment stats
app.get('/api/investments/stats', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: "Not logged in" });
        }

        const result = await pool.query(
            `SELECT 
                COUNT(DISTINCT project_id) as projectsInvested,
                COUNT(*) as totalInvestments,
                SUM(amount) as totalInvested
             FROM investments
             WHERE user_id = $1`,
            [req.session.user.id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('❌ Get investment stats error:', error);
        res.status(500).json({ message: "Server error" });
    }
});

// ===== Project Management Routes =====

// Create new project
app.post('/api/projects', upload.single('image'), async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: "Not logged in" });
        }

        const { name, goal, funded, description, status } = req.body;
        const goalValue = parseFloat(goal);
        const fundedValue = funded === undefined || funded === '' ? 0 : parseFloat(funded);

        if (!name || !goalValue || goalValue <= 0) {
            return res.status(400).json({ message: "Name and valid goal required" });
        }

        if (isNaN(fundedValue) || fundedValue < 0) {
            return res.status(400).json({ message: "Funded amount must be zero or greater" });
        }

        if (fundedValue > goalValue) {
            return res.status(400).json({ message: "Funded amount cannot exceed the goal" });
        }

        let imageUrl = '/images/default.jpg';
        if (req.file) {
            imageUrl = await uploadFileToSupabase(req.file);
        }

        const result = await pool.query(
            `INSERT INTO projects (name, goal, funded, description, image, status, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING id, name, goal, funded, description, image, status, created_by, created_at`,
            [name, goalValue, fundedValue, description || '', imageUrl, status || 'open', req.session.user.id]
        );

        res.json({ success: true, project: result.rows[0] });
    } catch (error) {
        console.error('❌ Create project error:', error);
        res.status(500).json({ message: error.message || "Failed to create project" });
    }
});

// Get user's projects
app.get('/api/user-projects', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: "Not logged in" });
        }

        const result = await pool.query(
            `SELECT p.*, 
                    COUNT(DISTINCT i.user_id) as investorCount,
                    COALESCE(SUM(i.amount), 0) as totalInvestment,
                    (p.funded / p.goal * 100) as fundingPercent
             FROM projects p
             LEFT JOIN investments i ON p.id = i.project_id
             WHERE p.created_by = $1
             GROUP BY p.id
             ORDER BY p.created_at DESC`,
            [req.session.user.id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('❌ Get user projects error:', error);
        res.status(500).json({ message: "Failed to fetch projects" });
    }
});

// Get project details with analytics
app.get('/api/projects/:id/analytics', async (req, res) => {
    try {
        const projectId = req.params.id;

        // Get project details
        const projectResult = await pool.query(
            `SELECT p.*, u.name as creatorName, u.email as creatorEmail
             FROM projects p
             LEFT JOIN users u ON p.created_by = u.id
             WHERE p.id = $1`,
            [projectId]
        );

        if (projectResult.rows.length === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Get investor details
        const investorResult = await pool.query(
            `SELECT u.id, u.name, u.email, SUM(i.amount) as totalInvested, COUNT(*) as investmentCount
             FROM investments i
             JOIN users u ON i.user_id = u.id
             WHERE i.project_id = $1
             GROUP BY u.id, u.name, u.email
             ORDER BY totalInvested DESC`,
            [projectId]
        );

        const project = projectResult.rows[0];
        const fundingPercent = (project.funded / project.goal * 100).toFixed(2);

        res.json({
            project: {
                ...project,
                fundingPercent: parseFloat(fundingPercent),
                investorCount: investorResult.rows.length,
                totalInvested: project.funded
            },
            investors: investorResult.rows
        });
    } catch (error) {
        console.error('❌ Get project analytics error:', error);
        res.status(500).json({ message: "Failed to fetch analytics" });
    }
});

// Update project (only creator can update)
app.put('/api/projects/:id', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: "Not logged in" });
        }

        const projectId = req.params.id;
        const { name, description, image, status } = req.body;

        // Verify ownership
        const ownerResult = await pool.query(
            'SELECT created_by FROM projects WHERE id = $1',
            [projectId]
        );

        if (ownerResult.rows.length === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (ownerResult.rows[0].created_by !== req.session.user.id) {
            return res.status(403).json({ message: "Not authorized to update this project" });
        }

        const result = await pool.query(
            `UPDATE projects 
             SET name = COALESCE($1, name), 
                 description = COALESCE($2, description),
                 image = COALESCE($3, image),
                 status = COALESCE($4, status),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5
             RETURNING *`,
            [name, description, image, status, projectId]
        );

        res.json({ success: true, project: result.rows[0] });
    } catch (error) {
        console.error('❌ Update project error:', error);
        res.status(500).json({ message: "Failed to update project" });
    }
});

// Delete project (only creator can delete)
app.delete('/api/projects/:id', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: "Not logged in" });
        }

        const projectId = req.params.id;

        // Verify ownership
        const ownerResult = await pool.query(
            'SELECT created_by FROM projects WHERE id = $1',
            [projectId]
        );

        if (ownerResult.rows.length === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (ownerResult.rows[0].created_by !== req.session.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this project" });
        }

        await pool.query('DELETE FROM projects WHERE id = $1', [projectId]);

        res.json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        console.error('❌ Delete project error:', error);
        res.status(500).json({ message: "Failed to delete project" });
    }
});

// ===== Role-Based Authorization Middleware =====
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).json({ message: "Not logged in" });
        }
        if (!roles.includes(req.session.user.role)) {
            return res.status(403).json({ message: "Access denied. Required role: " + roles.join(' or ') });
        }
        next();
    };
};

// ===== Admin Routes =====

// Get all users (admin only)
app.get('/api/admin/users', requireRole(['admin']), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.name, u.email, u.role, u.verified, u.created_at,
                    COUNT(DISTINCT p.id) as projectsCreated,
                    COUNT(DISTINCT i.id) as investmentsCount,
                    COALESCE(SUM(i.amount), 0) as totalInvested
             FROM users u
             LEFT JOIN projects p ON u.id = p.created_by
             LEFT JOIN investments i ON u.id = i.user_id
             GROUP BY u.id, u.name, u.email, u.role, u.verified, u.created_at
             ORDER BY u.created_at DESC`,
        );

        res.json(result.rows);
    } catch (error) {
        console.error('❌ Get admin users error:', error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

// Change user role (admin only)
app.post('/api/admin/users/:userId/role', requireRole(['admin']), async (req, res) => {
    try {
        const { userId } = req.params;
        const { newRole } = req.body;

        if (!['farmer', 'investor', 'admin'].includes(newRole)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const result = await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
            [newRole, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error('❌ Change role error:', error);
        res.status(500).json({ message: "Failed to change role" });
    }
});

// Verify farmer (admin only)
app.post('/api/admin/users/:userId/verify', requireRole(['admin']), async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            'UPDATE users SET verified = true WHERE id = $1 RETURNING id, name, email, verified',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error('❌ Verify user error:', error);
        res.status(500).json({ message: "Failed to verify user" });
    }
});

// Delete user (admin only)
app.delete('/api/admin/users/:userId', requireRole(['admin']), async (req, res) => {
    try {
        const { userId } = req.params;

        // Don't allow deleting the only admin
        const adminCount = await pool.query(
            'SELECT COUNT(*) as count FROM users WHERE role = $1',
            ['admin']
        );

        if (adminCount.rows[0].count === 1) {
            const user = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
            if (user.rows[0].role === 'admin') {
                return res.status(400).json({ message: "Cannot delete the only admin" });
            }
        }

        await pool.query('DELETE FROM users WHERE id = $1', [userId]);

        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error('❌ Delete user error:', error);
        res.status(500).json({ message: "Failed to delete user" });
    }
});

// Get all projects (for admin panel)
app.get('/api/admin/projects', requireRole(['admin']), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, u.name as creatorName, u.email as creatorEmail, u.role as creatorRole,
                    COUNT(DISTINCT i.user_id) as investorCount,
                    COALESCE(SUM(i.amount), 0) as funded
             FROM projects p
             LEFT JOIN users u ON p.created_by = u.id
             LEFT JOIN investments i ON p.id = i.project_id
             GROUP BY p.id, u.name, u.email, u.role
             ORDER BY p.created_at DESC`,
        );

        res.json(result.rows);
    } catch (error) {
        console.error('❌ Get admin projects error:', error);
        res.status(500).json({ message: "Failed to fetch projects" });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
