// WeatherNow – script.js
// Uses OpenWeatherMap API to fetch live weather data
// Replace API_KEY below with your own free key from openweathermap.org

const API_KEY = "7fcd375b934d372ffb9143553cf77a8d";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// DOM elements
const cityInput   = document.getElementById("cityInput");
const searchBtn   = document.getElementById("searchBtn");
const weatherCard = document.getElementById("weatherCard");
const defaultPrompt = document.getElementById("defaultPrompt");
const loadingState  = document.getElementById("loadingState");
const weatherContent = document.getElementById("weatherContent");
const errorMsg    = document.getElementById("errorMsg");
const errorText   = document.getElementById("errorText");

// Update clock every second so the time shown is always current
function updateClock() {
  const now = new Date();
  const timeEl = document.getElementById("currentTime");
  const dateEl = document.getElementById("currentDate");

  if (!timeEl || !dateEl) return;

  timeEl.textContent = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  dateEl.textContent = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
setInterval(updateClock, 1000);

// Map weather condition codes to a body theme class
// Full list: https://openweathermap.org/weather-conditions
function getThemeClass(conditionId) {
  if (conditionId >= 200 && conditionId < 300) return "theme-thunder";
  if (conditionId >= 300 && conditionId < 400) return "theme-drizzle";
  if (conditionId >= 500 && conditionId < 600) return "theme-rain";
  if (conditionId >= 600 && conditionId < 700) return "theme-snow";
  if (conditionId >= 700 && conditionId < 800) return "theme-mist";
  if (conditionId === 800)                      return "theme-clear";
  if (conditionId > 800)                        return "theme-clouds";
  return "theme-default";
}

// Swap the body theme class so the background gradient changes smoothly
function applyTheme(conditionId) {
  const newTheme = getThemeClass(conditionId);
  // Remove any old theme-* class
  document.body.className = document.body.className
    .split(" ")
    .filter(c => !c.startsWith("theme-"))
    .join(" ");
  document.body.classList.add(newTheme);
}

// Show a dismissible error below the search bar
function showError(message) {
  errorText.textContent = message;
  errorMsg.classList.remove("hidden");
  weatherCard.classList.add("hidden");
  defaultPrompt.classList.add("hidden");

  // Auto-hide after 4 seconds
  setTimeout(() => {
    errorMsg.classList.add("hidden");
    if (weatherCard.classList.contains("hidden")) {
      defaultPrompt.classList.remove("hidden");
    }
  }, 4000);
}

// Fill all the UI elements with the data we got from the API
function renderWeather(data) {
  const {
    name,
    sys: { country },
    main: { temp, feels_like, humidity },
    wind: { speed },
    visibility,
    weather,
    id: conditionId,
  } = data;

  // Pull the first weather object (usually only one anyway)
  const weatherInfo = weather[0];

  document.getElementById("cityName").textContent    = name;
  document.getElementById("countryName").textContent = country;
  document.getElementById("temperature").textContent = Math.round(temp);
  document.getElementById("feelsLike").textContent   = `${Math.round(feels_like)}°C`;
  document.getElementById("humidity").textContent    = `${humidity}%`;
  document.getElementById("windSpeed").textContent   = `${(speed * 3.6).toFixed(1)} km/h`;

  // Visibility comes in metres – convert to km and cap display at 10km
  const visKm = (visibility / 1000).toFixed(1);
  document.getElementById("visibility").textContent  = `${visKm} km`;

  // Weather description with first letter capitalised
  document.getElementById("weatherDesc").textContent =
    weatherInfo.description.charAt(0).toUpperCase() + weatherInfo.description.slice(1);

  // OWM provides icon codes like "01d", "10n" etc.
  const iconUrl = `https://openweathermap.org/img/wn/${weatherInfo.icon}@2x.png`;
  document.getElementById("weatherIcon").src = iconUrl;
  document.getElementById("weatherIcon").alt = weatherInfo.description;

  // Change the background based on weather condition
  applyTheme(weatherInfo.id);

  // Start the clock for this card
  updateClock();
}

// The main fetch function – async/await keeps this clean and readable
async function fetchWeather(city) {
  // Show loading, hide everything else
  weatherCard.classList.remove("hidden");
  defaultPrompt.classList.add("hidden");
  errorMsg.classList.add("hidden");
  loadingState.classList.remove("hidden");
  weatherContent.classList.add("hidden");

  try {
    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);

    if (response.status === 401) {
      showError("Invalid API key. Please add your OpenWeatherMap API key in script.js.");
      weatherCard.classList.add("hidden");
      return;
    }

    if (response.status === 404) {
      showError(`"${city}" not found. Try a different city name.`);
      weatherCard.classList.add("hidden");
      return;
    }

    if (!response.ok) {
      showError("Something went wrong. Please try again later.");
      weatherCard.classList.add("hidden");
      return;
    }

    const data = await response.json();

    // Save to localStorage so the last city loads on next visit
    localStorage.setItem("lastCity", city);

    renderWeather(data);

    // Swap loading → content
    loadingState.classList.add("hidden");
    weatherContent.classList.remove("hidden");

  } catch (err) {
    // Network errors (no internet, DNS fail, etc.)
    showError("Network error. Please check your internet connection.");
    weatherCard.classList.add("hidden");
    console.error("Fetch error:", err);
  }
}

// Search on button click
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city.length === 0) return;
  fetchWeather(city);
});

// Search on Enter key
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city.length === 0) return;
    fetchWeather(city);
  }
});

// On first load, search the last city the user looked up (if any)
window.addEventListener("DOMContentLoaded", () => {
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity && API_KEY !== "YOUR_API_KEY_HERE") {
    cityInput.value = lastCity;
    fetchWeather(lastCity);
  }
});
