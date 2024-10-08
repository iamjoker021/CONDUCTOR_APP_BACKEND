const pool = require("../config/db");

const getStopsFromBusId = async (busId) => {
    const getStopsFromBusIdQ = `
    SELECT b.bus_id, r.route_id, b.price,
	jsonb_agg(jsonb_build_object(
		'stop_id', s.stop_id, 
		'stop_name', s.stop_name, 
		'stop_order', s.stop_order, 
		'distance_from_start', s.distance_from_start
	)) AS stop_details
    FROM bus_details.buses b
    JOIN bus_details.busroutes r ON r.route_id = b.route_id
    JOIN bus_details.busstops s ON s.route_id = r.route_id
    WHERE b.bus_id = $1
    GROUP BY 1, 2, 3
    `;
    const { rows } = await pool.query(getStopsFromBusIdQ, [busId]);
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
    getStopsFromBusId,
    validateTripDetails
}