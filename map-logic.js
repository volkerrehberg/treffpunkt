import { findeTreffpunkt, findeTreffpunktPhysDist } from './treffpunktfinder.js';
import { findPOIs } from './pointsofinterestfinder.js';

var southWest = L.latLng(20, -20), northEast = L.latLng(80, 30);
var bounds = L.latLngBounds(southWest, northEast);

const map = L.map('map', {
    maxBounds: bounds,
    maxBoundsViscosity: 0.2,
    zoomControl: false
}).setView([51.505, 10.00], 6);

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map).bindPopup('I am a polygon.');

const choosenCoordinates = [];
const choosenFilters = {
    see: true,
    kino: false,
    bahnhof: false,
};

const db_url = "postgresql://student:woshooyaefohshe0eegh8uSh5sa5pi3y@ep-tiny-king-a2lusfpk.eu-central-1.aws.neon.tech/dbis2?sslmode=require";

window.addCity = function (button) {
    const cityInput = button.parentElement.querySelector('input[name="city-input"]').value;
    if (!cityInput) {
        console.error('Please enter a city name.');
        return;
    }
    getCoordinatesForCity(cityInput).then(coordinates => {
        if (coordinates) {
            const [lat, lon] = coordinates;
            console.log('Adding city coordinates: ' + lat + ', ' + lon);
            choosenCoordinates.push([lat, lon]);
            const chooseninput = L.marker([lat, lon]).addTo(map)
                .bindPopup(`Ausgangspunkt gesetzt: ${cityInput}`).openPopup();
            console.log('Augewaehlte Koordinaten: ' + choosenCoordinates);
        } else {
            console.error('Could not find coordinates for the city: ' + cityInput);
        }
    });
}

function toggleFilter(checkbox) {
    const name = checkbox.name;
    if (choosenFilters.hasOwnProperty(name)) {
        choosenFilters[name] = checkbox.checked;
        console.log(`Filter geändert: ${name} = ${checkbox.checked}`);
        console.log(choosenFilters);
    } else {
        console.warn(`Unbekannter Filter: ${name}`);
    }
};

