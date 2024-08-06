const { Router } = require("express");
const busStopController = require("../controller/busStopController");

const busStopRouter = Router();

/**
 * @swagger
 * /city:
 *   get:
 *     summary: Retrieve a list of cities
 *     description: Retrieve a list of all cities where bus stops are available.
 *     responses:
 *       200:
 *         description: A list of cities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 city_list:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: New York
 *       500:
 *         description: Unable to receive City List
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Unable to receive City List
 *                 error:
 *                   type: string
 *                   example: error details
 */

busStopRouter.get('/city', busStopController.getAllCity)

module.exports = busStopRouter;