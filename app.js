require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => {console.log('Connected to DB')})
.catch((err) => {console.error('cannot connect to db',err)});

app.get('/',(req,res) => {
    res.send('hello Page')
})

app.listen(PORT, () => { console.log(`Server running on http://localhost:${PORT}`); });