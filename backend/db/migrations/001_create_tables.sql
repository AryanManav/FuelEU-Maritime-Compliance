-- routes table
CREATE TABLE IF NOT EXISTS routes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  fuel_consumption NUMERIC NOT NULL,
  baseline BOOLEAN DEFAULT FALSE
);

-- emissions table
CREATE TABLE IF NOT EXISTS emissions (
  route_id TEXT PRIMARY KEY REFERENCES routes(id),
  total_emissions_g NUMERIC NOT NULL
);

-- bank table
CREATE TABLE IF NOT EXISTS bank (
  id SERIAL PRIMARY KEY,
  amount_g NUMERIC NOT NULL
);
