
(function () {
 
    const app = document.querySelector('#app');

    const cityForm = app.querySelector('.city-form');
    const cityInput = cityForm.querySelector('.city-input');

    const conHeader = app.querySelector('.contents-header');
    const currentSummary = app.querySelector('.current-summary');
    const currentRight = app.querySelector('.current-right');
    const currentLeft = app.querySelector('.current-left');
    const dailyList = app.querySelector('.daily-list');

    const weatherData = [
        ['clear-day', 'day-sunny'], 
        ['clear-night', 'night-clear'], 
        ['rain', 'rain'], 
        ['snow', 'snow'], 
        ['sleet', 'sleet'], 
        ['wind', 'windy'], 
        ['fog', 'fog'], 
        ['cloudy', 'cloudy'], 
        ['partly-cloudy-day', 'day-cloudy'], 
        ['partly-cloudy-night', 'night-partly-cloudy'], 
        ['hail', 'hail'], 
        ['thunderstorm', 'thunderstorm'], 
        ['tornado', 'tornado']
    ];
    
    function getCurrentWeatherIcon(icon) {

        const wIcon = document.createElement('li');
        wIcon.innerHTML = '<i></i>';
        wIcon.setAttribute('id', 'c-icon');
        currentSummary.appendChild(wIcon);
   
        weatherData.forEach(i => {
            if ( icon === i[0] ) {
                return wIcon.setAttribute('class', `wi wi-${i[1]}`);
            }
        })
    }

    function displayCurrentWeather(result) {

        const {
            apparentTemperature,
            pressure,
            humidity,
            summary,
            temperature,
            uvIndex,
            windSpeed,
            visibility
        } = result.weather;

        const headerData = [
            [conHeader,'H3', result.cityName, ' '], 
            [conHeader, 'li',summary, ' '], 
            [currentSummary, 'li', temperature + ' °C', 'w-temperature'], 
        ];

        const currentData = [
            [currentLeft,'FEELS LIKE', apparentTemperature, ' °'], 
            [currentLeft, 'HUMIDITY', humidity, ' %'], 
            [currentLeft, 'WIND', windSpeed, ' Km/h'], 
            [currentRight, 'UV INDEX', uvIndex, ' of 10'], 
            [currentRight, 'PRESSURE', pressure, ' hPa'],
            [currentRight, 'VISIBILITY', visibility, ' Km'],
        ];

        // div .contents-header && .current-summary
        headerData.forEach(i => {
        
            const d = document.createElement(i[1]);
            d.appendChild(document.createTextNode(i[2]));
            d.setAttribute('class', i[3]);
            i[0].appendChild(d);
        })

        // div .current-list
        currentData.forEach(i => {
       
            const d = document.createElement('li');
            d.innerHTML = `<span class="current-span">${i[1]}</span> <br>` + `${i[2]}` + `${i[3]}`;
            i[0].appendChild(d);
        })

        // weather list border line
        document.getElementById('current-list').style.borderTop = "1px solid #333";
        document.getElementById('current-list').style.borderBottom = "1px solid #333";
    }

    function getDates(unixTime) {
        
        // Convert Unix Time
        const timeStamp = unixTime
        const d = new Date(timeStamp * 1000)
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saterday', 'Sunday']

        const dayName = days[d.getDay()]

        // To get 'Mon', 'Tue'..
        //const dayName = d.toString().split(' ')[0];

        const date = document.createElement('li');
        date.appendChild(document.createTextNode(dayName));

        dailyList.appendChild(date);
    }

    function getDailyWeatherIcon(icon) {

        const dIcon = document.createElement('li');
        dIcon.innerHTML = '<i></i>';
        dIcon.setAttribute('id', 'd-icon');
        dailyList.appendChild(dIcon);

        weatherData.forEach(i => {
            if ( icon === i[0] ) {
                return dIcon.setAttribute('class', `wi wi-${i[1]}`);
            }
        })
    }

    function displayDailySummary(result) {

        const dailyWeather = result.daily
            .map(data => {
                return {
                    time: data.time,
                    icon: data.icon,
                    tempMax: data.apparentTemperatureMax,
                    tempMin: data.apparentTemperatureMin
                }
            })
            .forEach(data => {

                getDates(data.time);
                getDailyWeatherIcon(data.icon);

                // div .daily-list
                const tempData = [
                    [dailyList, 'li', data.tempMax, 'max-temp'], 
                    [dailyList,'li', data.tempMin, 'min-temp']  
                ];
        
                tempData.forEach(i => {
                
                    const d = document.createElement(i[1]);
                    d.appendChild(document.createTextNode(i[2]));
                    d.setAttribute('class', i[3]);
                    i[0].appendChild(d);
                })
            })
    }

    function getBackgroundImgByTemperature(result) {

        const {
            temperature
        } = result.weather;

        const backgroundImg = document.getElementById('section-weather');

        if (temperature > 20) {
            return backgroundImg.style.backgroundImage = "url('resources/img/clear-sky.png')";
        }
        if (temperature > 0) {
            return backgroundImg.style.backgroundImage = "url('resources/img/cloud.png')";
        }
        if (temperature <= 0) {
            return backgroundImg.style.backgroundImage = "url('resources/img/snow-min.jpg')";
        }

    }

    function xhrPostRequest(cityInfo) {
        
        return new Promise(function(resolve, reject) {
        
            const xhr = new XMLHttpRequest();
            
            xhr.open("POST", cityInfo.url, true);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject(Error(xhr.statusText));
                }
            };
            xhr.onerror = function () {
                reject(Error("Network Error"));
            };
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.send(cityInfo.data);
        
        })
        
    }

    function getUserPosition() {
   
        return new Promise(function (resolve, reject) {
            const options = {
                timeout: 7000,
                maximumAge: 0
              };

            navigator.geolocation.getCurrentPosition(resolve, reject, options);
            
            function reject (err) {
                alert("Oops! There is a problem with Geolocation API connection. Please use the website search engine.");
                console.warn(`ERROR(${err.code}): ${err.message}`);
            } 
        });
        
    }

    function displayWeather(result) {
        console.log('result: ', result);

        const classes = [cityInput, conHeader, currentSummary, currentRight, currentLeft, dailyList];
        const data = JSON.parse(result);
        
        // clear the input box && the weather contents for new search
        classes.forEach(i => i.innerHTML = '');
    
        const promises = [
            getCurrentWeatherIcon(data.weather.icon),
            displayCurrentWeather(data),
            displayDailySummary(data),
            getBackgroundImgByTemperature(data)
        ]
        Promise.all(promises)
    }
    
    function geolocationService() {
        
        getUserPosition()
            .then(result => { 
                const data = JSON.stringify({
                    "lat": result.coords.latitude,
                    "lng": result.coords.longitude
                })
                return {
                    data: data,
                    url: "http://localhost:3000/"
                } ;
            })
            .then(xhrPostRequest)
            .then(displayWeather)
            .catch(error => console.log("Something went wrong!"))
    }
 
    geolocationService();
    
    /* --- Search EventListener --- */
    cityForm.addEventListener('submit', function (e) {
        
        e.preventDefault();

        const city = cityInput.value;
        const data = JSON.stringify({"city" : city});
        const obj = {
            data: data,
            url: "http://localhost:3000/search"
        } 

        if (!city) {
            alert("Please enter a city name")
        } else {   
            xhrPostRequest(obj)
                .then(displayWeather)
                .catch(error => console.log("Something went wrong!"))
        }
    });

})();
