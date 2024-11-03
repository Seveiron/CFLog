const apiKey = 'C137e689e1444f8b8b985521240311'; // Replace with your actual WeatherAPI key
const timeZoneApiKey = 'NO2C0O6VLND9'; // Replace with your actual Timezone API key

document.getElementById('capture-location').addEventListener('click', captureLocation);
document.getElementById('save-entry').addEventListener('click', saveEntry);

async function captureLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            document.getElementById('gps-coordinates').value = `${latitude}, ${longitude}`;
            await fetchWeatherData(latitude, longitude);
            await fetchLocalTime(latitude, longitude);
        }, error => {
            console.error('Error capturing location:', error);
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
}

async function fetchWeatherData(latitude, longitude) {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}&aqi=no`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        document.getElementById('temperature').innerText = data.current.temp_f + ' °F';
        document.getElementById('wind-speed').value = data.current.wind_mph;
        document.getElementById('weather-condition').value = data.current.condition.text;
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

async function fetchLocalTime(latitude, longitude) {
    try {
        const response = await fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=${timeZoneApiKey}&format=json&by=position&lat=${latitude}&lng=${longitude}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const localTime = data.formatted.slice(11, 16); // Extracting time (HH:MM)
        document.getElementById('time').value = convertTo12HourFormat(localTime);
    } catch (error) {
        console.error('Error fetching local time:', error);
    }
}

function convertTo12HourFormat(time) {
    let [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
}

function saveEntry() {
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const vessel = document.getElementById('vessel').value;
    const captain = document.getElementById('captain').value;
    const location = document.getElementById('location').value;
    const gpsCoordinates = document.getElementById('gps-coordinates').value;
    const temperature = document.getElementById('temperature').innerText;
    const windSpeed = document.getElementById('wind-speed').value;
    const weatherCondition = document.getElementById('weather-condition').value;
    const catchType = document.getElementById('catch-type').value;
    const weight = document.getElementById('weight').value;
    const size = document.getElementById('size').value;
    const notes = document.getElementById('notes').value;

    const logEntry = {
        date,
        time,
        vessel,
        captain,
        location,
        gpsCoordinates,
        temperature,
        windSpeed,
        weatherCondition,
        catchType,
        weight,
        size,
        notes
    };

    const logs = JSON.parse(localStorage.getItem('logs')) || [];
    logs.push(logEntry);
    localStorage.setItem('logs', JSON.stringify(logs));
    displayLogHistory();
    clearForm();
}

function displayLogHistory() {
    const logs = JSON.parse(localStorage.getItem('logs')) || [];
    const logHistoryContainer = document.getElementById('log-history');
    logHistoryContainer.innerHTML = ''; // Clear existing logs

    logs.forEach(log => {
        const logEntryDiv = document.createElement('div');
        logEntryDiv.className = 'bg-gray-700 p-4 rounded-lg mb-4';
        logEntryDiv.innerHTML = `
            <h3 class="font-bold">Date: ${log.date}, Time: ${log.time}</h3>
            <p><strong>Vessel:</strong> ${log.vessel}</p>
            <p><strong>Captain:</strong> ${log.captain}</p>
            <p><strong>Location:</strong> ${log.location}</p>
            <p><strong>GPS Coordinates:</strong> ${log.gpsCoordinates}</p>
            <p><strong>Temperature:</strong> ${log.temperature}</p>
            <p><strong>Wind Speed:</strong> ${log.windSpeed} mph</p>
            <p><strong>Weather Condition:</strong> ${log.weatherCondition}</p>
            <p><strong>Catch Type:</strong> ${log.catchType}</p>
            <p><strong>Weight:</strong> ${log.weight} lbs</p>
            <p><strong>Size:</strong> ${log.size}</p>
            <p><strong>Notes:</strong> ${log.notes}</p>
        `;
        logHistoryContainer.appendChild(logEntryDiv);
    });
}

function clearForm() {
    document.getElementById('entry-form').reset();
    document.getElementById('temperature').innerText = 'N/A';
    document.getElementById('wind-speed').value = '';
    document.getElementById('weather-condition').value = '';
    document.getElementById('gps-coordinates').value = '';
}

// Initial display of log history
displayLogHistory();
