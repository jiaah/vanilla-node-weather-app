
const express = require('express');

// if (process.env.NODE_ENV !== 'production') { require('dotenv').config() }
require('dotenv').config()
const cors = require('cors')
const bodyParser = require('body-parser');
const request = require('request');

const app = express();

const port = process.env.PORT || 3000;

const myApi = require('./api.js');

const corsOptions = {
  origin: true,
  optionsSuccessStatus: 200 
}

app.use(cors());
app.options('*',cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.post('/', (req, res) => {
    
    return myApi.getUserlocation(req.body)
        .then(data => myApi.getWeatherData(data))
        .then(data => res.status(201).json(data))
        .catch(err => res.status(400).json(err)) 
});


app.post('/search', (req, res) => {
    
    return myApi.getCoordinatesForCity(req.body.city)
        .then(myApi.getWeatherData)
        .then(data => res.status(201).json(data))
        .catch(err => res.status(400).json(err))  
});


app.listen(port, () => {
   console.log('Server is up!');
 });

console.log("NODE_ENV : " + process.env.NODE_ENV + " mode");

