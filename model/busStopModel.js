const { db } = require("../config/db_sqlite/db");

const getAllCity = async () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM Cities', [], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
};

const getAllStopsForCity = async (cityId) => {
    const getAllStopByCityQ = `
    SELECT s.stop_id, s.stop_name 
    FROM BusStops s
    JOIN BusRoutes r ON r.route_id = s.route_id
    WHERE r.city_id = ?
    `;
    return new Promise((resolve, reject) => {
        db.all(getAllStopByCityQ, [cityId], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
};

const getAllPossibleDestinationFromSource = async (sourceId) => {
    const getAllPossibleDestinationFromSourceQ = `
    SELECT route_id, stop_id, stop_name
    FROM BusStops
    WHERE route_id IN (SELECT route_id FROM BusStops WHERE stop_id = ?)
    AND stop_id <> ?
    `;
    return new Promise((resolve, reject) => {
        db.all(getAllPossibleDestinationFromSourceQ, [sourceId, sourceId], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
};

const getBustListForChoosenPath = async (sourceId, destinationId) => {
    const getBustListForChoosenPathQ = `
    SELECT 
        b.bus_id, 
        b.price AS price_per_km, 
        s2.distance_from_start - s1.distance_from_start as total_distance, 
        (s2.distance_from_start - s1.distance_from_start) * b.price as fare
    FROM Buses b
    JOIN BusRoutes r ON b.route_id = r.route_id
    JOIN BusStops s1 ON r.route_id = s1.route_id
    JOIN BusStops s2 ON r.route_id = s2.route_id
    WHERE s1.stop_id = ?
    AND s2.stop_id = ?
    AND s1.stop_order < s2.stop_order;
    `;
    return new Promise((resolve, reject) => {
        db.all(getBustListForChoosenPathQ, [sourceId, destinationId], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
};

const getStopsFromBusId = async (busId) => {
    const getStopsFromBusIdQ = `
    SELECT b.bus_id, r.route_id, b.price,
    json_group_array(json_object(
        'stop_id', s.stop_id, 
        'stop_name', s.stop_name, 
        'stop_order', s.stop_order, 
        'distance_from_start', s.distance_from_start
    )) AS stop_details
    FROM Buses b
    JOIN BusRoutes r ON r.route_id = b.route_id
    JOIN BusStops s ON s.route_id = r.route_id
    WHERE b.bus_id = ?
    GROUP BY b.bus_id, r.route_id, b.price
    `;
    return new Promise((resolve, reject) => {
        db.all(getStopsFromBusIdQ, [busId], (err, rows) => {
            if (err) {
                return reject(err);
            }
            rows.forEach(stop => {
                stop['stop_details'] = JSON.parse(stop['stop_details']);
            })
            resolve(rows);
        });
    });
};

const validateTripDetails = async (sourceId, destinationId, busId) => {
    const validateTripDetailsQ = `
    SELECT 
        b.bus_id, 
        b.price AS price_per_km, 
        s2.distance_from_start - s1.distance_from_start as total_distance, 
        (s2.distance_from_start - s1.distance_from_start) * b.price as fare
    FROM Buses b
    JOIN BusRoutes r ON b.route_id = r.route_id
    JOIN BusStops s1 ON s1.stop_id = ? AND s1.route_id = r.route_id
    JOIN BusStops s2 ON s2.stop_id = ? AND s2.route_id = r.route_id
    WHERE b.bus_id = ?
    AND s1.stop_order < s2.stop_order;
    `;
    return new Promise((resolve, reject) => {
        db.all(validateTripDetailsQ, [sourceId, destinationId, busId], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
};

module.exports = {
    getAllCity,
    getAllStopsForCity,
    getAllPossibleDestinationFromSource,
    getBustListForChoosenPath,
    getStopsFromBusId,
    validateTripDetails
};
