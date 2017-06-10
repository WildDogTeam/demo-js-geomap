//map variable
var map, circle;

// Set the center as Wilddog HQ
var locations = {
  "WilddogHQ": [39.897614, 116.408032]
};

// Query radius
var radiusInM = 1500;

var config = {
  syncURL: "https://geomap.wilddogio.com", //输入节点 URL
  websocketOnly: true
};
wilddog.initializeApp(config);

// Create a new WildGeo instance, pulling data from the public transit data
var wildGeo = wilddog.location();

var center = wildGeo.initCustomPosition({
  location: locations['WilddogHQ']
});

/*************/
/*  GEOQUERY */
/*************/
// Keep track of all of the deliverys currently within the query
var deliverysInQuery = {};

// 创建一个 CircleQuery 的查询。
var geoQuery = wildGeo.initCircleQuery({
  center: center,
  radius: radiusInM
});

/* Adds new delivery markers to the map when they enter the query */
geoQuery.on("key_entered", function(deliveryId, deliveryLocation) {
  // Specify that the delivery has entered this query
  deliveryId = deliveryId;
  delivery = deliveryLocation;
  deliverysInQuery[deliveryId] = delivery;
  // Create a new marker for the delivery
  delivery.marker = createdeliveryMarker(deliveryId, delivery);
});

/* Moves deliverys markers on the map when their location within the query changes */
geoQuery.on("key_moved", function(deliveryId, deliveryLocation) {
  // Get the delivery from the list of deliverys in the query
  deliveryId = deliveryId;
  var delivery = deliverysInQuery[deliveryId];
  // Animate the delivery's marker
  if (typeof delivery !== "undefined" && typeof delivery.marker !== "undefined") {
    var pos = new AMap.LngLat(deliveryLocation.longitude(), deliveryLocation.latitude())
    delivery.marker.moveTo(pos, 500);
  }
});

/* Removes delivery markers from the map when they exit the query */
geoQuery.on("key_exited", function(deliveryId, deliveryLocation) {
  // Get the delivery from the list of deliverys in the query
  deliveryId = deliveryId;
  var delivery = deliverysInQuery[deliveryId];
  // If the delivery's data has already been loaded from the Open Data Set, remove its marker from the map
  if (delivery !== true && typeof delivery.marker !== "undefined") {
    delivery.marker.stopMove();
    delivery.marker.setMap(null);
  }

  // Remove the delivery from the list of deliverys in the query
  delete deliverysInQuery[deliveryId];
});

/*****************/
/*  gaode MAPS  */
/*****************/
/* Initializes gaode Maps */
var defineMap = function(loc, zoom) {
  map = new AMap.Map("mapContainer", {
    resizeEnable: true,
    view: new AMap.View2D({
      center: loc,
      zoom: zoom
    })
  });
};

function initializeMap() {
  var loc = new AMap.LngLat(center.longitude(), center.latitude());
  //初始化地图对象，加载地图
  var UA = navigator.userAgent;
  if (UA.indexOf("Mobile") == -1 || UA.indexOf("Mobile") == -1) {
    defineMap(loc, 15);
  } else {
    defineMap(loc, 13);
  };
  //加载工具条
  // map.plugin(["AMap.ToolBar"],function(){
  // 	var tool = new AMap.ToolBar();
  //    	map.addControl(tool);
  // 		});

  //加载比例尺
  map.plugin(["AMap.Scale"], function() {
    var scale = new AMap.Scale();
    map.addControl(scale);
  });


  circle = new AMap.Circle({
    map: map,
    center: loc, // 圆心位置
    radius: (radiusInM), //半径
    strokeColor: "#e6501e", //线颜色
    strokeOpacity: 1, //线透明度
    strokeWeight: 1, //线粗细度
    fillColor: "#e6501e", //填充颜色
    fillOpacity: 0.15 //填充透明度

  });

  //自定义点标记内容
  var stationMarkerContent = document.createElement("div");
  stationMarkerContent.className = "markerContentStyle";

  //点标记中的图标
  var stationMarkerImg = document.createElement("img");
  stationMarkerImg.className = "markerlnglat";
  stationMarkerImg.src = "http://webapi.amap.com/images/marker_sprite.png";
  stationMarkerContent.appendChild(stationMarkerImg);

  //点标记中的文本
  var stationMarkerSpan = document.createElement("span");
  stationMarkerSpan.innerHTML = '配送站';
  stationMarkerSpan.setAttribute("class", "span1")
  stationMarkerContent.appendChild(stationMarkerSpan);

  var stationMarker = new AMap.Marker({
    map: map,
    position: new AMap.LngLat(116.408032, 39.897614), //基点位置
    autoRotation: false,
    content: stationMarkerContent //自定义点标记覆盖物内容
  });

  //自定义点标记内容
  var markerContent = document.createElement("div");
  markerContent.className = "markerContentStyle";

  //点标记中的图标
  var markerImg = document.createElement("img");
  markerImg.className = "markerlnglat";
  markerImg.src = "images/wilddog-tip.png";
  markerImg.height = "160";
  markerContent.appendChild(markerImg);

  //点标记中的文本
  // var markerSpan = document.createElement("span");
  // markerSpan.innerHTML = deliveryId;
  // markerContent.appendChild(markerSpan);

  var marker = new AMap.Marker({
    map: map,
    position: new AMap.LngLat(116.465953, 40.021083), //基点位置
    offset: new AMap.Pixel(-118, -160),
    autoRotation: false,
    content: markerContent //自定义点标记覆盖物内容

  });

  var lnglat;
  var clickEventListener = AMap.event.addListener(map, 'click', function(e) {
    if (39.856512 < e.lnglat.getLat() && e.lnglat.getLat() < 39.963432 && 116.310527 < e.lnglat.getLng() && e.lnglat.getLng() < 116.458844) {
      lnglat = e.lnglat;
      circle.setCenter(lnglat);
      updateCriteria();
    }
  });

  var updateCriteria = _.debounce(function() {
    lnglat = circle.getCenter();
    var options = {
      location: [lnglat.getLat(), lnglat.getLng()]
    };
    var position = wildGeo.initCustomPosition(options);
    geoQuery.updateCriteria({
      center: position,
      radius: radiusInM
    });
  }, 10);
}

