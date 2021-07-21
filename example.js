const sunPosition=require('./sun.js').sunPosition;
const sunRiseSet=require('./sun.js').sunRiseSet;
const time2string=require('./sun.js').time2string;

const nowDate = new Date(); 
const latitude = 53.87;     // Ludinovo
const longitude = 34.44;    // Ludinovo

const sunRS = sunRiseSet(nowDate, latitude, longitude)
const sunPos = sunPosition(nowDate, latitude, longitude);
 
console.log ('Sunrise in the city of Lyudinovo ' + time2string(sunRS.sun.rise));
console.log ('Sunset in the city of Lyudinovo ' + time2string(sunRS.sun.set));
console.log ('Morning twilight ' + time2string(sunRS.twilight.rise));
console.log ('Evening Twilight ' + time2string(sunRS.twilight.set));

console.log ('Azimuth ' + sunPos.azimuth);
console.log ('Altitude ' + sunPos.altitude);

