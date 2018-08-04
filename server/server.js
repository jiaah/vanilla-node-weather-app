const express = require('express');

require('dotenv').config()
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const myApi = require('./api-min.js');
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}
const port = process.env.PORT || 3000;

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

if (app.get('env') === 'production') {
    app.get('/', (req, res) => {
        res.redirect('https://jin827.github.io/jh-weather/');
    });
} else {
    app.use('/vendors', express.static('vendors'))
    app.use('/resources', express.static('resources'))
    // We neeed an absolute patht for sendFile
    // CWD = current working directory (the directory of the app)
    const CWD = process.cwd();
    app.get('/', (req, res) => {
        // Whenever we access / in the browser, we will get index.html back
        res.sendFile(`${CWD}/index.html`);
    })
}

app.post('/geolocation', (req, res) => {
    
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