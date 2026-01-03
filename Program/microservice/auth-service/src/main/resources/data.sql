-- enable uuid generator
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- clean up old join tables if they exist
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS auth_user_roles;

-- users table matches the entity
CREATE TABLE IF NOT EXISTS "users" (
                                       id UUID PRIMARY KEY,
                                       first_name VARCHAR(255) NOT NULL,
                                       last_name VARCHAR(255) NOT NULL,
                                       email VARCHAR(255) UNIQUE NOT NULL,
                                       username VARCHAR(255) UNIQUE NOT NULL,
                                       password VARCHAR(255) NOT NULL,
                                       must_change_password BOOLEAN NOT NULL DEFAULT FALSE
    );

-- keep seed scripts compatible with existing databases
ALTER TABLE IF EXISTS "users" ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

-- drop legacy column if it exists
ALTER TABLE "users" DROP COLUMN IF EXISTS role;

-- roles table uses uuid
CREATE TABLE IF NOT EXISTS roles (
                                     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL
    );

-- join table that your entity maps to
CREATE TABLE IF NOT EXISTS auth_user_roles (
                                               user_id UUID NOT NULL,
                                               role_id UUID NOT NULL,
                                               PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_auth_user_roles_user FOREIGN KEY (user_id) REFERENCES "users"(id) ON DELETE CASCADE,
    CONSTRAINT fk_auth_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    );

-- seed user
INSERT INTO "users" (id, first_name, last_name, email, username, password)
SELECT
    '223e4567-e89b-12d3-a456-426614174006'::uuid,
    'Test',
    'User',
    'testuser@test.com',
    'testuser',
    '$2b$12$7hoRZfJrRKD2nIm2vHLs7OBETy.LWenXXMLKf99W8M4PUwO6KB7fu'
    WHERE NOT EXISTS (
    SELECT 1 FROM "users"
    WHERE id = '223e4567-e89b-12d3-a456-426614174006'::uuid
       OR email = 'testuser@test.com'
       OR username = 'testuser'
);

-- seed roles
INSERT INTO roles (id, name)
SELECT '11111111-aaaa-aaaa-aaaa-111111111111'::uuid, 'ADMIN'
    WHERE NOT EXISTS (
        SELECT 1 FROM roles
        WHERE id = '11111111-aaaa-aaaa-aaaa-111111111111'::uuid OR name = 'ADMIN'
    );

INSERT INTO roles (id, name)
SELECT '22222222-bbbb-bbbb-bbbb-222222222222'::uuid, 'USER'
    WHERE NOT EXISTS (
        SELECT 1 FROM roles
        WHERE id = '22222222-bbbb-bbbb-bbbb-222222222222'::uuid OR name = 'USER'
    );

-- give the user the ADMIN role
INSERT INTO auth_user_roles (user_id, role_id)
SELECT u.id, r.id
FROM "users" u
         JOIN roles r ON r.name = 'ADMIN'
WHERE u.id = '223e4567-e89b-12d3-a456-426614174006'::uuid
  AND NOT EXISTS (
      SELECT 1 FROM auth_user_roles ur
      WHERE ur.user_id = u.id AND ur.role_id = r.id
  );
