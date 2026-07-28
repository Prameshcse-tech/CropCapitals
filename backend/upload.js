const fs = require('fs');
const path = require('path');

const uploadFileLocally = async (file) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    return `http://localhost:5000/uploads/${fileName}`;
};

module.exports = {
    uploadFileLocally,
};
