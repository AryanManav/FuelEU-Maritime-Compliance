-- Create pools and pool_members tables and a bank_entries table for history
CREATE TABLE IF NOT EXISTS pools (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  payload JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS pool_members (
  id SERIAL PRIMARY KEY,
  pool_id INTEGER REFERENCES pools(id),
  route_id TEXT NOT NULL,
  amount NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS bank_entries (
  id SERIAL PRIMARY KEY,
  amount_g NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
