import { findeTreffpunkt } from './treffpunktfinder.js';

var southWest = L.latLng(49, 10), northEast = L.latLng(52, 12);
var bounds = L.latLngBounds(southWest, northEast);

const map = L.map('map', {
    maxBounds: bounds,
    maxBoundsViscosity: 1.0,
    zoomControl: false
}).setView([51.505, 10.00], 13);

//map.dragging.disable();
//map.scrollWheelZoom.disable();

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const marker = L.marker([51.5, 10.09]).addTo(map)
    .bindPopup('<b>Hello world!</b><br />I am a popup.').openPopup();

const circle = L.circle([51.508, 10.10], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map).bindPopup('I am a circle.');

const polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map).bindPopup('I am a polygon.');

const popup = L.popup()
    .setLatLng([51.513, -0.09])
    .setContent('I am a standalone popup.')
    .openOn(map);

const db_url = "postgresql://student:woshooyaefohshe0eegh8uSh5sa5pi3y@ep-tiny-king-a2lusfpk.eu-central-1.aws.neon.tech/dbis2?sslmode=require";

async function add_point(lon, lat) {
    const sql = N.neon(db_url);
    const pt = await sql.query(`SELECT meinetestfunktion(${lon},${lat});`);
    console.log(pt);
}

function onMapClick(e) {
    console.log($("#name").val());
    popup.setLatLng(e.latlng)
        .setContent(`You clicked the map at ${e.latlng.toString()}`)
        .openOn(map);
    console.log(e.latlng);
    add_point(e.latlng.lng, e.latlng.lat);
}

function zeigeTreffpunkt() {
    console.log("Button gecklicked");
    //const marker = L.marker([51.5, 10.30]).addTo(map)
    const marker = L.marker(findeTreffpunkt()).addTo(map)

    .bindPopup('<b>Hier ist der Treffpunkt!</b>').openPopup();
    // popup.setLatLng(e.latlng)
    //     .setContent(`You clicked the map at ${e.latlng.toString()}`)
    //     .openOn(map);
    // console.log(e.latlng);
    // add_point(e.latlng.lng, e.latlng.lat);
}

map.on('click', onMapClick);

window.zeigeTreffpunkt = zeigeTreffpunkt; 