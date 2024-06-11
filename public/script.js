document.addEventListener('DOMContentLoaded', function () {
    const searchBtn = document.getElementById('search-btn');
    const locationBtn = document.getElementById('location-btn');
    //const historyBtn = document.getElementById('history-btn');
    const searchHistoryLink = document.querySelector('a[href="search-history.html"]');
    fetchAndUpdateHistory();

    console.log(locationBtn);
    searchBtn.addEventListener('click', fetchWeather);
    locationBtn.addEventListener('click', fetchWeatherByLocation);
    //historyBtn.addEventListener('click', fetchHistory);
    searchHistoryLink.addEventListener('click', fetchHistoryData);

    function fetchWeather() {
        const city = document.getElementById('city-input').value;
        const apiKey = 'f6735d935acb4414ac8114159243005'; // Replace with your weather API key
        const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                displayWeather(data);
                saveWeatherData(city, data); // Save weather data to the database
            })
            .catch(error => console.error('Error fetching weather data:', error));
    }

    function fetchWeatherByLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const apiKey = 'f6735d935acb4414ac8114159243005'; // Replace with your weather API key
                const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`;

                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        displayWeather(data);
                        saveWeatherData(data.location.name, data); // Save weather data to the database
                    })
                    .catch(error => console.error('Error fetching weather data:', error));
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }

    function displayWeather(data) {
        const weatherSection = document.getElementById('current-weather');
        weatherSection.innerHTML = `
            <h2>${data.location.name}, ${data.location.region}, ${data.location.country}</h2>
            <p>Local Time: ${data.location.localtime}</p>
            <p>Temperature: ${data.current.temp_c} °C</p>
            <p>Condition: ${data.current.condition.text}</p>
            <img src="${data.current.condition.icon}" alt="Weather Icon">
            <p>Wind: ${data.current.wind_kph} kph</p>
            <p>Humidity: ${data.current.humidity}%</p>
            <p>Pressure: ${data.current.pressure_mb} mb</p>
        `;
    }

    function saveWeatherData(city, data) {
        const temperature = data.current.temp_c;
        const condition = data.current.condition.text;
        const wind_speed = data.current.wind_kph;
        const humidity = data.current.humidity;
        const pressure = data.current.pressure_mb;

        fetch('/saveWeatherData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ city, temperature, condition, wind_speed, humidity, pressure })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(result => {
            console.log('Weather data saved:', result);
            fetchAndUpdateHistory(); // Fetch and display weather history after saving data
        })
        .catch(error => console.error('Error saving weather data:', error));
    }

    function fetchAndUpdateHistory(displayType = 'table') {
        fetch('/api/history')
          .then(response => response.json())
          .then(data => {
            const tableBody = document.getElementById('history-data');
            //tableBody.innerHTML = ''; // Clear existing content (optional)
      
            data.forEach(row => {
              const tableRow = document.createElement('tr');
              tableRow.innerHTML = `
                <td>${row.city}</td>
                <td>${row.temperature}</td>
                <td>${row.condition}</td>
                <td>${row.wind_speed}</td>
                <td>${row.humidity}</td>
                <td>${row.pressure}</td>
              `;
              tableBody.appendChild(tableRow);
            });
          })
          .catch(error => console.error('Error fetching history data:', error));
      }

      

        function fetchHistoryData(event) {
            // No need to prevent default behavior, just log the click
            console.log('Search history link clicked');
            fetchAndUpdateHistory();
        }

    
      
});


