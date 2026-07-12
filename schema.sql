CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst') NOT NULL
);

CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    model VARCHAR(255),
    type ENUM('Truck', 'Van', 'Bus', 'Car', 'Other') NOT NULL, -- Added generic types as none were specified
    max_load_capacity INT,
    odometer INT,
    acquisition_cost DECIMAL(10, 2),
    status ENUM('Available', 'On Trip', 'In Shop', 'Retired') DEFAULT 'Available'
);

CREATE TABLE drivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    license_category VARCHAR(50),
    license_expiry_date DATE,
    contact_number VARCHAR(50),
    safety_score INT,
    status ENUM('Available', 'On Trip', 'Off Duty', 'Suspended') DEFAULT 'Available'
);

CREATE TABLE trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    vehicle_id INT,
    driver_id INT,
    cargo_weight INT,
    planned_distance INT,
    final_odometer INT,
    fuel_consumed DECIMAL(10, 2),
    status ENUM('Draft', 'Dispatched', 'Completed', 'Cancelled') DEFAULT 'Draft',
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE maintenance_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT,
    description TEXT,
    log_date DATE,
    cost DECIMAL(10, 2),
    status ENUM('Open', 'Closed') DEFAULT 'Open',
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE fuel_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT,
    liters DECIMAL(10, 2),
    cost DECIMAL(10, 2),
    log_date DATE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT,
    type ENUM('Toll', 'Insurance', 'Other') NOT NULL,
    amount DECIMAL(10, 2),
    date DATE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE ON UPDATE CASCADE
);
