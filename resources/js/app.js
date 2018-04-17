
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
    

    /* --- Display Current Weather Icon --- */
    function getCurrentIcon(icon) {

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


    /* --- Display Current Weather Data --- */
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

        // <div class="contents-header"></div> && <div class="current-summary"></div>
        headerData.forEach(i => {
        
            const d = document.createElement(i[1]);
            d.appendChild(document.createTextNode(i[2]));
            d.setAttribute('class', i[3]);
            i[0].appendChild(d);
        })

        // <div class="current-list"></div>
        currentData.forEach(i => {
       
            const d = document.createElement('li');
            d.innerHTML = `<span class="current-span">${i[1]}</span> <br>` + `${i[2]}` + `${i[3]}`;
            i[0].appendChild(d);
        })


        // weather list border line
        document.getElementById('current-list').style.borderTop = "1px solid #333";
        document.getElementById('current-list').style.borderBottom = "1px solid #333";
    }


    /* --- Display Dates --- */
    function getDayNames(unixTime) {
        
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


    /* --- Display Daily Weather Icon --- */
    function getDailyIcon(icon) {

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


    /* --- Display Daily Weather Data --- */
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

                getDayNames(data.time);
                getDailyIcon(data.icon);

                // <div class="daily-list"></div>
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


    /* --- Get Background Image by Temperature --- */
    function getBackground(result) {

        const {
            temperature
        } = result.weather;

        const backgroundImg = document.getElementById('section-weather');

        if (temperature > 20) {
            return backgroundImg.style.backgroundImage = "url('resources/css/img/clear-sky.png')";
        }
        if (temperature > 0) {
            return backgroundImg.style.backgroundImage = "url('resources/css/img/cloud.png')";
        }
        if (temperature <= 0) {
            return backgroundImg.style.backgroundImage = "url('resources/css/img/snow.jpg')";
        }

    }

    

    /* --- XMLhttprequest --- */
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


    /* --- Get Users Position --- */
    function getUserPosition() {
   
        return new Promise(function (resolve, reject) {
            const options = {
                timeout: 7000,
                maximumAge: 0
              };

            navigator.geolocation.getCurrentPosition(resolve, reject, options);
            
            function reject (err) {
                alert("Oops! geolocation failed!");
                console.warn(`ERROR(${err.code}): ${err.message}`);
            } 
        });
        
    }

    /* --- Call Display Weather Functions --- */
    function displayWeather(result) {
        
        const classes = [cityInput, conHeader, currentSummary, currentRight, currentLeft, dailyList];
        const data = JSON.parse(result);
        
        // clear the input box && the weather contents for new search
        classes.forEach(i => i.innerHTML = '');
    
        const promises = [
            getCurrentIcon(data.weather.icon),
            displayCurrentWeather(data),
            displayDailySummary(data),
            getBackground(data)
        ]
        Promise.all(promises)
    }
    
    
    /* --- Confirm Geo Location Service With Users --- */
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
 

    /* --- Call Alert Box on Page Load to Confirm Geo Location Service --- */
    geolocationService();
    
    /* --- Search EventListener --- */
    cityForm.addEventListener('submit', function (e) {
        e.preventDefault(); // prevent the form from submitting

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
// wrapping the code in an IIFE to prevent it from polluting the global scope
