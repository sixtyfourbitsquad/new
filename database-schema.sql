-- Database Schema for Sixty4Bit Dashboard
-- Run this in your Neon PostgreSQL database

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) DEFAULT 'Website',
    domain TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    task_type VARCHAR(100) NOT NULL,
    details TEXT,
    date DATE NOT NULL,
    amount DECIMAL(10,2) DEFAULT 0.00,
    paid BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cycles table
CREATE TABLE IF NOT EXISTS cycles (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    log_ids JSONB NOT NULL, -- Array of log IDs
    total DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_logs_client_id ON logs(client_id);
CREATE INDEX IF NOT EXISTS idx_logs_date ON logs(date);
CREATE INDEX IF NOT EXISTS idx_logs_paid ON logs(paid);
CREATE INDEX IF NOT EXISTS idx_cycles_client_id ON cycles(client_id);
CREATE INDEX IF NOT EXISTS idx_cycles_date ON cycles(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_logs_updated_at BEFORE UPDATE ON logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cycles_updated_at BEFORE UPDATE ON cycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO clients (name, type, domain) VALUES 
    ('Sample Client', 'Website', 'https://example.com')
ON CONFLICT DO NOTHING;

-- Grant necessary permissions (adjust as needed for your Neon setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_user;
