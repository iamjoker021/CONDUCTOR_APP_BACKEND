const express = require('express');
const busStopRouter = require('./router/busStopRouter');
const swagger = require('./config/swagger');

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.json('App is running'));
swagger(app);

app.use('/api/bus-route', busStopRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));