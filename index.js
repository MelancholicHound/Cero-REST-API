const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')

const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');

const app = express();
const ports = process.env.port || 3000;

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/auth', authRoutes);

app.use(errorController.get404);
app.use(errorController.get500);

app.listen(ports, () => console.log(`Listening to port ${ports}`));