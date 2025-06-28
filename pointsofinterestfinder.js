const fetch = require('node-fetch');

async function findPOIs(lat, lon, radius = 500) {
    const query = `
        [out:json];
        (
            node
                (around:${radius},${lat},${lon})
                [amenity];
        );
        out center;
    `;
    const url = 'https://overpass-api.de/api/interpreter';

    const response = await fetch(url, {
        method: 'POST',
        body: query,
        headers: { 'Content-Type': 'text/plain' }
    });

    if (!response.ok) {
        throw new Error(`Overpass API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.elements.map(elem => ({
        id: elem.id,
        lat: elem.lat,
        lon: elem.lon,
        tags: elem.tags
    }));
}

// Example usage:
// findPOIs(52.5200, 13.4050).then(console.log).catch(console.error);

//module.exports = { findPOIs };