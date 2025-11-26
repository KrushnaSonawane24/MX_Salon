function toRad(d){ return d * Math.PI / 180 }
function haversineKm(a, b){
  const R = 6371
  const dLat = toRad((b.lat||0) - (a.lat||0))
  const dLon = toRad((b.lng||0) - (a.lng||0))
  const lat1 = toRad(a.lat||0)
  const lat2 = toRad(b.lat||0)
  const sinDLat = Math.sin(dLat/2)
  const sinDLon = Math.sin(dLon/2)
  const h = sinDLat*sinDLat + Math.cos(lat1)*Math.cos(lat2)*sinDLon*sinDLon
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h))
  return R * c
}
module.exports = { haversineKm }
