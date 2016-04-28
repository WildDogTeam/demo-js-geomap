var Wilddog = require('wilddog');
var geoFireUtils = require('./geoFireUtils');
//APPID换成你的App的id
var ref = new Wilddog("https://APPID.wilddogio.com");
var delRef = new Wilddog("https://APPID.wilddogio.com/beijing/delivery");
var geoRef = new Wilddog("https://APPID.wilddogio.com/_geofire");	
//更换成你的超级密钥
ref.onAuth(function(authData){
  
	if(authData){
		return;	
	}
	ref.authWithCustomToken("你的超级密钥", function(error, authData) {

		if (error) {
		    console.log("Login Failed!", error);
		} else {}

	});
})
	
var baseX1 = 116.310528;
var baseX2 = 116.458843;
var baseY1 = 39.856513;	
var baseY2 = 39.963431;
var num1 = 20;
var num2 = 7;
var intervalX = (baseX2 - baseX1) / num1;
var intervalY = (baseY2 - baseY1) / num1;
var moveDistanceX = intervalX / num2;	
var moveDistanceY = intervalY / num2;
var compareX;
var compareY;	


function randomCoordinateChange(){
	//产生X(0-20) Y(0-20)
	var randomX = Math.floor(Math.random()*num1);
	var randomY = Math.floor(Math.random()*num1);
	//避免碰撞
	if (randomX == compareX && randomY == compareY) {
		randomX = (randomX + 1) % num1;
		randomY = (randomY + 1) % num1;
    }
	compareX = randomX;
	compareY = randomY;

	var X = randomX < 10 ? '0' + randomX : '' + randomX;
	var Y = randomY < 10 ? '0' + randomY : '' + randomY;
	var randomDirection = Math.floor(Math.random()*4);
	var randomRef = delRef.child(X + Y);
	var geohashRef = geoRef.child('beijing:' + X + Y);
	switch(randomDirection)
		{
		case 0:
			//north
			randomRef.once('value',function(snapshot){
				var latitudeNow = snapshot.child('lat').val();
				var longitudeNow = snapshot.child('lng').val();
				var latitudeNew = latitudeNow + moveDistanceY;
				if(latitudeNew > baseY2){return;}
				var geoLocation = getGeofire(latitudeNew,longitudeNow);	
				randomRef.child('lat').set(latitudeNew);
				geohashRef.set(geoLocation);
			});
			break;
		case 1:
			//south
			randomRef.once('value',function(snapshot){
				var latitudeNow = snapshot.child('lat').val();
				var longitudeNow = snapshot.child('lng').val();
				var latitudeNew = latitudeNow - moveDistanceY;
				if(latitudeNew < baseY1){return;}
				var geoLocation = getGeofire(latitudeNew,longitudeNow);			
				randomRef.child('lat').set(latitudeNew);
				geohashRef.set(geoLocation);
			});
			break;
		case 2:
			//east
			randomRef.once('value',function(snapshot){
				var latitudeNow = snapshot.child('lat').val();
				var longitudeNow = snapshot.child('lng').val();
			 	var longitudeNew = longitudeNow + moveDistanceX;
				if(longitudeNew > baseX2){return;}
				var geoLocation = getGeofire(latitudeNow,longitudeNew);				
				randomRef.child('lng').set(longitudeNew);
				geohashRef.set(geoLocation);
			});
			break;
		case 3:
			//west
			randomRef.once('value',function(snapshot){
				var latitudeNow = snapshot.child('lat').val();
				var longitudeNow = snapshot.child('lng').val();
				var longitudeNew = longitudeNow - moveDistanceX;
				if(longitudeNew < baseX1){return;}
				var geoLocation = getGeofire(latitudeNow,longitudeNew);					
				randomRef.child('lng').set(longitudeNew);
				geohashRef.set(geoLocation);
			});
			break;
		}
};

function getGeofire(lat, lng){
	var latLng = new Array(lat,lng); 
	var geohash = geoFireUtils.encodeGeohash(latLng);
	var geoLocation = {'g':geohash,
	   'l':{'0':lat,
		'1':lng
		}
	};
	return geoLocation;
};

var randomMove = setInterval(randomCoordinateChange, 300);

