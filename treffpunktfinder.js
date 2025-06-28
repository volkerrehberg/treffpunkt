export async function findeTreffpunkt(inputKoordinaten, filters) {
  console.log('Suche treffpunkt zu input koordinaten: ' + inputKoordinaten);
  let lats = 0;
  let lons = 0;
  const l = inputKoordinaten.length;
  let karr = "{";
  for(let i=0; i < l; i++) {
    lats += inputKoordinaten[i][0];
    lons += inputKoordinaten[i][1];
    karr += `{${inputKoordinaten[i][0]}, ${inputKoordinaten[i][1]}}`;
    if (i < l-1) {
      karr += ',';
    }
  }
  karr += "}";
  const db_url = "postgresql://hackathon:oadeingaedai5EDash3i@ep-tiny-king-a2lusfpk.eu-central-1.aws.neon.tech/dbis2?sslmode=require&channel_binding=require";
  const sql = N.neon(db_url);
  const [pt] = await sql.query(`SELECT * from osm.find_meeting_point('${karr}'::float[][], ifilterlake := ${filters.see}, ifiltercine := ${filters.kino});`);
  console.log(pt);
  let res = Array(pt.onames.length);
  for (let i=0; i < pt.onames.length; i++) {
    res[i] = {name: pt.onames[i], position: pt.olatlons[i]};
  }
  // return pt.olatlons[0];
  return res;
}

export async function findeTreffpunktPhysDist(inputKoordinaten, inputFilter) {
  console.log('Berechne physikalischen Treffpunkt für Koordinaten: ' + inputKoordinaten);
  const l = inputKoordinaten.length;
  let x = 0, y = 0, z = 0;

  for (let i = 0; i < l; i++) {
    const lat = inputKoordinaten[i][0] * Math.PI / 180;
    const lon = inputKoordinaten[i][1] * Math.PI / 180;
    x += Math.cos(lat) * Math.cos(lon);
    y += Math.cos(lat) * Math.sin(lon);
    z += Math.sin(lat);
  }

  x /= l;
  y /= l;
  z /= l;

  const hyp = Math.sqrt(x * x + y * y);
  const avgLat = Math.atan2(z, hyp) * 180 / Math.PI;
  const avgLon = Math.atan2(y, x) * 180 / Math.PI;

  return [avgLat, avgLon];
}
