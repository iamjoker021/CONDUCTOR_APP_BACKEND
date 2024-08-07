const express = require('express');
const swagger = require('./config/swagger');
const busStopRouter = require('./router/busStopRouter');
const { authRouter, verifyToken } = require('./router/authRouter');

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.json('App is running'));
swagger(app);

app.use('/api/bus-route', busStopRouter);
app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));