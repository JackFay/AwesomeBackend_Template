DROP TABLE IF EXISTS user_status CASCADE;
CREATE TABLE user_status (
	status int NOT NULL PRIMARY KEY,
    description varchar(50)
);

DROP TABLE IF EXISTS user_types CASCADE;
CREATE TABLE user_types (
    type_id int NOT NULL PRIMARY KEY,
    name varchar(50) NOT NULL,
    description varchar(255) NULL
);

DROP TABLE IF EXISTS addresses CASCADE;
CREATE TABLE addresses(
    id bigint auto_increment,
    line_1 varchar(255) NOT NULL,
    line_2 varchar(255) NULL,
    line_3 varchar(255) NULL,
    city varchar(255) NOT NULL,
    state_providence varchar(255) NULL,
    zip_or_postcode varchar(50) NULL,
    country varchar(50) NOT NULL,
    other_details varchar(255) NULL,
    PRIMARY KEY (id)
);


DROP TABLE IF EXISTS organizations CASCADE;
CREATE TABLE organizations(
    id bigint auto_increment,
    name varchar(255) NOT NULL,
    address_id bigint NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (address_id) REFERENCES addresses(id)
);

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    user_id bigint auto_increment,
    user_type int NOT NULL DEFAULT 3,
    email varchar(255) NULL UNIQUE,
    phone varchar(20) NOT NULL UNIQUE,
    legal_name varchar(255) NOT NULL,
    dob varchar(20) NULL,
    organization_id bigint NULL,
    password_hash CHAR(44) NOT NULL,
	salt CHAR(44),
    status int NOT NULL,
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_type) REFERENCES user_types (type_id),
    FOREIGN KEY (status) REFERENCES user_status(status),
    FOREIGN KEY (organization_id) REFERENCES organizations (id)
);

DROP TABLE IF EXISTS dependents CASCADE;
CREATE TABLE dependents(
    dependent_id bigint auto_increment PRIMARY KEY,
    parent_id bigint NOT NULL,
	legal_name varchar(255) NOT NULL,
    dob varchar(20) NOT NULL,
    organization_id bigint NULL,
    FOREIGN KEY (parent_id) REFERENCES users (user_id),
    FOREIGN KEY (organization_id) REFERENCES organizations (id)
);

DROP TABLE IF EXISTS test_types CASCADE;
CREATE TABLE test_types (
	id int auto_increment PRIMARY KEY,
	name varchar(100) NOT NULL,
    description varchar(255)
);

DROP TABLE IF EXISTS user_signups CASCADE;
CREATE TABLE user_signups (
	id int auto_increment PRIMARY KEY,
	email varchar(100) NOT NULL
);

DROP TABLE IF EXISTS image_uploads CASCADE;
CREATE TABLE image_uploads (
	id bigint auto_increment PRIMARY KEY,
	image_path varchar(100) NOT NULL,
    user_id bigint NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (user_id)
);

DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
    id bigint auto_increment PRIMARY KEY,
    organization_id bigint NOT NULL,
    dollar_amount varchar(255) NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations (id)
);

DROP TABLE IF EXISTS qr_codes CASCADE;
CREATE TABLE qr_codes (
	id bigint auto_increment PRIMARY KEY,
    organization_id bigint NOT NULL,
    date_issued DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_processed DATETIME NULL,
	active_ind bit NOT NULL DEFAULT 1,
    test_type_id int NOT NULL,
    order_id bigint NOT NULL,
    price varchar(255) NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations (id),
    FOREIGN KEY (test_type_id) REFERENCES test_types (id)
);

DROP TABLE IF EXISTS tests CASCADE;
CREATE TABLE tests (
	id int auto_increment PRIMARY KEY,
    user_id bigint NOT NULL,
	qr_code_id bigint NOT NULL,
    image_id bigint NOT NULL,
    result varchar(255) NULL,
    contact_number varchar(255) NOT NULL,
    date_submitted DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dependent_id bigint NULL,
    test_type_id int NOT NULL,
    FOREIGN KEY (image_id) REFERENCES image_uploads (id),
    FOREIGN KEY (qr_code_id) REFERENCES qr_codes (id),
    FOREIGN KEY (image_id) REFERENCES image_uploads (id),
    FOREIGN KEY (test_type_id) REFERENCES test_types (id)
);


DROP TABLE IF EXISTS approved_clinicians_for_dependents CASCADE;
CREATE TABLE approved_clinicians_for_dependents (
    dependent_id bigint NOT NULL,
    clinician_user_id bigint NOT NULL,
    active_ind bit NOT NULL DEFAULT 1,
    PRIMARY KEY (dependent_id, user_id),
    FOREIGN KEY (dependent_id) REFERENCES dependents (dependent_id),
    FOREIGN KEY (clinician_user_id) REFERENCES users (user_id)
);


INSERT INTO user_status VALUES (0, 'Inactive');
INSERT INTO user_status VALUES (1, 'Active');
INSERT INTO user_status VALUES (2, 'Pending');
INSERT INTO user_types (type_id, name) VALUES (1, 'ADMIN');
INSERT INTO user_types (type_id, name) VALUES (2, 'CLINICIAN');
INSERT INTO user_types (type_id, name) VALUES (3, 'NARP');
INSERT INTO test_types (name, description) VALUES ('Strep Test', 'Used for sore throats');
INSERT INTO test_types (name, description) VALUES ('Flu Test', 'Used for the flu');
INSERT INTO addresses (line_1, city, state_providence, zip_or_postcode, country) VALUES ('4906 Steeplechase Dr', 'Columbia', 'MO', '65203', 'USA');
INSERT INTO organizations (name, address_id) VALUES ('Fay Inc', 1);
INSERT INTO orders (organization_id, dollar_amount) VALUES (1, '500');
INSERT INTO qr_codes (organization_id, test_type_id, order_id) VALUES (1, 1, 1);
INSERT INTO image_uploads (image_path, user_id) VALUES ('test/path', 1);
INSERT INTO strep_tests (user_id, qr_code_id, image_id) VALUES (1, 1, 1);
INSERT INTO users VALUES (1, 'jfay@yahoo.com', 'jackattack', 'n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg=', 'n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg=', 1);
INSERT INTO users (user_type, email, legal_name, dob, password_hash, salt, status) VALUES (null, 'test@test.com', 'test mcgee', '08-19-1994', 'test', 'test', 1);
INSERT INTO persons VALUES (1, 'jack', 'fay', '5734451914');

-- INSERT INTO person ('username', 'firstname', 'lastname', 'phone_number', 'email') VALUES ('jackattack', 'jack', 'fay', '5734451914', 'jfay@yahoo.com');

-- GET TESTS query
-- select * from strep_tests t INNER JOIN image_uploads i ON i.id=t.image_id INNER JOIN users u ON u.user_id = t.user_id;

-- DROP ALL --
DROP TABLE tests;
DROP TABLE image_uploads;
DROP TABLE orders;
DROP TABLE user_signups;
DROP TABLE dependents;
DROP TABLE users;
DROP TABLE user_status;
DROP TABLE qr_codes;
DROP TABLE test_types;
DROP TABLE organizations;
DROP TABLE addresses;
DROP TABLE user_types;
DROP TABLE approved_clinicians_for_dependents;
