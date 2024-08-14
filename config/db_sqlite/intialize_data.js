const { db } = require('./db');

function intializeData(db) {
  db.exec(`

    CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phoneno VARCHAR(15) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('passenger', 'conductor'))
);

CREATE TABLE tickets (
    ticket_unique_identifier CHAR(36) PRIMARY KEY ,
    issue_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiry_time TIMESTAMP NOT NULL,
    trip_details JSONB NOT NULL, 
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE Cities (
    city_id INT PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL
);

CREATE TABLE BusRoutes (
    route_id INT PRIMARY KEY,
    city_id INT,
    source VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    avg_travel_time INT NOT NULL,
    FOREIGN KEY (city_id) REFERENCES Cities(city_id)
);

CREATE TABLE BusStops (
    stop_id INT PRIMARY KEY,
    route_id INT,
    stop_name VARCHAR(100) NOT NULL,
    stop_order INT NOT NULL,
    distance_from_start DECIMAL(5, 2) NOT NULL,
    FOREIGN KEY (route_id) REFERENCES BusRoutes(route_id)
);

CREATE TABLE Buses (
    bus_id INT PRIMARY KEY,
    route_id INT,
    bus_number VARCHAR(50) NOT NULL,
    bus_type VARCHAR(50) NOT NULL,
    price DECIMAL(5, 2) NOT NULL,
    FOREIGN KEY (route_id) REFERENCES BusRoutes(route_id)
);


INSERT INTO Cities (city_id, city_name) VALUES
(1, 'New York'),
(2, 'San Francisco'),
(3, 'Chicago');

INSERT INTO BusRoutes (route_id, city_id, source, destination, avg_travel_time) VALUES
(1, 1, 'Times Square', 'Central Park', 30),
(2, 1, 'Wall Street', 'Brooklyn Bridge', 25),
(3, 2, 'Golden Gate', 'Fishermans Wharf', 20),
(4, 2, 'Union Square', 'Alcatraz Island', 40),
(5, 3, 'Navy Pier', 'Millennium Park', 15),
(6, 3, 'Willis Tower', 'Magnificent Mile', 10);

INSERT INTO BusStops (stop_id, route_id, stop_name, stop_order, distance_from_start) VALUES
(1, 1, 'Times Square', 1, 0),
(2, 1, 'Bryant Park', 2, 1),
(3, 1, 'Grand Central', 3, 2.5),
(4, 1, 'Central Park', 4, 4),
(5, 2, 'Wall Street', 1, 0),
(6, 2, 'Fulton Street', 2, 1),
(7, 2, 'Brooklyn Bridge', 3, 2.2),
(8, 3, 'Golden Gate', 1, 0),
(9, 3, 'Lombard Street', 2, 1.5),
(10, 3, 'Fishermans Wharf', 3, 3),
(11, 4, 'Union Square', 1, 0),
(12, 4, 'Pier 39', 2, 2),
(13, 4, 'Alcatraz Island', 3, 3.5),
(14, 5, 'Navy Pier', 1, 0),
(15, 5, 'Art Institute', 2, 1),
(16, 5, 'Millennium Park', 3, 2.5),
(17, 6, 'Willis Tower', 1, 0),
(18, 6, 'Chicago Riverwalk', 2, 0.5),
(19, 6, 'Magnificent Mile', 3, 1);

INSERT INTO Buses (bus_id, route_id, bus_number, bus_type, price) VALUES
(1, 1, 'NY001', 'AC', 3.00),
(2, 1, 'NY002', 'Non-AC', 2.50),
(3, 2, 'NY003', 'AC', 3.50),
(4, 3, 'SF001', 'AC', 4.00),
(5, 3, 'SF002', 'Non-AC', 3.00),
(6, 4, 'SF003', 'AC', 4.50),
(7, 5, 'CH001', 'AC', 2.00),
(8, 6, 'CH002', 'Non-AC', 1.50);
    
CREATE TRIGGER AutoGenerateGUID
AFTER INSERT ON tickets
FOR EACH ROW
WHEN (NEW.ticket_unique_identifier IS NULL)
BEGIN
   UPDATE tickets SET ticket_unique_identifier = (select hex( randomblob(4)) || '-' || hex( randomblob(2))
             || '-' || '4' || substr( hex( randomblob(2)), 2) || '-'
             || substr('AB89', 1 + (abs(random()) % 4) , 1)  ||
             substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6)) ) WHERE rowid = NEW.rowid;
END;

CREATE TRIGGER AutoGenerateGUID_USERS
AFTER INSERT ON users
FOR EACH ROW
WHEN (NEW.id IS NULL)
BEGIN
   UPDATE users SET id = (select hex( randomblob(4)) || '-' || hex( randomblob(2))
             || '-' || '4' || substr( hex( randomblob(2)), 2) || '-'
             || substr('AB89', 1 + (abs(random()) % 4) , 1)  ||
             substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6)) ) WHERE rowid = NEW.rowid;
END;

`);
}

const runQuery = async (db, query, params=[]) => {
    return new Promise((resolve, reject) => {
        db.all(query, [...params], (err, rows) => {
            if (err) {
                return reject(err);
            }
            /*
            rows.forEach(stop => {
                stop['trip_details'] = JSON.parse(stop['trip_details']);
            });
            */
            resolve(rows);
        });
    });
};

const query = `
select * from tickets;
`
// runQuery(db, query).then(data => console.log('this is data',data));
intializeData(db);
