//map variable
var map;

// Set the center as Wilddog HQ
var locations = {
  "WilddogHQ": [39.897614,116.408032],
  "Caltrain": [39.897614,116.408032]
};
var center = locations["WilddogHQ"];

// Query radius
var radiusInKm = 1.5;

// Get a reference to the Wilddog public transit open data set
var transitWilddogRef = new Wilddog("https://geomap.wilddogio.com/")

// Create a new WildGeo instance, pulling data from the public transit data
var wildGeo = new WildGeo(transitWilddogRef.child("_geofire"));

/*************/
/*  GEOQUERY */
/*************/
// Keep track of all of the deliverys currently within the query
var deliverysInQuery = {};

// Create a new GeoQuery instance
var geoQuery = wildGeo.query({
  center: center,
  radius: radiusInKm
});

/* Adds new delivery markers to the map when they enter the query */
geoQuery.on("key_entered", function(deliveryId, deliveryLocation) {
  // Specify that the delivery has entered this query
  deliveryId = deliveryId.split(":")[1];
  deliverysInQuery[deliveryId] = true;

  // Look up the delivery's data in the Transit Open Data Set
  transitWilddogRef.child("beijing/delivery").child(deliveryId).once("value", function(dataSnapshot) {
    // Get the delivery data from the Open Data Set
    delivery = dataSnapshot.val();

    // If the delivery has not already exited this query in the time it took to look up its data in the Open Data
    // Set, add it to the map
    if (delivery !== null && deliverysInQuery[deliveryId] === true) {
      // Add the delivery to the list of deliverys in the query
      deliverysInQuery[deliveryId] = delivery;

      // Create a new marker for the delivery
      delivery.marker = createdeliveryMarker(delivery, getdeliveryColor(delivery));
    }
  });
});

/* Moves deliverys markers on the map when their location within the query changes */
geoQuery.on("key_moved", function(deliveryId, deliveryLocation) {
  // Get the delivery from the list of deliverys in the query
  deliveryId = deliveryId.split(":")[1];
  var delivery = deliverysInQuery[deliveryId];
  // Animate the delivery's marker
  if (typeof delivery !== "undefined" && typeof delivery.marker !== "undefined") {
    delivery.marker.animatedMoveTo(deliveryLocation);
    }
});

/* Removes delivery markers from the map when they exit the query */
geoQuery.on("key_exited", function(deliveryId, deliveryLocation) {
  // Get the delivery from the list of deliverys in the query
  deliveryId = deliveryId.split(":")[1];
  var delivery = deliverysInQuery[deliveryId];
  // If the delivery's data has already been loaded from the Open Data Set, remove its marker from the map
  if (delivery !== true &&  typeof delivery.marker !== "undefined") {
    delivery.marker.setMap(null);
  }

  // Remove the delivery from the list of deliverys in the query
  delete deliverysInQuery[deliveryId];
});

/*****************/
/*  gaode MAPS  */
/*****************/
/* Initializes gaode Maps */
function initializeMap() {
	var loc = new AMap.LngLat(center[1], center[0]);
	//初始化地图对象，加载地图
	map = new AMap.Map("mapContainer", {
		resizeEnable: true,
		view: new AMap.View2D({
				center: loc,
				zoom: 15
			})
	});
	//加载工具条
	map.plugin(["AMap.ToolBar"],function(){
		var tool = new AMap.ToolBar();
	   	map.addControl(tool);   
			});

	//加载比例尺
	map.plugin(["AMap.Scale"],function(){
	    	var scale = new AMap.Scale();
	    	map.addControl(scale);  
			});

	
	var circle = new AMap.Circle({ 
		map:map,
	 	center:loc,// 圆心位置
		radius:((radiusInKm) * 1000), //半径
		strokeColor: "#6D3099", //线颜色
		strokeOpacity: 1, //线透明度
		strokeWeight: 3, //线粗细度
		fillColor: "#B650FF", //填充颜色
		fillOpacity: 0.35//填充透明度

	}); 

	//自定义点标记内容   
	var stationMarkerContent = document.createElement("div");
	stationMarkerContent.className = "markerContentStyle";
	    
	//点标记中的图标
	var stationMarkerImg = document.createElement("img");
	stationMarkerImg.className = "markerlnglat";
	stationMarkerImg.src ="http://webapi.amap.com/images/marker_sprite.png";
	stationMarkerContent.appendChild(stationMarkerImg);
		 
	//点标记中的文本
	var stationMarkerSpan = document.createElement("span");
	stationMarkerSpan.innerHTML = '配送站';
	stationMarkerSpan.setAttribute("class", "span1")
	stationMarkerContent.appendChild(stationMarkerSpan);

	var stationMarker  = new AMap.Marker({
		map:map,
		position:new AMap.LngLat(116.408032,39.897614),//基点位置
		autoRotation:false,
		content: stationMarkerContent //自定义点标记覆盖物内容
	});

	var lnglat;  
	var clickEventListener = AMap.event.addListener(map,'click',function(e){
		lnglat=e.lnglat;
		circle.setCenter(lnglat);
		updateCriteria();
	});

	var updateCriteria = _.debounce(function() {
	    lnglat = circle.getCenter();
	    geoQuery.updateCriteria({
	      center: [lnglat.getLat(), lnglat.getLng()],
	      radius: radiusInKm
	    });
	  }, 10);
}

/**********************/
/*  HELPER FUNCTIONS  */
/**********************/
/* Adds a marker for the inputted delivery to the map */
function createdeliveryMarker(delivery, deliveryColor) {
	//自定义点标记内容   
	var markerContent = document.createElement("div");
	markerContent.className = "markerContentStyle";
	    
	//点标记中的图标
	var markerImg = document.createElement("img");
	markerImg.className = "markerlnglat";
	markerImg.src = "images/man.png";
	markerImg.height = "35";
	markerImg.width = "27";
	markerContent.appendChild(markerImg);
		 
	//点标记中的文本
	var markerSpan = document.createElement("span");
	markerSpan.innerHTML = delivery.id;
	markerContent.appendChild(markerSpan);

	var marker  = new AMap.Marker({
		map:map,
		position:new AMap.LngLat(delivery.lng, delivery.lat),//基点位置
		autoRotation:false,
		content: markerContent //自定义点标记覆盖物内容
		
	});
  	return marker;
}

/* Returns a blue color code for outbound deliverys or a red color code for inbound deliverys */
function getdeliveryColor(delivery) {
  return ((delivery.dirTag && delivery.dirTag.indexOf("OB") > -1) ? "50B1FF" : "FF6450");
}

/* Returns true if the two inputted coordinates are approximately equivalent */
function coordinatesAreEquivalent(coord1, coord2) {
  return (Math.abs(coord1 - coord2) < 0.000001);
}

AMap.Marker.prototype.animatedMoveTo = function(newLocation) {
  var toLat = newLocation[0];
  var toLng = newLocation[1];
  var fromLat = this.getPosition().getLat();
  var fromLng = this.getPosition().getLng();

  if (!coordinatesAreEquivalent(fromLat, toLat) || !coordinatesAreEquivalent(fromLng, toLng)) {
    var percent = 0;
    var latDistance = toLat - fromLat;
    var lngDistance = toLng - fromLng;
    var interval = window.setInterval(function () {
      percent += 0.01;
      var curLat = fromLat + (percent * latDistance);
      var curLng = fromLng + (percent * lngDistance);
      var pos = new AMap.LngLat(curLng,curLat)
      this.setPosition(pos);
      if (percent >= 1) {
        window.clearInterval(interval);
      }
    }.bind(this), 10);
  }

}
