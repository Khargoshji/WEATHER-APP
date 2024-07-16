const apiKey = '7061cc978ece70d37d16e44e0f3890f0'; // OpenWeatherMap API key
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const unitToggle = document.getElementById('unit-toggle');
const unitLabel = document.getElementById('unit-label');
const currentWeather = document.getElementById('current-weather');
const forecastWeather = document.getElementById('forecast-weather');

let isCelsius = true;

searchBtn.addEventListener('click', () => getWeatherByCity(cityInput.value));
locationBtn.addEventListener('click', getWeatherByGeolocation);
unitToggle.addEventListener('change', () => {
    isCelsius = !isCelsius;
    unitLabel.textContent = isCelsius ? '°C' : '°F';
    updateTemperatureDisplay();
});

async function getWeatherByCity(city) {
    if (!city) {
        alert('Please enter a city name');
        return;
    }
    
    try {
        const currentData = await fetchWeatherData(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const forecastData = await fetchWeatherData(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
        
        displayWeather(currentData, forecastData);
    } catch (error) {
        handleError(error);
    }
}

function getWeatherByGeolocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            try {
                const currentData = await fetchWeatherData(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
                const forecastData = await fetchWeatherData(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
                
                displayWeather(currentData, forecastData);
            } catch (error) {
                handleError(error);
            }
        }, error => {
            console.error("Error getting location:", error);
            alert("Unable to retrieve your location. Please enter a city name.");
        });
    } else {
        alert("Geolocation is not supported by your browser. Please enter a city name.");
    }
}

async function fetchWeatherData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

function displayWeather(currentData, forecastData) {
    displayCurrentWeather(currentData);
    displayForecast(forecastData);
}

function displayCurrentWeather(data) {
    const temperature = convertTemperature(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;

    currentWeather.innerHTML = `
        <h2>${data.name}</h2>
        <img src="http://openweathermap.org/img/wn/${icon}.png" alt="${description}">
        <p>Temperature: <span class="temperature">${temperature}</span></p>
        <p>Description: ${description}</p>
    `;
}

function displayForecast(data) {
    forecastWeather.innerHTML = '';
    
    const dailyForecasts = data.list.reduce((acc, forecast) => {
        const date = new Date(forecast.dt * 1000).toDateString();
        if (!acc[date]) {
            acc[date] = forecast;
        }
        return acc;
    }, {});

    Object.values(dailyForecasts).slice(1, 6).forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const icon = forecast.weather[0].icon;
        const temp = convertTemperature(forecast.main.temp);

        const forecastElement = document.createElement('div');
        forecastElement.classList.add('forecast-day');
        forecastElement.innerHTML = `
            <p>${dayName}</p>
            <img src="http://openweathermap.org/img/wn/${icon}.png" alt="${forecast.weather[0].description}">
            <p class="temperature">${temp}</p>
        `;
        forecastWeather.appendChild(forecastElement);
    });
}

function convertTemperature(celsius) {
    if (isCelsius) {
        return `${celsius.toFixed(1)}°C`;
    } else {
        const fahrenheit = (celsius * 9/5) + 32;
        return `${fahrenheit.toFixed(1)}°F`;
    }
}

function updateTemperatureDisplay() {
    document.querySelectorAll('.temperature').forEach(el => {
        const tempValue = parseFloat(el.textContent);
        if (isCelsius) {
            el.textContent = `${((tempValue - 32) * 5/9).toFixed(1)}°C`;
        } else {
            el.textContent = `${(tempValue * 9/5 + 32).toFixed(1)}°F`;
        }
    });
}

function handleError(error) {
    console.error('Error fetching weather data:', error);
    currentWeather.innerHTML = '<p>An error occurred. Please try again later.</p>';
    forecastWeather.innerHTML = '';
}