import { findeTreffpunkt, findeTreffpunktPhysDist } from './treffpunktfinder.js';

var southWest = L.latLng(40, 10), northEast = L.latLng(60, 12);
var bounds = L.latLngBounds(southWest, northEast);

const map = L.map('map', {
    maxBounds: bounds,
    maxBoundsViscosity: 1.0,
    zoomControl: false
}).setView([51.505, 10.00], 6);

//map.dragging.disable();
//map.scrollWheelZoom.disable();

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// const marker = L.marker([51.5, 10.09]).addTo(map)
//      .bindPopup('<b>Hello world!</b><br />I am a popup.').openPopup();

// const circle = L.circle([51.508, 10.10], {
//     color: 'red',
//     fillColor: '#f03',
//     fillOpacity: 0.5,
//     radius: 500
// }).addTo(map).bindPopup('I am a circle.');

const polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map).bindPopup('I am a polygon.');

const choosenCoordinates = [];
const choosenFilters = {
    see : true,
    kino : false,
    bahnhof : false,
};

// const popup = L.popup()
//     .setLatLng([51.513, -0.09])
//     .setContent('I am a standalone popup.')
//     .openOn(map);

const db_url = "postgresql://student:woshooyaefohshe0eegh8uSh5sa5pi3y@ep-tiny-king-a2lusfpk.eu-central-1.aws.neon.tech/dbis2?sslmode=require";

function addCity() {
    const cityInput = document.getElementById('city-input').value;
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

    // popup.setLatLng(e.latlng)
    //     .setContent(`You clicked the map at ${e.latlng.toString()}`)
    //     .openOn(map);

    console.log('Augewaehlte Koordinaten: ' + choosenCoordinates);
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
    // const marker = L.marker(, { icon: blueIcon })).addTo(map)
    // .bindPopup('<b>Hier ist der Treffpunkt!</b>').openPopup();
    const point = await findeTreffpunktPhysDist(choosenCoordinates, choosenFilters)
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

map.on('click', onMapClick);

window.zeigeTreffpunkt = await zeigeTreffpunkt;
window.addCoordinate = addCoordinate;
window.addCity = addCity;