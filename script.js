const viewer = new Cesium.Viewer('cesiumContainer')

viewer.scene.globe.enableLighting = true;
viewer.scene.globe.depthTestAgainstTerrain = false;

let userLat;
let userLon;

navigator.geolocation.getCurrentPosition(function(pos){

userLat = pos.coords.latitude;
userLon = pos.coords.longitude;

console.log("User location:", userLat, userLon);

});


async function trackSatellite(){

let name = document.getElementById("satellite").value.toLowerCase();

if(name === "iss"){

let response = await fetch(
"https://api.wheretheiss.at/v1/satellites/25544"
);

let data = await response.json();

document.getElementById("satName").innerHTML =
"Satellite: ISS";

document.getElementById("satSpeed").innerHTML =
"Speed: " + data.velocity + " km/h";

document.getElementById("satAltitude").innerHTML =
"Altitude: " + data.altitude + " km";

}

else if(name === "starlink"){

document.getElementById("satName").innerHTML =
"Satellite: Starlink";

document.getElementById("satSpeed").innerHTML =
"Speed: ~27000 km/h";

document.getElementById("satAltitude").innerHTML =
"Altitude: ~550 km";

}

else{

document.getElementById("satName").innerHTML =
"Satellite not found";

document.getElementById("satSpeed").innerHTML = "";
document.getElementById("satAltitude").innerHTML = "";

}

}

const tleLine1 =
"1 25544U 98067A   24091.51028935  .00016717  00000+0  10270-3 0  9993";

const tleLine2 =
"2 25544  51.6416  29.3543 0004253  63.2437  52.3568 15.50350927440723";

// STARLINK SATELLITE
const starlinkTLE1 =
"1 44713U 19074A   24091.42784722  .00001264  00000+0  10270-3 0  9990";

const starlinkTLE2 =
"2 44713  53.0000  29.3543 0001500  63.2437  52.3568 15.05500000 12345";

const starlinkSat = satellite.twoline2satrec(starlinkTLE1, starlinkTLE2);

const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

function updateSatellite(){

const now = new Date();

const positionAndVelocity =
satellite.propagate(satrec, now);

const positionEci = positionAndVelocity.position;

const gmst = satellite.gstime(now);

const positionGd =
satellite.eciToGeodetic(positionEci, gmst);

const longitude =
Cesium.Math.toDegrees(positionGd.longitude);

const latitude =
Cesium.Math.toDegrees(positionGd.latitude);

const height = positionGd.height * 1000;

console.log(latitude, longitude, height);

}

const satelliteEntity = viewer.entities.add({
name: "ISS",
position: Cesium.Cartesian3.fromDegrees(0,0,400000),
billboard:{
    image:"https://cdn-icons-png.flaticon.com/512/3212/3212608.png",
    scale: 1,
    pixelOffset: new Cesium.Cartesian2(0, -10),
    scaleByDistance: new Cesium.NearFarScalar(1.0e6, 0.3, 2.0e7, 0.05)
}
});
const starlinkEntity = viewer.entities.add({
name: "Starlink",
position: Cesium.Cartesian3.fromDegrees(0,0,400000),
billboard:{
    image:"https://cdn-icons-png.flaticon.com/512/3212/3212608.png",
    scale: 1,
    pixelOffset: new Cesium.Cartesian2(0, -10),
    scaleByDistance: new Cesium.NearFarScalar(1.0e6, 0.3, 2.0e7, 0.05)
}
});

viewer.camera.flyTo({
destination: Cesium.Cartesian3.fromDegrees(0, 20, 8000000)
});
viewer.trackedEntity = satelliteEntity;

setInterval(function(){

const now = new Date();

const pv = satellite.propagate(satrec, now);

if(!pv.position) return;

const positionEci = pv.position;

const gmst = satellite.gstime(now);

const positionGd =
satellite.eciToGeodetic(positionEci, gmst);

const longitude =
Cesium.Math.toDegrees(positionGd.longitude);

const latitude =
Cesium.Math.toDegrees(positionGd.latitude);

const height = positionGd.height * 1000;

satelliteEntity.position =
Cesium.Cartesian3.fromDegrees(
longitude,
latitude,
height
);
// UPDATE STARLINK POSITION

const pv2 = satellite.propagate(starlinkSat, now);


const positionEci2 = pv2.position;

const positionGd2 =
satellite.eciToGeodetic(positionEci2, gmst);

const longitude2 =
Cesium.Math.toDegrees(positionGd2.longitude);

const latitude2 =
Cesium.Math.toDegrees(positionGd2.latitude);

const height2 = positionGd2.height * 1000;

starlinkEntity.position =
Cesium.Cartesian3.fromDegrees(
longitude2,
latitude2,
height2
);
},1000);

