export async function findeTreffpunkt(inputKoordinaten) {
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
  const [pt] = await sql.query(`SELECT osm.find_meeting_point('${karr}'::float[][]);`);
  console.log(pt);
  console.log(pt.find_meeting_point[0]);
  //return [lats/l, lons/l];
  return pt.find_meeting_point[0];
}
