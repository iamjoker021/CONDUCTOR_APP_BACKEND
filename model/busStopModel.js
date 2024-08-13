const { db } = require("../config/db_sqlite/db");

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
    getStopsFromBusId,
    validateTripDetails
};
