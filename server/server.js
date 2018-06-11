const request = require('request');
const express = require('express');

require('dotenv').config()
const cors = require('cors')
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();
const myApi = require('./api.js');

const port = process.env.PORT || 3000;

const corsOptions = {
  origin: true,
  optionsSuccessStatus: 200 
}

app.use(cors());
app.options('*',cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/vendors', express.static('vendors'))
app.use('/resources', express.static('resources'))

// We neeed an absolute patht for sendFile
// CWD = current working directory (the directory of the app)
const CWD = process.cwd();

// set a GET route on /
app.get('/', (req, res) => {
    // Whenever we access / in the browser, we will get index.html back
    res.sendFile(`${CWD}/index.html`);
})

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

app.use('/', (err, req, res, next) => {
    res.status(err.status || 500).send(err.message || 'INTERNAL SERVER ERROR');
});
 
app.listen(port, () => {
    console.log(`Server running on ${port}/`);
});