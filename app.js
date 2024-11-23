require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const Task = require('./models/Task')

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'))
app.use("/auth", require("./routes/auth"));

//mongodb+srv://<db_username>:<db_password>@taskmanager.8zpj4.mongodb.net/?retryWrites=true&w=majority&appName=TaskManager

mongoose.connect(process.env.MONGO_URI)
    .then(() => { console.log('Connected to DB') })
    .catch((err) => { console.error('cannot connect to db', err) });

app.get('/', (req, res) => {
    res.send('hello Page')
})

app.use('/tasks', require('./routes/tasks'))

app.listen(PORT, () => { console.log(`Server running on http://localhost:${PORT}`); });