async function getCoordinatesForCity(cityName) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`;
    try {
        const response = await fetch(url, {
            headers: {
                'Accept-Language': 'de'
            }
        });
        const data = await response.json();
        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            return [lat, lon];
        } else {
            console.error('City not found');
            return null;
        }
    } catch (error) {
        console.error('Error fetching city coordinates:', error);
        return null;
    }
}

function parseCoordinate(input) {
    // Check for DMS format (e.g. 51°30'30"N or 10 30 30 E)
    const dmsRegex = /^(-?\d+)[°\s]+(\d+)[\'\s]+(\d+(?:\.\d+)?)[\"\s]*([NSEW])?$/i;
    const match = input.trim().match(dmsRegex);
    if (match) {
        let deg = parseFloat(match[1]);
        let min = parseFloat(match[2]);
        let sec = parseFloat(match[3]);
        let dir = match[4] ? match[4].toUpperCase() : null;
        let dec = Math.abs(deg) + min / 60 + sec / 3600;
        if (deg < 0) dec = -dec;
        if (dir === 'S' || dir === 'W') dec = -Math.abs(dec);
        return dec;
    }
    // Try to parse as float
    const floatVal = parseFloat(input);
    if (!isNaN(floatVal)) return floatVal;
    return NaN; // Invalid input
}

function addCoordinate() {
    const latInput = document.getElementById('coordinate-input-lat').value;
    const lonInput = document.getElementById('coordinate-input-lon').value;

    if (!latInput || !lonInput) {
        console.error('Please enter both latitude and longitude.');
        return;
    } else {
        const lat = parseCoordinate(latInput);
        const lon = parseCoordinate(lonInput);
        if (isNaN(lat) || isNaN(lon)) {
            console.error('Invalid latitude or longitude values.');
            return;
        } else {
            console.log('Adding coordinate: ' + lat + ', ' + lon);

            choosenCoordinates.push([lat, lon]);
            const chooseninput = L.marker([lat, lon]).addTo(map)
                .bindPopup('Ausgangspunkt gesetzt').openPopup();
            console.log('Augewaehlte Koordinaten: ' + choosenCoordinates);
        }
    }
}

async function add_point(lon, lat) {
    const sql = N.neon(db_url);
    const pt = await sql.query(`SELECT meinetestfunktion(${lon},${lat});`);
    console.log(pt);
}

function onMapClick(e) {
    console.log("Map clicked at: " + e.latlng.toString());
    choosenCoordinates.push([e.latlng.lat, e.latlng.lng]);

    const chooseninput = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map)
        .bindPopup('Ausgangspunkt gesetzt').openPopup();

    console.log('Adding coordinate: ' + e.latlng.lat + ', ' + e.latlng.lng);

    console.log('Augewaehlte Koordinaten: ' + choosenCoordinates);

    // input feld füllen
    const cityInputs = document.querySelectorAll('input[name="city-input"]');
    for (let input of cityInputs) {
        if (!input.value.trim()) {
            input.value = `Lat ${e.latlng.lat.toFixed(4)}, Lon ${e.latlng.lng.toFixed(4)}`;
            break;
        }
    }
}


const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [50, 55],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

async function zeigeTreffpunkt() {
    console.log("Button gecklicked");

    const tp = await findeTreffpunkt(choosenCoordinates, choosenFilters);
    var point = await findeTreffpunktPhysDist(choosenCoordinates, choosenFilters);
    if (tp.length > 0) {
        point = tp[0].position;
        for (let i = 0; i < tp.length; i++) {
            const chooseninput = L.circleMarker(tp[i].position, {
                radius: 10,
                color: 'green',       // Randfarbe
                fillColor: 'green',   // Füllfarbe
                fillOpacity: 0.8
            })
                .addTo(map)
                .bindPopup('<b>Hier ist ein möglicher Treffpunkt!</b>')
                .openPopup();

            await findandplotPOIs(tp[i].position);
        }
    } else {
        const chooseninput = L.circleMarker(point, {
            radius: 10,
            color: 'green',       // Randfarbe
            fillColor: 'green',   // Füllfarbe
            fillOpacity: 0.8
        })
            .addTo(map)
            .bindPopup('<b>Hier ist der Treffpunkt!</b>')
            .openPopup();
    }
}

async function findandplotPOIs(point) {
    var radius = 5000;
    var num_pois = 0;
    var pois = null;
    while (num_pois < 5) {
        pois = await findPOIs(point[0], point[1], radius);
        num_pois = pois.length;
        console.log(`Gefundene POIs im Radius von ${radius}m:`, num_pois);
        radius += 2000;
    }

    for (let i = 0; i < 5; i++) {
        if (pois[i]) {
            const poi = pois[i];
            const yellowStarIcon = L.divIcon({
                className: 'custom-star-icon',
                html: `<div style="
                    background: yellow;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid #FFD700;
                    box-shadow: 0 0 4px #888;
                ">
                    <svg width="20" height="20" viewBox="0 0 20 20">
                        <polygon points="10,2 12.4,7.5 18.3,7.6 13.6,11.5 15.2,17.2 10,13.8 4.8,17.2 6.4,11.5 1.7,7.6 7.6,7.5" fill="#FFD700" stroke="#B8860B" stroke-width="1"/>
                    </svg>
                </div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });
            const poiMarker = L.marker([poi.lat, poi.lon], { icon: yellowStarIcon }).addTo(map)
                .bindPopup(`<b>${poi.tags.name || poi.tags.amenity || 'POI'}</b><br>Lat: ${poi.lat}, Lon: ${poi.lon}`)
                .openPopup();
        }
    }

    console.log('Gefundene POIs:', pois, pois.length);
}


function hinzufuegenCityBlock() {
    const container = document.getElementById("city-container");

    const block = document.createElement("div");
    block.className = "city-block flex flex-wrap items-center gap-2";

    block.innerHTML = `
      <label class="font-medium whitespace-nowrap">City:</label>
      <input type="text" name="city-input" class="flex-grow min-w-0 p-2 border rounded" />
      <button onclick="addCity(this)" class="shrink-0 bg-black text-white py-2 px-3 rounded hover:bg-gray-800">
        Hinzufügen
      </button>
      <button onclick="removeCity(this)" class="shrink-0 bg-red-600 text-white py-2 px-3 rounded hover:bg-red-700">
        X
      </button>
    `;

    container.appendChild(block);
}

window.removeCity = function (button) {

    // Seite neu laden statt Block entfernen
    window.location.reload();

    // const block = button.closest('.city-block');
    // if (block) {
    //     block.remove();
    // } else {
    //     console.warn('Kein .city-block Element gefunden zum Entfernen.');
    // }
};


map.on('click', onMapClick);

window.zeigeTreffpunkt = await zeigeTreffpunkt;
window.hinzufuegenCityBlock = hinzufuegenCityBlock;
window.addCoordinate = addCoordinate;
window.addCity = addCity;
window.removeCity = removeCity;
window.toggleFilter = toggleFilter;

