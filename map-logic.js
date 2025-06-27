import { findeTreffpunkt } from './treffpunktfinder.js';

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

// const popup = L.popup()
//     .setLatLng([51.513, -0.09])
//     .setContent('I am a standalone popup.')
//     .openOn(map);

const db_url = "postgresql://student:woshooyaefohshe0eegh8uSh5sa5pi3y@ep-tiny-king-a2lusfpk.eu-central-1.aws.neon.tech/dbis2?sslmode=require";

function addCoordinate() {
    const latInput = document.getElementById('coordinate-input-lat').value;
    const lonInput = document.getElementById('coordinate-input-lon').value;
    
    if (!latInput || !lonInput) {
        console.error('Please enter both latitude and longitude.');
        return;
    } else {   
        const lat = parseFloat(latInput);
        const lon = parseFloat(lonInput);
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

function zeigeTreffpunkt() {
    console.log("Button gecklicked");
    // const marker = L.marker(, { icon: blueIcon })).addTo(map)
    // .bindPopup('<b>Hier ist der Treffpunkt!</b>').openPopup();

    const chooseninput = L.circleMarker(findeTreffpunkt(choosenCoordinates), {
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

window.zeigeTreffpunkt = zeigeTreffpunkt;
window.addCoordinate = addCoordinate;