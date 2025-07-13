const cityCoords = {
  "Delhi": [28.6139, 77.2090],
  "Mumbai": [19.0760, 72.8777],
  "Kolkata": [22.5726, 88.3639],
  "Chennai": [13.0827, 80.2707],
  "Bengaluru": [12.9716, 77.5946],
  "Hyderabad": [17.3850, 78.4867],
  "Ahmedabad": [23.0225, 72.5714],
  "Pune": [18.5204, 73.8567],
  "Jaipur": [26.9124, 75.7873],
  "Lucknow": [26.8467, 80.9462],
  "Kanpur": [26.4499, 80.3319],
  "Nagpur": [21.1458, 79.0882],
  "Bhopal": [23.2599, 77.4126],
  "Patna": [25.5941, 85.1376],
  "Surat": [21.1702, 72.8311],
  "Ranchi": [23.3441, 85.3096],
  "Raipur": [21.2514, 81.6296],
  "Thiruvananthapuram": [8.5241, 76.9366],
  "Coimbatore": [11.0168, 76.9558],
  "Vishakhapatnam": [17.6868, 83.2185],
  "Chandigarh": [30.7333, 76.7794],
  "Guwahati": [26.1445, 91.7362]
};

let selectedCities = [];
const map = L.map('map').setView([22.9734, 78.6569], 5.2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add city markers
for (let city in cityCoords) {
  const marker = L.marker(cityCoords[city]).addTo(map).bindPopup(city);
  marker.on('click', () => handleCityClick(city, cityCoords[city]));
}

function handleCityClick(cityName, coords) {
  if (selectedCities.length === 2) {
    selectedCities = [];
    map.eachLayer(layer => {
      if (layer._icon && !layer._popup) map.removeLayer(layer); // remove car
      if (layer instanceof L.Polyline && !layer._popup) map.removeLayer(layer); // remove line
    });
  }

  selectedCities.push({ name: cityName, coords });

  if (selectedCities.length === 2) {
    drawPathAndAnimate(selectedCities[0], selectedCities[1]);
  }
}

function drawPathAndAnimate(from, to) {
  const line = L.polyline([from.coords, to.coords], { color: 'blue' }).addTo(map);
  const carMarker = L.marker(from.coords, {
    icon: L.divIcon({ className: 'car', html: '🚗' })
  }).addTo(map);

  const steps = 200;
  let i = 0;

  const latDiff = (to.coords[0] - from.coords[0]) / steps;
  const lngDiff = (to.coords[1] - from.coords[1]) / steps;

  function moveCar() {
    if (i < steps) {
      const newLat = from.coords[0] + latDiff * i;
      const newLng = from.coords[1] + lngDiff * i;
      carMarker.setLatLng([newLat, newLng]);
      i++;
      requestAnimationFrame(moveCar);
    }
  }

  moveCar();
}
