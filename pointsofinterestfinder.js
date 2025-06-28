// No import needed; fetch is available globally in Node.js 18+

export async function findPOIs(lat, lon, radius = 10000) {
    const query = `
        [out:json];
        (
            node
                (around:${radius},${lat},${lon})
                [tourism~"^(attraction|museum|gallery|viewpoint|zoo|theme_park|aquarium|castle|monument|artwork|picnic_site|yes)$"]
                [name];
            way
                (around:${radius},${lat},${lon})
                [tourism~"^(attraction|museum|gallery|viewpoint|zoo|theme_park|aquarium|castle|monument|artwork|picnic_site|yes)$"]
                [name];
            relation
                (around:${radius},${lat},${lon})
                [tourism~"^(attraction|museum|gallery|viewpoint|zoo|theme_park|aquarium|castle|monument|artwork|picnic_site|yes)$"]
                [name];
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
        lat: elem.lat || (elem.center && elem.center.lat),
        lon: elem.lon || (elem.center && elem.center.lon),
        tags: elem.tags
    }));
}

// Example usage:
// findPOIs(52.5200, 13.4050).then(console.log).catch(console.error);

//module.exports = { findPOIs };