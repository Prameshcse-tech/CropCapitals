-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'investor',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    goal DECIMAL(15, 2) NOT NULL,
    funded DECIMAL(15, 2) DEFAULT 0,
    description TEXT,
    image VARCHAR(255),
    status VARCHAR(50) DEFAULT 'open',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investments Table
CREATE TABLE IF NOT EXISTS investments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_project_id ON investments(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert dummy user
INSERT INTO users (email, password, name) 
VALUES ('test@test.com', '1234', 'Investor John')
ON CONFLICT (email) DO NOTHING;

-- Insert sample projects data
INSERT INTO projects (name, goal, funded, description, image) VALUES
('Wheat Farm Punjab', 50000, 25000, 'Organic wheat cultivation in fertile Punjab lands.', '/images/wheat.jpg'),
('Rice Plantation Tamil Nadu', 60000, 30000, 'Sustainable rice farming with minimal water wastage.', '/images/rice.jpg'),
('Corn Fields Bihar', 45000, 15000, 'High-yield corn farming for local markets.', '/images/corn.jpg'),
('Mango Orchard Maharashtra', 70000, 40000, 'Premium Alphonso mango farming.', '/images/mango.jpg'),
('Coffee Plantation Coorg', 90000, 50000, 'Aromatic coffee beans for export.', '/images/coffee.jpg'),
('Banana Plantation Kerala', 35000, 20000, 'Export-quality bananas grown naturally.', '/images/banana.jpg'),
('Grape Vineyard Nashik', 80000, 40000, 'High-quality wine grape production.', '/images/grapes.jpg'),
('Sugarcane Farm UP', 40000, 10000, 'Sugarcane farming for local mills.', '/images/sugarcane.jpg'),
('Cotton Fields Gujarat', 55000, 30000, 'Premium cotton for textile industry.', '/images/cotton.jpg'),
('Tea Plantation Assam', 95000, 45000, 'Organic Assam tea farming.', '/images/tea.jpg'),
('Tomato Greenhouse Karnataka', 50000, 20000, 'Year-round tomato farming in greenhouses.', '/images/tomato.jpg'),
('Onion Farm Maharashtra', 40000, 15000, 'Red onions for domestic & export.', '/images/onion.jpg'),
('Potato Fields UP', 45000, 22000, 'Large-scale potato cultivation.', '/images/potato.jpg'),
('Strawberry Farm Himachal', 60000, 25000, 'Sweet strawberries for markets.', '/images/strawberry.jpg'),
('Orange Orchard Nagpur', 55000, 30000, 'Nagpur oranges grown naturally.', '/images/orange.jpg'),
('Papaya Farm Andhra', 38000, 18000, 'Organic papaya production.', '/images/papaya.jpg'),
('Avocado Farm Kerala', 80000, 40000, 'Exotic avocado farming.', '/images/avocado.jpg'),
('Chili Farm Andhra', 42000, 20000, 'Spicy red chili cultivation.', '/images/chili.jpg'),
('Pineapple Farm Meghalaya', 50000, 25000, 'Juicy pineapple cultivation.', '/images/pineapple.jpg'),
('Sunflower Farm Rajasthan', 45000, 15000, 'Sunflowers for oil extraction.', '/images/sunflower.jpg'),
('Peanut Farm Gujarat', 48000, 20000, 'Peanut cultivation for snacks & oil.', '/images/peanut.jpg'),
('Cabbage Fields Punjab', 35000, 12000, 'Cabbage farming for local markets.', '/images/cabbage.jpg'),
('Carrot Farm Haryana', 37000, 15000, 'Fresh carrot cultivation.', '/images/carrot.jpg'),
('Pomegranate Farm Maharashtra', 65000, 30000, 'High-quality pomegranates for export.', '/images/pomegranate.jpg'),
('Lettuce Farm Tamil Nadu', 40000, 15000, 'Lettuce for hotels & restaurants.', '/images/lettuce.jpg'),
('Broccoli Farm Himachal', 50000, 20000, 'Broccoli for health-conscious markets.', '/images/broccoli.jpg'),
('Beetroot Farm Odisha', 35000, 10000, 'Beetroot cultivation for juice makers.', '/images/beetroot.jpg'),
('Mustard Fields Rajasthan', 48000, 18000, 'Mustard oil production farming.', '/images/mustard.jpg'),
('Barley Farm Haryana', 45000, 22000, 'Barley for beer and cereal production.', '/images/barley.jpg'),
('Watermelon Farm Karnataka', 40000, 20000, 'Juicy watermelons in summer season.', '/images/watermelon.jpg'),
('Cashew Plantation Goa', 80000, 50000, 'Cashew nut production for export.', '/images/cashew.jpg'),
('Almond Orchard Kashmir', 90000, 60000, 'Premium almonds for global markets.', '/images/almond.jpg'),
('Olive Farm Rajasthan', 85000, 40000, 'Olive oil production farming.', '/images/olive.jpg'),
('Dragon Fruit Farm Gujarat', 95000, 50000, 'Exotic dragon fruit cultivation.', '/images/dragonfruit.jpg'),
('Jackfruit Farm Kerala', 55000, 20000, 'Organic jackfruit production.', '/images/jackfruit.jpg'),
('Mushroom Farm Odisha', 40000, 15000, 'Edible mushroom farming indoors.', '/images/mushroom.jpg'),
('Rose Farm Karnataka', 70000, 35000, 'Rose farming for export & bouquets.', '/images/rose.jpg'),
('Tulip Fields Kashmir', 95000, 60000, 'Colorful tulip flower farming.', '/images/tulip.jpg'),
('Lavender Farm Himachal', 85000, 50000, 'Lavender for essential oil production.', '/images/lavender.jpg'),
('Vanilla Plantation Kerala', 100000, 75000, 'Vanilla beans for global market.', '/images/vanilla.jpg'),
('Guava Orchard Uttar Pradesh', 50000, 25000, 'Guava cultivation for juice makers.', '/images/guava.jpg'),
('Pear Orchard Himachal', 65000, 35000, 'Pear fruit farming for export.', '/images/pear.jpg'),
('Plum Orchard Kashmir', 70000, 40000, 'Plum cultivation for local & export.', '/images/plum.jpg'),
('Spinach Farm Gujarat', 30000, 15000, 'Spinach farming for supermarkets.', '/images/spinach.jpg'),
('Peach Orchard Himachal', 75000, 40000, 'Peach fruit production.', '/images/peach.jpg'),
('Kiwi Farm Arunachal', 80000, 45000, 'Kiwi fruit farming for export.', '/images/kiwi.jpg'),
('Coconut Plantation Kerala', 60000, 30000, 'Coconut farming for oil and water.', '/images/coconut.jpg'),
('Date Palm Farm Rajasthan', 90000, 50000, 'Date farming in desert climate.', '/images/date.jpg'),
('Fig Orchard Maharashtra', 75000, 35000, 'Fig farming for dry fruit market.', '/images/fig.jpg'),
('Herb Garden Uttar Pradesh', 40000, 20000, 'Medicinal herb cultivation.', '/images/herb.jpg')
ON CONFLICT DO NOTHING;
