const pool = require("../config/db");

const getAllCity = async () => {
    const { rows } = await pool.query('SELECT * FROM bus_details.cities');
    return rows;
}

const getAllStopsForCity = async (cityId) => {
    const getAllStopByCityQ = `
    SELECT s.stop_id, s.stop_name 
    FROM bus_details.busstops s
    JOIN bus_details.busroutes r ON r.route_id = s.route_id
    WHERE city_id = $1
    `;
    const { rows } = await pool.query(getAllStopByCityQ, [cityId]);
    return rows;
}

const getAllPossibleDestinationFromSource = async (sourceId) => {
    const getAllPossibleDestinationFromSourceQ = `
    SELECT route_id, stop_id, stop_name
    FROM bus_details.busstops
    WHERE route_id IN (SELECT route_id FROM bus_details.busstops WHERE stop_id = $1)
    AND stop_id <> $1
    `;
    const { rows } = await pool.query(getAllPossibleDestinationFromSourceQ, [sourceId]);
    return rows;
}

const getBustListForChoosenPath = async (sourceId, destinationId) => {
    const getBustListForChoosenPathQ = `
    SELECT 
        b.bus_id, 
        b.price AS price_per_km, 
        s2.distance_from_start - s1.distance_from_start as total_distance, 
        (s2.distance_from_start - s1.distance_from_start) * b.price as fare
    FROM bus_details.buses b
    JOIN bus_details.busroutes r ON b.route_id = r.route_id
    JOIN bus_details.busstops s1 ON r.route_id = s1.route_id
    JOIN bus_details.busstops s2 ON r.route_id = s2.route_id
    WHERE s1.stop_id = $1
    AND s2.stop_id = $2
    AND s1.stop_order < s2.stop_order;
    `;
    const { rows } = await pool.query(getBustListForChoosenPathQ, [sourceId, destinationId]);
    return rows;
}

const validateTripDetails = async (sourceId, destinationId, busId) => {
    const validateTripDetailsQ = `
    SELECT 
        b.bus_id, 
        b.price AS price_per_km, 
        s2.distance_from_start - s1.distance_from_start as total_distance, 
        (s2.distance_from_start - s1.distance_from_start) * b.price as fare
    FROM bus_details.buses b
    JOIN bus_details.busroutes r ON b.route_id = r.route_id
    JOIN bus_details.busstops s1 ON s1.stop_id = $1 AND s1.route_id = r.route_id
    JOIN bus_details.busstops s2 ON s2.stop_id = $2 AND s2.route_id = r.route_id
    WHERE b.bus_id = $3
    AND s1.stop_order < s2.stop_order;
    `;
    const { rows } = await pool.query(validateTripDetailsQ, [sourceId, destinationId, busId]);
    return rows;
}

module.exports = {
    getAllCity,
    getAllStopsForCity,
    getAllPossibleDestinationFromSource,
    getBustListForChoosenPath,
    validateTripDetails
}