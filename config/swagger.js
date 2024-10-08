require('dotenv').config();
const path = require('node:path');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: "Conductor App",
        version: "0.0.0",
        description: "This is backend api for Conducotr App",
      },
      servers: [
        {
          url: "http://localhost:3000/api",
        },
        {
          url: process.env.HOST_SERVER_URL
        }
      ],
    },
    apis: [path.join(__dirname, '../docs/*.yaml')],
};

const specs = swaggerJsdoc(options)

module.exports = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
}