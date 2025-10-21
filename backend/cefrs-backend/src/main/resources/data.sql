-- Insert Roles
INSERT INTO user_role (name, description) VALUES 
('STUDENT', 'View available equipment and facilities, submit requests, check status'),
('ORGANIZATION', 'Submit requests for facilities, manage organization reservations'),
('ADMIN', 'Approve/decline requests, manage availability, view reports'),
('SUPER_ADMIN', 'Manage users, configure policies, handle backups');

-- Example: Insert a test admin user (password: admin123 - hashed with bcrypt)
-- Password hash: $2a$10$Y9VfSoKis01NHATZr7We2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUe
-- INSERT INTO users (email, password, first_name, last_name, phone_number, role_id, organization_name, created_at, updated_at, is_active)
-- VALUES ('admin@technova.com', '$2a$10$Y9VfSoKis01NHATZr7We2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMUe', 'Admin', 'User', '09123456789', 3, 'TechNova', NOW(), NOW(), true);