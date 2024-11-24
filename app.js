require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/auth', require('./routes/auth'));

// Ensure correct MONGO_URI
mongoose.connect(process.env.MONGO_URI, { tls: true })
    .then(() => {
        console.log('Connected to DB');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Cannot connect to db', err);
    });

app.get('/', (req, res) => {
    res.send('hello Page');
});

app.use('/tasks', require('./routes/tasks'));
