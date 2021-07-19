const time2string = module.exports.time2string = (arg) => {
  var str ='--:--';
  if (typeof arg == 'number') {
    const timehours = Math.floor(arg / 60);
    const timeminutes = arg - 60 * timehours;
    str = String(timehours) + ':' + String(timeminutes).padStart(2, '0');
  } else if (Object.prototype.toString.call(arg) === "[object Date]"){
    str = arg.toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit'})    
  }
  return str;
}

const sunRiseSet = module.exports.sunRiseSet = (date, latitude, longitude) => {
/*
Source:
	Almanac for Computers, 1990
	published by Nautical Almanac Office
	United States Naval Observatory
	Washington, DC 20392
*/

  const sunZenith = 90.83333;
  const twilightZenith = 96;
    
  const TrueL = (M) => {
    const L = M + (1.916 * Math.sin(DegToRad(M))) + (0.020 * Math.sin(DegToRad(2 * M))) + 282.634;
    return L >= 360 ? L-360 : L < 0 ? L+360 : L;
  }
  const RightAscension = (L) => {
    const RA = Math.atan(0.91764 * Math.tan(L * Math.PI / 180)) * 180 / Math.PI;
    return (RA + ((90 * Math.floor(L / 90)) - (90 * Math.floor(RA / 90))))/15;
  }
  const DegToRad = (arg) => Math.PI * arg / 180;
  const ToUT = (T, lngHour) => {
    const UT = T - lngHour;
    return UT < 0 ? UT+24 : UT >= 24 ? UT-24 : UT;
  }

// Convert local date to UTC
  const da=date.getUTCDate(), mo=date.getUTCMonth()+1, ya=date.getUTCFullYear();
// calculate the day of the year
  const n = Math.floor(275 * mo / 9) - (Math.floor((mo + 9) / 12) * (1 + Math.floor((ya - 4 * Math.floor(ya / 4) + 2) / 3))) + da - 30;
  // convert the longitude to hour value and calculate an approximate time
  const lngHour = longitude / 15
  const trise = n + ((6 - lngHour) / 24);
  const tset = n + ((18 - lngHour) / 24);
// calculate the Sun's mean anomaly
  const mrise = (0.9856 * trise) - 3.289;
  const mset = (0.9856 * tset) - 3.289;
// calculate the Sun's true longitude
  const lrise = TrueL(mrise);
  const lset = TrueL(mset);
// calculate the Sun's right ascension
  const RArise = RightAscension(lrise);
  const RAset = RightAscension(lset);
// calculate the Sun's declination
  const sinDecrise = 0.39782 * Math.sin(DegToRad(lrise));
  const cosDecrise = Math.cos(Math.asin(sinDecrise));
  const sinDecset = 0.39782 * Math.sin(DegToRad(lset));
  const cosDecset = Math.cos(Math.asin(sinDecset));
// calculate the Sun's local hour angle
  const calcBoundary = (zenith) => {
    var res = {
      rise: undefined,
      set: undefined,
      dayTime: undefined, 
    }
    const cosHrise = (Math.cos(DegToRad(zenith)) - (sinDecrise * Math.sin(DegToRad(latitude)))) / (cosDecrise * Math.cos(DegToRad(latitude)));
    const cosHset = (Math.cos(DegToRad(zenith)) - (sinDecset * Math.sin(DegToRad(latitude)))) / (cosDecset * Math.cos(DegToRad(latitude)));

    if(cosHrise >= -1 && cosHrise <= 1) {
      const Hrise = (360 - 180 * Math.acos(cosHrise) / Math.PI) / 15;
      const Hset = (180 * Math.acos(cosHrise) / Math.PI) / 15;
      const Trise = Hrise + RArise - (0.06571 * trise) - 6.622;
      const Tset = Hset + RAset - (0.06571 * tset) - 6.622;

      const UTrise = ToUT(Trise, lngHour);
      const UTrisehour = Math.floor(UTrise);
      const UTriseminutes = Math.floor((UTrise - UTrisehour) * 60);
      res.rise = new Date(date);
      res.rise.setUTCHours(UTrisehour, UTriseminutes, 0);
 
      const UTset = ToUT(Tset, lngHour);
      const UTsethour = Math.floor(UTset);
      const UTsetminutes = Math.floor((UTset - UTsethour) * 60);
      res.set = new Date(date);
      res.set.setUTCHours(UTsethour, UTsetminutes, 0)
      res.dayTime = UTsethour < UTrisehour ? (24 * 60 - (UTrisehour * 60 + UTriseminutes)) + (UTsethour * 60 + UTsetminutes) : (24 * 60 - (UTrisehour * 60 + UTriseminutes)) - (24 * 60 - (UTsethour * 60 + UTsetminutes))
      return res;
    }
  }
  return {sun: calcBoundary(sunZenith), twilight: calcBoundary(twilightZenith)}
}

