export function findeTreffpunkt(inputKoordinaten) {
    console.log('Suche treffpunkt zu input koordinaten: ' + inputKoordinaten);
  let lats = 0;
  let lons = 0;
  const l = inputKoordinaten.length;
  for(let i=0; i < l; i++) {
    lats += inputKoordinaten[i][0];
    lons += inputKoordinaten[i][1];
  }
  return [lats/l, lons/l];
}
