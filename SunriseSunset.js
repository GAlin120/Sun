/*
Source:
	Almanac for Computers, 1990
	published by Nautical Almanac Office
	United States Naval Observatory
	Washington, DC 20392
*/

var year=2021, month = 7, day = 14;
var latitude = 54.55, longitude=36.25;
var zenith = 90.83333;
var UTCoffset = 3;

function TrueL(M) {
  var L = M + (1.916 * Math.sin(DegToRad(M))) + (0.020 * Math.sin(DegToRad(2 * M))) + 282.634;
  if(L >= 360) 
    L -= 360;
  else if(L < 0) 
    L += 360;
  return L;
}
function RightAscension(L) {
  var RA = Math.atan(0.91764 * Math.tan(L * Math.PI / 180)) * 180 / Math.PI;
  var LQuadrant = 90 * Math.floor(L / 90);
  var RQuadrant = 90 * Math.floor(RA / 90);
  RA = RA + (LQuadrant - RQuadrant);
  return RA / 15;
}
function DegToRad(arg) { return Math.PI * arg / 180; }
function ToUT(T, lngHour) {
  var UT = T - lngHour;
  if (UT < 0)
     UT += 24;
  else if (UT >= 24)
     UT -= 24;
  return UT;
}

// calculate the day of the year
var n = Math.floor(275 * month / 9) - (Math.floor((month + 9) / 12) * (1 + Math.floor((year - 4 * Math.floor(year / 4) + 2) / 3))) + day - 30;
// convert the longitude to hour value and calculate an approximate time
var lngHour = longitude / 15
var trise = n + ((6 - lngHour) / 24);
var tset = n + ((18 - lngHour) / 24);
// calculate the Sun's mean anomaly
var mrise = (0.9856 * trise) - 3.289;
var mset = (0.9856 * tset) - 3.289;
// calculate the Sun's true longitude
var lrise = TrueL(mrise);
var lset = TrueL(mset);
// calculate the Sun's right ascension
var RArise = RightAscension(lrise);
var RAset = RightAscension(lset);
// calculate the Sun's declination
var sinDecrise = 0.39782 * Math.sin(DegToRad(lrise));
var cosDecrise = Math.cos(Math.asin(sinDecrise));
var sinDecset = 0.39782 * Math.sin(DegToRad(lset));
var cosDecset = Math.cos(Math.asin(sinDecset));
// calculate the Sun's local hour angle
var cosHrise = (Math.cos(DegToRad(zenith)) - (sinDecrise * Math.sin(DegToRad(latitude)))) / (cosDecrise * Math.cos(DegToRad(latitude)));
var cosHset = (Math.cos(DegToRad(zenith)) - (sinDecset * Math.sin(DegToRad(latitude)))) / (cosDecset * Math.cos(DegToRad(latitude)));



var riseTime = "";
var setTime = "";
var riseTimeLocal = "";
var setTimeLocal = "";
var trueNoon = "";
var daytime = ""
if(cosHrise >= -1 && cosHrise <= 1) {
  var Hrise = (360 - 180 * Math.acos(cosHrise) / Math.PI) / 15;
  var Hset = (180 * Math.acos(cosHrise) / Math.PI) / 15;
  var Trise = Hrise + RArise - (0.06571 * trise) - 6.622;
  var Tset = Hset + RAset - (0.06571 * tset) - 6.622;
  var UTrise = ToUT(Trise, lngHour);
  var UTset = ToUT(Tset, lngHour);
  var UTrisehour = Math.floor(UTrise);
  var UTriseminutes = Math.floor((UTrise - UTrisehour) * 60);
  riseTime = UTrisehour + ":" + (UTriseminutes < 10 ? "0" + UTriseminutes : UTriseminutes);
  var UTsethour = Math.floor(UTset);
  var UTsetminutes = Math.floor((UTset - UTsethour) * 60);
  setTime = UTsethour + ":" + (UTsetminutes < 10 ? "0" + UTsetminutes : UTsetminutes);
  var daytimeValue = 0;
  if(UTsethour < UTrisehour) 
    daytimeValue = (24 * 60 - (UTrisehour * 60 + UTriseminutes)) + (UTsethour * 60 + UTsetminutes);
  else 
    daytimeValue = (24 * 60 - (UTrisehour * 60 + UTriseminutes)) - (24 * 60 - (UTsethour * 60 + UTsetminutes));
  var daytimehours = Math.floor(daytimeValue / 60);
  var daytimeminutes = daytimeValue - 60 * daytimehours;
  daytime = daytimehours + ":" + (daytimeminutes < 10 ? "0" + daytimeminutes : daytimeminutes);
  console.log(daytime)
  var halfdayValue = Math.floor(daytimeValue / 2);
  var halfdayhours = Math.floor(halfdayValue / 60);
  var halfdayminutes = halfdayValue - 60 * halfdayhours;
  var UTrisetotalminutes = UTrisehour * 60 + UTriseminutes + UTCoffset * 60;
  var UTsettotalminutes = UTsethour * 60 + UTsetminutes + UTCoffset * 60;
  if(UTrisetotalminutes > 24 * 60) UTrisetotalminutes -= 24 * 60;
  if(UTrisetotalminutes < 0) UTrisetotalminutes += 24 * 60;
  UTrisehour = Math.floor(UTrisetotalminutes / 60);
  UTriseminutes = UTrisetotalminutes % 60;
  riseTimeLocal = UTrisehour + ":" + (UTriseminutes < 10 ? "0" + UTriseminutes : UTriseminutes);
  var trueNoonHours = UTrisehour + halfdayhours;
  var trueNoonMinutes = UTriseminutes + halfdayminutes;
  if(trueNoonMinutes >= 60) {
    trueNoonMinutes -= 60;
    trueNoonHours++;
  }
  if(trueNoonHours >= 24) trueNoonHours -= 24;
  trueNoon = trueNoonHours + ":" + (trueNoonMinutes < 10 ? "0" + trueNoonMinutes : trueNoonMinutes);
  if(UTsettotalminutes > 24 * 60) UTsettotalminutes -= 24 * 60;
  if(UTsettotalminutes < 0) UTsettotalminutes += 24 * 60;
  UTsethour = Math.floor(UTsettotalminutes / 60);
  UTsetminutes = UTsettotalminutes % 60;
  setTimeLocal = UTsethour + ":" + (UTsetminutes < 10 ? "0" + UTsetminutes : UTsetminutes);
}
 
console.log(riseTimeLocal, setTimeLocal)

