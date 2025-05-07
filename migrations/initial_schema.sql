-- Create example table
CREATE TABLE example_table (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row-Level Security (RLS)
ALTER TABLE example_table ENABLE ROW LEVEL SECURITY;

-- Add RLS policy
CREATE POLICY "Allow all" ON example_table
    FOR SELECT
    USING (true);
