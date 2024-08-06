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

module.exports = {
    getAllCity,
    getAllStopsForCity,
    getAllPossibleDestinationFromSource
}