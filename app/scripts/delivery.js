//map variable
var map, circle, stationMarker, markerImg;

// Set the center as Wilddog HQ
var locations = {
  "WilddogHQ": [39.897614, 116.408032],
  "center": [40.01152,116.478155]
};

// Query radius
var radiusInM = 1500;

var config = {
  syncURL: "https://<appId>.wilddogio.com", //输入节点 URL
  websocketOnly: true
};
wilddog.initializeApp(config);

// Create a new WildGeo instance, pulling data from the public transit data
var wildGeo = wilddog.location();

var center = wildGeo.customPosition(locations['WilddogHQ']);


/*************/
/*  GEOQUERY */
/*************/
// Keep track of all of the deliverys currently within the query
var deliverysInQuery = {};

// 创建一个 CircleQuery 的查询。
var geoQuery;

function startCircleQuery() {
  // for (var key in deliverysInQuery) {
  //   if (deliverysInQuery.hasOwnProperty(key)) {
  //     try {
  //       deliverysInQuery[key].marker.setMap(null);
  //     } catch (e) {};
  //     delete deliverysInQuery[key];
  //   }
  // };
  geoQuery = wildGeo.circleQuery({
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
  circle.show();
  stationMarker.show();
};

function stopCircleQuery() {
  geoQuery.cancel();
  for (var key in deliverysInQuery) {
    if (deliverysInQuery.hasOwnProperty(key)) {
      //   try {
      deliverysInQuery[key].marker.setMap(null);
      //   } catch (e) {};
      delete deliverysInQuery[key];
    }
  };
  circle.hide();
  stationMarker.hide();
}

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
  var loc = new AMap.LngLat(locations.center[1], locations.center[0]);
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
  circle.hide();

  // 自定义点标记内容
  var stationMarkerContent = document.createElement("div");
  stationMarkerContent.className = "markerContentStyle";

  //点标记中的图标
  var stationMarkerImg = document.createElement("img");
  stationMarkerImg.className = "markerlnglat";
  stationMarkerImg.src = "http://webapi.amap.com/images/marker_sprite.png";
  stationMarkerContent.appendChild(stationMarkerImg);
  //
  // //点标记中的文本
  // var stationMarkerSpan = document.createElement("span");
  // stationMarkerSpan.innerHTML = '配送站';
  // stationMarkerSpan.setAttribute("class", "span1")
  // stationMarkerContent.appendChild(stationMarkerSpan);
  //
  stationMarker = new AMap.Marker({
    map: map,
    position: new AMap.LngLat(116.408032, 39.897614), //基点位置
    autoRotation: false,
    content: stationMarkerContent //自定义点标记覆盖物内容
  });
  stationMarker.hide();

  //自定义点标记内容
  var markerContent = document.createElement("div");
  markerContent.className = "markerContentStyle";

  //点标记中的图标
  markerImg = document.createElement("img");
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
    position: new AMap.LngLat(116.465703, 40.021953), //基点位置
    offset: new AMap.Pixel(-118, -145),
    autoRotation: false,
    content: markerContent //自定义点标记覆盖物内容

  });

  var lnglat;
  var clickEventListener = AMap.event.addListener(map, 'click', function(e) {
    if (39.856512 < e.lnglat.getLat() && e.lnglat.getLat() < 39.963432 && 116.310527 < e.lnglat.getLng() && e.lnglat.getLng() < 116.458844) {
      lnglat = e.lnglat;
      center = wildGeo.customPosition([lnglat.getLat(), lnglat.getLng()]);
      circle.setCenter(lnglat);
      stationMarker.setPosition(lnglat);
      updateCriteria();
    }
  });

  var updateCriteria = _.debounce(function() {
    lnglat = circle.getCenter();
    var position = wildGeo.customPosition([lnglat.getLat(), lnglat.getLng()]);
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

var wilddogAddress = wildGeo.customPosition([40.021083, 116.465953]);

function createPointMarker(position) {
  //自定义点标记内容
  var markerContent = $('#pointModel').clone();
  var distance = wilddog.Location.distance(position, wilddogAddress);

  markerContent.get()[0].hidden = false;
  markerContent.get()[0].id = 'activePoint';
  markerContent.children()[2].innerText = '距离野狗 ' + Math.round(distance) + '米';

  var marker = new AMap.Marker({
    map: map,
    position: new AMap.LngLat(position.longitude(), position.latitude()), //基点位置
    autoRotation: false,
    offset: new AMap.Pixel(-6, -31),
    content: markerContent.get()[0] //自定义点标记覆盖物内容
  });

  return marker;
}

function createLastestPointMarker(position, distance) {
  //自定义点标记内容
  var markerContent = $('#pointModel').clone();

  markerContent.get()[0].hidden = false;
  markerContent.get()[0].id = 'latestPoint';
  markerContent.children()[2].innerText = '轨迹路程为 ' + distance + ' 米';

  var marker = new AMap.Marker({
    map: map,
    position: new AMap.LngLat(position.longitude(), position.latitude()), //基点位置
    autoRotation: false,
    offset: new AMap.Pixel(-6, -31),
    content: markerContent.get()[0] //自定义点标记覆盖物内容
  });

  return marker;
}

function createPathPolyline(lineArr) {
  var polyline = new AMap.Polyline({
    path: lineArr, // 设置线覆盖物路径
    strokeColor: '#3366FF', // 线颜色
    strokeOpacity: 0.8, // 线透明度
    strokeWeight: 4, // 线宽
    strokeStyle: 'solid', // 线样式
    geodesic: true // 绘制大地线
  });
  polyline.setMap(map);

  return polyline;
}

var activeMarker, offActivePoint;
// 开启位置同步
function startRealPosition() {
  offActivePoint = wildGeo.onPosition('activePoint', function(position) {
    if (!activeMarker) {
      activeMarker = createPointMarker(position)
    } else {
      var newPosition = new AMap.LngLat(position.longitude(), position.latitude());
      activeMarker.moveTo(newPosition, 500);
      var distance = wilddog.Location.distance(position, wilddogAddress);
      var content = activeMarker.getContent();
      content.children[2].innerText = '距离野狗 ' + Math.round(distance) + ' 米';
    }
  });
}

function stopRealPosition() {
  offActivePoint.cancel();
  activeMarker.setMap(null);
  activeMarker = null;
};

var pathPolyline, latestPointMarker, offActivePath, pathQuery;
// 开启实时轨迹
function startRealPath() {
  pathQuery = wildGeo.pathQuery('activePoint');
  offActivePath = pathQuery.on(function(pathSnapshot) {
    var aMapPositions = [];
    var points = pathSnapshot.points();
    for (var i = 0; i < points.length; i++) {
      aMapPositions.push([points[i].longitude().toString(), points[i].latitude().toString()]);
    };
    if (!pathPolyline) {
      pathPolyline = createPathPolyline(aMapPositions);
    } else {
      pathPolyline.setPath(aMapPositions);
    };
    if (!pathSnapshot.latestPoint()) {
        return;
    };
    if (!latestPointMarker) {
        latestPointMarker = createLastestPointMarker(pathSnapshot.latestPoint(), pathSnapshot.length());
    } else {
        var newPosition = new AMap.LngLat(pathSnapshot.latestPoint().longitude(), pathSnapshot.latestPoint().latitude());
        latestPointMarker.setPosition(newPosition);
        var content = latestPointMarker.getContent();
        content.children[2].innerText = '轨迹路程为 ' + pathSnapshot.length() + ' 米';
    }
  });
};

function stopRealPath() {
    offActivePath.cancel();
    pathPolyline.setMap(null);
    pathPolyline = null;
    latestPointMarker.setMap(null);
    latestPointMarker = null;
};

var currentFunction = 'traceFunction';
startRealPosition();

$('#traceFunction').bind('click', function() {
  switch (currentFunction) {
    case 'pathFunction':
      stopRealPath();
      break;
    case 'circleFunction':
      stopCircleQuery();
      break;
    case 'traceFunction':
      return;
  }
  currentFunction = 'traceFunction';
  startRealPosition();
  map.setCenter(new AMap.LngLat(locations.center[1], locations.center[0]));
  $('#traceFunction').text('正在演示');
  $('#pathFunction').text('演示');
  $('#circleFunction').text('演示');
})

$('#pathFunction').bind('click', function() {
  switch (currentFunction) {
    case 'pathFunction':
      return;
    case 'circleFunction':
      stopCircleQuery();
      break;
    case 'traceFunction':
      stopRealPosition();
      break;
  }
  currentFunction = 'pathFunction';
  startRealPath();
  map.setCenter(new AMap.LngLat(locations.center[1], locations.center[0]));
  $('#traceFunction').text('演示');
  $('#pathFunction').text('正在演示');
  $('#circleFunction').text('演示');
})

$('#circleFunction').bind('click', function() {
  switch (currentFunction) {
    case 'pathFunction':
      stopRealPath();
      break;
    case 'circleFunction':
      return;
    case 'traceFunction':
      stopRealPosition();
      break;
  }
  currentFunction = 'circleFunction';
  startCircleQuery();
  circle.setCenter(new AMap.LngLat(center.longitude(), center.latitude()));
  map.setCenter(circle.getCenter());
  $('#traceFunction').text('演示');
  $('#pathFunction').text('演示');
  $('#circleFunction').text('正在演示');
})

$('#signup-btn').bind('click', function () {
    window.open('https://www.wilddog.com/my-account/signup');
})
