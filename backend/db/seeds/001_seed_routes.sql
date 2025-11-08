INSERT INTO routes(id,name,fuel_consumption,baseline,vessel_type,fuel_type,year) VALUES
('R001','Rotterdam-Hamburg',1000,false,'Tanker','HFO',2025),
('R002','Antwerp-Rotterdam',800,false,'Bulk','MGO',2025),
('R003','Genoa-Barcelona',1200,false,'Container','HFO',2025),
('R004','Le Havre-Marseille',600,false,'Passenger','LNG',2025),
('R005','Southampton-Hull',400,false,'RoRo','MGO',2025)
ON CONFLICT (id) DO NOTHING;

-- sample emissions (g)
INSERT INTO emissions(route_id,total_emissions_g) VALUES
('R001', 3e9),
('R002', 2.5e9),
('R003', 4e9),
('R004', 1.2e9),
('R005', 0.8e9)
ON CONFLICT (route_id) DO NOTHING;

-- sample bank (one row) - insert only if empty
INSERT INTO bank(amount_g)
SELECT 5e8
WHERE NOT EXISTS (SELECT 1 FROM bank);

-- sample pool and members (demo) - create only if none exist
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pools) THEN
		INSERT INTO pools(payload) VALUES ('{"members":[{"routeId":"R001","amount":100000000},{"routeId":"R003","amount":200000000}], "note":"demo pool"}'::jsonb);
	END IF;
END$$;

DO $$
DECLARE pid int;
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pool_members) THEN
		SELECT id INTO pid FROM pools ORDER BY id DESC LIMIT 1;
		IF pid IS NOT NULL THEN
			INSERT INTO pool_members(pool_id, route_id, amount) VALUES(pid, 'R001', 100000000);
			INSERT INTO pool_members(pool_id, route_id, amount) VALUES(pid, 'R003', 200000000);
		END IF;
	END IF;
END$$;
