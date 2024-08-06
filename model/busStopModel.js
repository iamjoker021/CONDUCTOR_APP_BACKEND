const pool = require("../config/db");

const getAllCity = async () => {
    const { rows } = await pool.query('SELECT * FROM bus_details.cities');
    return rows;
}

module.exports = {
    getAllCity
}