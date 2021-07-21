const sunPosition=require('./sun.js').sunPosition;
const sunRiseSet=require('./sun.js').sunRiseSet;
const time2string=require('./sun.js').time2string;

const nowDate = new Date();
const latitude = 54.55;     // Kaluga
const longitude = 36.25;

const sunRS = sunRiseSet(nowDate, latitude, longitude)
const sunPos = sunPosition(nowDate, latitude, longitude);
 
console.log ('Sunrise ' + time2string(sunRS.sun.rise));
console.log ('Sunset ' + time2string(sunRS.sun.set));
console.log ('Twilight morning ' + time2string(sunRS.twilight.rise));
console.log ('Twilight evening ' + time2string(sunRS.twilight.set));

console.log ('Azimuth ' + sunPos.azimuth);
console.log ('altitude ' + sunPos.altitude);