const sunPosition = module.exports.sunPosition = (date, latitude, longitude) => {
/*
Calculating the sun's azimuth and its altitude above the horizon at any time at the point with given coordinates is on the agenda. 
We calculate azimuth from the north in a clockwise direction. 
Source:
  Used this algorithm: http://stjarnhimlen.se/comp/tutorial.html
  Thanks to Paul Schlyter, Stockholm, Sweden. email: pausch@stjarnhimlen.se or WWW: http://stjarnhimlen.se/
*/
  const to360range = (arg) => arg > 360 ? arg - Math.floor(arg / 360) * 360 : arg < 0 ? arg + (Math.floor(-arg / 360) + 1) * 360 : arg;

// Convert local date to UTC
  const da=date.getUTCDate(), mo=date.getUTCMonth()+1, ya=date.getUTCFullYear();
  const ut=date.getUTCHours() + date.getUTCMinutes() / 60;
//The time scale used here is a "day number" from 2000 Jan 0.0 TDT, which is the same as 1999 Dec 31.0 TDT, i.e. precisely at midnight TDT at the start of the last day of this century. With the modest accuracy we strive for here, one can usually disregard the difference between TDT (formerly canned ET) and UT.
//We can also compute d directly from the calendar date like this:
  const d = 367 * ya - Math.floor((7 * (ya + (Math.floor((mo + 9) / 12)))) / 4) + Math.floor((275 * mo) / 9) + da - 730530;
  const w = 282.9404 + 4.70935 * Math.pow(10, -5) * d;    //longitude of perihelion
  const a = 1.000000;                                     //mean distance, a.u.
  const e = 0.016709 - 1.151 * Math.pow(10, -9) * d;      //eccentricity
  const M = to360range(356.0470 + 0.9856002585 * d);      //mean anomaly
  const oblecl = 23.4393 - 3.563 * Math.pow(10, -7) * d;  //obliquity of the ecliptic
  const L = to360range(w + M);                            //mean longitude
  const E = M + (180 / Math.PI) * e * Math.sin(M * Math.PI / 180) * (1 + e * Math.cos(M * Math.PI / 180));  //eccentric anomaly
//rectangular coordinates in the plane of the ecliptic, where the X axis points towards the perihelion
  let x = Math.cos(E * Math.PI / 180) - e;
  let y = Math.sin(E * Math.PI / 180) * Math.sqrt(1 - e * e);
  const r = Math.sqrt(x * x + y * y);
  const v = (180 / Math.PI) * Math.atan2(y, x);
  const lon = to360range(v + w);
//ecliptic rectangular coordinates
  x = r * Math.cos(lon * Math.PI / 180);
  y = r * Math.sin(lon * Math.PI / 180);
  let z = 0.0;
//rotate to equatorial coordinates
  const xequat = x;
  const yequat = y * Math.cos(oblecl * Math.PI / 180) + z * Math.sin(oblecl * Math.PI / 180);
  const zequat = y * Math.sin(oblecl * Math.PI / 180) + z * Math.cos(oblecl * Math.PI / 180);
//convert to RA and Declination
  const RA = (180 / Math.PI) * Math.atan2(yequat, xequat);
  const Decl = (180 / Math.PI) * Math.asin(zequat / r);
//Sidereal Time at the Greenwich meridian at 00:00 right now
  const GMST0 = L / 15 + 12;
  let SIDTIME = GMST0 + ut + longitude / 15;
  SIDTIME = SIDTIME - 24 * Math.floor(SIDTIME / 24);
//hour angle
  const HA = to360range(15 * (SIDTIME - RA / 15));
  x = Math.cos(HA * Math.PI / 180) * Math.cos(Decl * Math.PI / 180);
  y = Math.sin(HA * Math.PI / 180) * Math.cos(Decl * Math.PI / 180);
  z = Math.sin(Decl * Math.PI / 180);
  const xhor = x * Math.sin(latitude * Math.PI / 180) - z * Math.cos(latitude * Math.PI / 180);
  const yhor = y;
  const zhor = x * Math.cos(latitude * Math.PI / 180) + z * Math.sin(latitude * Math.PI / 180);
  return {
    azimuth : zhor >= 0 ? Math.ceil(to360range(Math.atan2(yhor, xhor) * (180 / Math.PI) + 180)*100)/100 : '--',
    altitude : zhor >= 0 ? Math.ceil(Math.asin(zhor) * (180 / Math.PI)*100)/100 : '--'
  }
}

//dt=new Date()
//console.log(sunRiseSet(dt, 54.55, 36.25))
//console.log(sunPosition(dt, 54.55, 36.25));