/**********************/
/*  HELPER FUNCTIONS  */
/**********************/
/* Adds a marker for the inputted delivery to the map */
function createdeliveryMarker(deliveryId, delivery) {
  //自定义点标记内容
  var markerContent = document.createElement("div");
  markerContent.className = "markerContentStyle";

  //点标记中的图标
  var markerImg = document.createElement("img");
  markerImg.className = "markerlnglat";
  markerImg.src = "images/man.png";
  markerImg.height = "40";
  markerImg.width = "40";
  markerContent.appendChild(markerImg);

  //点标记中的文本
  // var markerSpan = document.createElement("span");
  // markerSpan.innerHTML = deliveryId;
  // markerContent.appendChild(markerSpan);

  var marker = new AMap.Marker({
    map: map,
    position: new AMap.LngLat(delivery.longitude(), delivery.latitude()), //基点位置
    autoRotation: false,
    offset: new AMap.Pixel(-20, -20),
    content: markerContent //自定义点标记覆盖物内容

  });
  return marker;
}

var wilddogAddress = wildGeo.initCustomPosition({location:[40.021083, 116.465953]});

function createPointMarker(position) {
  //自定义点标记内容
  var markerContent = $('#pointModel').clone();
  var distance = Location.distance(position, wilddogAddress);

  markerContent.get()[0].hidden = false;
  markerContent.get()[0].id = 'activePoint';
  markerContent.children()[2].innerText = '距离野狗 '+ Math.round(distance) + '米';

  var marker = new AMap.Marker({
    map: map,
    position: new AMap.LngLat(position.longitude(), position.latitude()), //基点位置
    autoRotation: false,
    offset: new AMap.Pixel(-5, -36),
    content: markerContent.get()[0] //自定义点标记覆盖物内容
  });

  return marker;
}

var activeMarker;

// 开启位置同步
function startRealPosition() {
  wildGeo.on('activePoint', function(position) {
      if (!activeMarker) {
          activeMarker = createPointMarker(position)
      } else {
          var newPosition = new AMap.LngLat(position.longitude(), position.latitude());
          activeMarker.moveTo(newPosition,500);
          var distance = Location.distance(position, wilddogAddress);
          var content = activeMarker.getContent();
          content.children[2].innerText = '距离野狗 '+ Math.round(distance) + ' 米';
      }
  })
}

startRealPosition();

$('#traceFunction').bind('click', function() {
  map.setCenter(new AMap.LngLat(116.465953, 40.021083));
  $('#traceFunction').text('正在演示');
  $('#pathFunction').text('演示');
  $('#circleFunction').text('演示');
})

$('#pathFunction').bind('click', function() {
  map.setCenter(new AMap.LngLat(116.465953, 40.021083));
  $('#traceFunction').text('演示');
  $('#pathFunction').text('正在演示');
  $('#circleFunction').text('演示');
})

$('#circleFunction').bind('click', function() {
  map.setCenter(circle.getCenter());
  $('#traceFunction').text('演示');
  $('#pathFunction').text('演示');
  $('#circleFunction').text('正在演示');
})
