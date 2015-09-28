/*!
 * 开源js库 WildGeo 可以基于地理坐标位置存储和查询一组key值，它的核心是，只存储位置坐标的key值。
 * 这最大的好处是能够实时地在给定的地理区域内查询key的集合,实现实时区域查询。
 *
 * WildGeo 0.0.0
 * https://github.com/WildDogTeam/lib-js-wildgeo/
 * License: MIT
 */

// Include RSVP if this is being run in node
if (typeof module !== "undefined" && typeof process !== "undefined") {
  var RSVP = require("rsvp");
}

var WildGeo = (function() {
  "use strict";
/**
 * 建立一个GeoCallbackRegistration实例。
 * 
 * @constructor
 * @this {GeoCallbackRegistration}
 * @callback 当回调注册被取消时，cancelCallback回调将运行。
 */
var GeoCallbackRegistration = function(cancelCallback) {
  /********************/
  /*  PUBLIC METHODS  */
  /********************/
  /**
   * 取消一个事件的回调注册，于是将不会再触发回调。对其他你创建的事件回调无影响。
   */
  this.cancel = function() {
    if (typeof _cancelCallback !== "undefined") {
      _cancelCallback();
      _cancelCallback = undefined;
    }
  };

  /*****************/
  /*  CONSTRUCTOR  */
  /*****************/
  if (typeof cancelCallback !== "function") {
    throw new Error("callback must be a function");
  }

  var _cancelCallback = cancelCallback;
};
/**
 * 创建一个WildGeo实例
 * @constructor
 * @this {WildGeo}
 * @param {Wilddog} 存储WildGeo数据的Wilddog数据库wilddogRef.
 */
var WildGeo = function(wilddogRef) {
  /********************/
  /*  PUBLIC METHODS  */
  /********************/
  /**
   * 返回创建WildGeo实例的Wilddog实例
   * @return {Wilddog} 用来创建WildGeo实例的Wilddog实例
   */
  this.ref = function() {
    return _wilddogRef;
  };

  /*
   * 往Wilddog中写入key-location数据对。当写入成功后返回一个空的promise。
   * 如果要存入的key在WildGeo中已经存在，将被覆盖重写。
   * @param {string|Object} keyOrLocations 代表被增加的位置的key或者代表要被添加的key-location数据对。
   * @param {Array.<number>|undefined} location 要被添加的经纬坐标数组。
   * @return {Promise.<>} 写入成功后执行的Promise
   */
  this.set = function(keyOrLocations, location) {
    var locations;
    if (typeof keyOrLocations === "string" && keyOrLocations.length !== 0) {
      locations = {};
      locations[keyOrLocations] = location;
    } else if (typeof keyOrLocations === "object") {
      if (typeof location !== "undefined") {
        throw new Error("The location argument should not be used if you pass an object to set().");
      }
      locations = keyOrLocations;
    } else {
      throw new Error("keyOrLocations must be a string or a mapping of key - location pairs.");
    }

    var newData = {};

    Object.keys(locations).forEach(function(key) {
      validateKey(key);

      var location = locations[key];
      if (location === null) {
        newData[key] = null;
      } else {
        validateLocation(location);

        var geohash = encodeGeohash(location);
        newData[key] = encodeWildGeoObject(location, geohash);
      }
    });

    return new RSVP.Promise(function(resolve, reject) {
      function onComplete(error) {
        if (error !== null) {
          reject("Error: Wilddog synchronization failed: " + error);
        }
        else {
          resolve();
        }
      }

      _wilddogRef.update(newData, onComplete);
    });
  };

  /**
   * 返回key对应的一个包含地理位置信息的promise
   * 如果key参数在数据库中不存在，返回空的promise
   * @param {string} key 要检索的地理位置的key值
   * @return {Promise.<Array.<number>>} 包含根据key值检索到的位置信息的promise
   */
  this.get = function(key) {
    validateKey(key);
    return new RSVP.Promise(function(resolve, reject) {
      _wilddogRef.child(key).once("value", function(dataSnapshot) {
        if (dataSnapshot.val() === null) {
          resolve(null);
        } else {
          resolve(decodeWildGeoObject(dataSnapshot.val()));
        }
      }, function (error) {
        reject("Error: Wilddog synchronization failed: " + error);
      });
    });
  };

  /**
   * 删除WildGeo中的key，删除成功后返回一个空的promise
   * 如果参数key不在WildGeo中，promise仍能成功解析。
   * @param {string} key 被删除的地理位置的key值
   * @return {Promise.<string>} 输入的key被删除后返回的promise
   */
  this.remove = function(key) {
    return this.set(key, null);
  };

  /**
   * 根据查询条件返回一个新的WildGeo实例。
   * @param {Object} queryCriteria 指定了圆心坐标和半径的查询条件
   * @return {GeoQuery} 一个新的GeoQuery对象
   */
  this.query = function(queryCriteria) {
    return new GeoQuery(_wilddogRef, queryCriteria);
  };

  /*****************/
  /*  CONSTRUCTOR  */
  /*****************/
  if (Object.prototype.toString.call(wilddogRef) !== "[object Object]") {
    throw new Error("wilddogRef must be an instance of Wilddog");
  }

  var _wilddogRef = wilddogRef;
};

/**
 * 计算两点之间距离的静态方法，单位是km。
 * 通过Haversine公式
 *
 * @param {Array.<number>} location1 第一个位置的经纬度坐标数组
 * @param {Array.<number>} location2 第二个位置的经纬度坐标数组
 * @return {number} 两点间的距离，单位km
 */
WildGeo.distance = function(location1, location2) {
  validateLocation(location1);
  validateLocation(location2);

  var radius = 6371; // Earth's radius in kilometers
  var latDelta = degreesToRadians(location2[0] - location1[0]);
  var lonDelta = degreesToRadians(location2[1] - location1[1]);

  var a = (Math.sin(latDelta / 2) * Math.sin(latDelta / 2)) +
          (Math.cos(degreesToRadians(location1[0])) * Math.cos(degreesToRadians(location2[0])) *
          Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2));

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return radius * c;
};

// 默认的geoHash精度
var g_GEOHASH_PRECISION = 10;

// geoHash的字符集
var g_BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

// 地球的子午周长，单位是m
var g_EARTH_MERI_CIRCUMFERENCE = 40007860;

// 纬度一度之间的大约距离
var g_METERS_PER_DEGREE_LATITUDE = 110574;

// 每个geoHash字符串的比特数
var g_BITS_PER_CHAR = 5;

// geohash最大的长度
var g_MAXIMUM_BITS_PRECISION = 22*g_BITS_PER_CHAR;

// 地球赤道半径，单位是m
var g_EARTH_EQ_RADIUS = 6378137.0;

// 地球极半径
// var g_EARTH_POL_RADIUS = 6356752.3;
// 计算 g_E2 的公式
// g_E2 == (g_EARTH_EQ_RADIUS^2-g_EARTH_POL_RADIUS^2)/(g_EARTH_EQ_RADIUS^2)
// 为了避免舍入误差，采用如下精确值
var g_E2 = 0.00669447819799;

// 舍掉双倍计算中的舍入误差
var g_EPSILON = 1e-12;

Math.log2 = Math.log2 || function(x) {
  return Math.log(x)/Math.log(2);
};

/**
 * 校验输入的key，如果不合法抛出错误
 * @param {string} key 被校验的key
 */
var validateKey = function(key) {
  var error;

  if (typeof key !== "string") {
    error = "key must be a string";
  }
  else if (key.length === 0) {
    error = "key cannot be the empty string";
  }
  else if (1 + g_GEOHASH_PRECISION + key.length > 755) {
    // Wilddog can only stored child paths up to 768 characters
    // The child path for this key is at the least: "i/<geohash>key"
    error = "key is too long to be stored in Wilddog";
  }
  else if (/[\[\].#$\/\u0000-\u001F\u007F]/.test(key)) {
    // Wilddog 不允许key包含如下字符
    error = "key cannot contain any of the following characters: . # $ ] [ /";
  }

  if (typeof error !== "undefined") {
    throw new Error("Invalid WildGeo key '" + key + "': " + error);
  }
};

/**
 * Validates the inputted location and throws an error if it is invalid.
 * 校验输入的坐标，如果不合法抛出错误
 * @param {Array.<number>} location 经纬坐标数组对
 */
var validateLocation = function(location) {
  var error;

  if (!Array.isArray(location)) {
    error = "location must be an array";
  }
  else if (location.length !== 2) {
    error = "expected array of length 2, got length " + location.length;
  }
  else {
    var latitude = location[0];
    var longitude = location[1];

    if (typeof latitude !== "number" || isNaN(latitude)) {
      error = "latitude must be a number";
    }
    else if (latitude < -90 || latitude > 90) {
      error = "latitude must be within the range [-90, 90]";
    }
    else if (typeof longitude !== "number" || isNaN(longitude)) {
      error = "longitude must be a number";
    }
    else if (longitude < -180 || longitude > 180) {
      error = "longitude must be within the range [-180, 180]";
    }
  }

  if (typeof error !== "undefined") {
    throw new Error("Invalid WildGeo location '" + location + "': " + error);
  }
};

/**
 * Validates the inputted geohash and throws an error if it is invalid.
 * 校验输入的geohash值，不合法则抛出错误
 * @param {string} geohash 被校验的geohash值.
 */
var validateGeohash = function(geohash) {
  var error;

  if (typeof geohash !== "string") {
    error = "geohash must be a string";
  }
  else if (geohash.length === 0) {
    error = "geohash cannot be the empty string";
  }
  else {
    for (var i = 0, length = geohash.length; i < length; ++i) {
      if (g_BASE32.indexOf(geohash[i]) === -1) {
        error = "geohash cannot contain \"" + geohash[i] + "\"";
      }
    }
  }

  if (typeof error !== "undefined") {
    throw new Error("Invalid WildGeo geohash '" + geohash + "': " + error);
  }
};

/**
 * Validates the inputted query criteria and throws an error if it is invalid.
 * 校验输入的查询条件，不合法则抛出错误
 * @param {Object} newQueryCriteria 指定了圆心和半径的查询条件
 */
var validateCriteria = function(newQueryCriteria, requireCenterAndRadius) {
  if (typeof newQueryCriteria !== "object") {
    throw new Error("query criteria must be an object");
  }
  else if (typeof newQueryCriteria.center === "undefined" && typeof newQueryCriteria.radius === "undefined") {
    throw new Error("radius and/or center must be specified");
  }
  else if (requireCenterAndRadius && (typeof newQueryCriteria.center === "undefined" || typeof newQueryCriteria.radius === "undefined")) {
    throw new Error("query criteria for a new query must contain both a center and a radius");
  }

  //如果有任何附加属性抛出错误
  var keys = Object.keys(newQueryCriteria);
  var numKeys = keys.length;
  for (var i = 0; i < numKeys; ++i) {
    var key = keys[i];
    if (key !== "center" && key !== "radius") {
      throw new Error("Unexpected attribute '" + key + "'' found in query criteria");
    }
  }

  // 校验圆心属性
  if (typeof newQueryCriteria.center !== "undefined") {
    validateLocation(newQueryCriteria.center);
  }

  // 验半径属性
  if (typeof newQueryCriteria.radius !== "undefined") {
    if (typeof newQueryCriteria.radius !== "number" || isNaN(newQueryCriteria.radius)) {
      throw new Error("radius must be a number");
    }
    else if (newQueryCriteria.radius < 0) {
      throw new Error("radius must be greater than or equal to 0");
    }
  }
};

/**
 * 角度转换为弧度
 *  
 * @param {number} 要被转换为弧度的角度
 * @return {number} 等价于输入角度的弧度
 */
var degreesToRadians = function(degrees) {
  if (typeof degrees !== "number" || isNaN(degrees)) {
    throw new Error("Error: degrees must be a number");
  }

  return (degrees * Math.PI / 180);
};

/**
 * 由[latitude, longitude]坐标数组对产生指定精度/字符长度的geohash值
 * @param {Array.<number>} [latitude, longitude]坐标数组
 * @param {number=} precision 生成geohash值的精度，如果没有指定精度，采用全局默认的精度
 * @return {string} 输入坐标的geohash值
 */
var encodeGeohash = function(location, precision) {
  validateLocation(location);
  if (typeof precision !== "undefined") {
    if (typeof precision !== "number" || isNaN(precision)) {
      throw new Error("precision must be a number");
    }
    else if (precision <= 0) {
      throw new Error("precision must be greater than 0");
    }
    else if (precision > 22) {
      throw new Error("precision cannot be greater than 22");
    }
    else if (Math.round(precision) !== precision) {
      throw new Error("precision must be an integer");
    }
  }

  // 如果没有指定精度，使用全局默认的精度值
  precision = precision || g_GEOHASH_PRECISION;

  var latitudeRange = {
    min: -90,
    max: 90
  };
  var longitudeRange = {
    min: -180,
    max: 180
  };
  var hash = "";
  var hashVal = 0;
  var bits = 0;
  var even = 1;

  while (hash.length < precision) {
    var val = even ? location[1] : location[0];
    var range = even ? longitudeRange : latitudeRange;
    var mid = (range.min + range.max) / 2;

    /* jshint -W016 */
    if (val > mid) {
      hashVal = (hashVal << 1) + 1;
      range.min = mid;
    }
    else {
      hashVal = (hashVal << 1) + 0;
      range.max = mid;
    }
    /* jshint +W016 */

    even = !even;
    if (bits < 4) {
      bits++;
    }
    else {
      bits = 0;
      hash += g_BASE32[hashVal];
      hashVal = 0;
    }
  }

  return hash;
};

/**
 * 计算某个纬度上某段距离之间的角度
 * 
 * @param {number} distance 要转化的距离
 * @param {number} latitude 在哪个纬度上计算
 * @return {number} 距离对应的角度
 */
var metersToLongitudeDegrees = function(distance, latitude) {
  var radians = degreesToRadians(latitude);
  var num = Math.cos(radians)*g_EARTH_EQ_RADIUS*Math.PI/180;
  var denom = 1/Math.sqrt(1-g_E2*Math.sin(radians)*Math.sin(radians));
  var deltaDeg = num*denom;
  if (deltaDeg  < g_EPSILON) {
    return distance > 0 ? 360 : 0;
  }
  else {
    return Math.min(360, distance/deltaDeg);
  }
};

/**
 * Calculates the bits necessary to reach a given resolution, in meters, for the longitude at a
 * given latitude.
 *
 * @param {number} resolution The desired resolution.
 * @param {number} latitude The latitude used in the conversion.
 * @return {number} The bits necessary to reach a given resolution, in meters.
 */
var longitudeBitsForResolution = function(resolution, latitude) {
  var degs = metersToLongitudeDegrees(resolution, latitude);
  return (Math.abs(degs) > 0.000001) ?  Math.max(1, Math.log2(360/degs)) : 1;
};

/**
 * Calculates the bits necessary to reach a given resolution, in meters, for the latitude.
 *
 * @param {number} resolution The bits necessary to reach a given resolution, in meters.
 */
var latitudeBitsForResolution = function(resolution) {
  return Math.min(Math.log2(g_EARTH_MERI_CIRCUMFERENCE/2/resolution), g_MAXIMUM_BITS_PRECISION);
};

/**
 * 把经度包装到[-180,180]范围内
 * 
 * @param {number} longitude 要被包装的经度
 * @return {number} longitude 包装后的结果经度
 */
var wrapLongitude = function(longitude) {
  if (longitude <= 180 && longitude >= -180) {
    return longitude;
  }
  var adjusted = longitude + 180;
  if (adjusted > 0) {
    return (adjusted % 360) - 180;
  }
  else {
    return 180 - (-adjusted % 360);
  }
};

/**
 * Calculates the maximum number of bits of a geohash to get a bounding box that is larger than a
 * given size at the given coordinate.
 *
 * @param {Array.<number>} coordinate The coordinate as a [latitude, longitude] pair.
 * @param {number} size The size of the bounding box.
 * @return {number} The number of bits necessary for the geohash.
 */
var boundingBoxBits = function(coordinate,size) {
  var latDeltaDegrees = size/g_METERS_PER_DEGREE_LATITUDE;
  var latitudeNorth = Math.min(90, coordinate[0] + latDeltaDegrees);
  var latitudeSouth = Math.max(-90, coordinate[0] - latDeltaDegrees);
  var bitsLat = Math.floor(latitudeBitsForResolution(size))*2;
  var bitsLongNorth = Math.floor(longitudeBitsForResolution(size, latitudeNorth))*2-1;
  var bitsLongSouth = Math.floor(longitudeBitsForResolution(size, latitudeSouth))*2-1;
  return Math.min(bitsLat, bitsLongNorth, bitsLongSouth, g_MAXIMUM_BITS_PRECISION);
};

/**
 * Calculates eight points on the bounding box and the center of a given circle. At least one
 * geohash of these nine coordinates, truncated to a precision of at most radius, are guaranteed
 * to be prefixes of any geohash that lies within the circle.
 *
 * @param {Array.<number>} center The center given as [latitude, longitude].
 * @param {number} radius The radius of the circle.
 * @return {Array.<Array.<number>>} The eight bounding box points.
 */
var boundingBoxCoordinates = function(center, radius) {
  var latDegrees = radius/g_METERS_PER_DEGREE_LATITUDE;
  var latitudeNorth = Math.min(90, center[0] + latDegrees);
  var latitudeSouth = Math.max(-90, center[0] - latDegrees);
  var longDegsNorth = metersToLongitudeDegrees(radius, latitudeNorth);
  var longDegsSouth = metersToLongitudeDegrees(radius, latitudeSouth);
  var longDegs = Math.max(longDegsNorth, longDegsSouth);
  return [
    [center[0], center[1]],
    [center[0], wrapLongitude(center[1] - longDegs)],
    [center[0], wrapLongitude(center[1] + longDegs)],
    [latitudeNorth, center[1]],
    [latitudeNorth, wrapLongitude(center[1] - longDegs)],
    [latitudeNorth, wrapLongitude(center[1] + longDegs)],
    [latitudeSouth, center[1]],
    [latitudeSouth, wrapLongitude(center[1] - longDegs)],
    [latitudeSouth, wrapLongitude(center[1] + longDegs)]
  ];
};

/**
 * Calculates the bounding box query for a geohash with x bits precision.
 *
 * @param {string} geohash The geohash whose bounding box query to generate.
 * @param {number} bits The number of bits of precision.
 * @return {Array.<string>} A [start, end] pair of geohashes.
 */
var geohashQuery = function(geohash, bits) {
  validateGeohash(geohash);
  var precision = Math.ceil(bits/g_BITS_PER_CHAR);
  if (geohash.length < precision) {
    return [geohash, geohash+"~"];
  }
  geohash = geohash.substring(0, precision);
  var base = geohash.substring(0, geohash.length - 1);
  var lastValue = g_BASE32.indexOf(geohash.charAt(geohash.length - 1));
  var significantBits = bits - (base.length*g_BITS_PER_CHAR);
  var unusedBits = (g_BITS_PER_CHAR - significantBits);
  /*jshint bitwise: false*/
  // delete unused bits
  var startValue = (lastValue >> unusedBits) << unusedBits;
  var endValue = startValue + (1 << unusedBits);
  /*jshint bitwise: true*/
  if (endValue > 31) {
    return [base+g_BASE32[startValue], base+"~"];
  }
  else {
    return [base+g_BASE32[startValue], base+g_BASE32[endValue]];
  }
};

/**
 * Calculates a set of queries to fully contain a given circle. A query is a [start, end] pair
 * where any geohash is guaranteed to be lexiographically larger then start and smaller than end.
 *
 * @param {Array.<number>} center The center given as [latitude, longitude] pair.
 * @param {number} radius The radius of the circle.
 * @return {Array.<Array.<string>>} An array of geohashes containing a [start, end] pair.
 */
var geohashQueries = function(center, radius) {
  validateLocation(center);
  var queryBits = Math.max(1, boundingBoxBits(center, radius));
  var geohashPrecision = Math.ceil(queryBits/g_BITS_PER_CHAR);
  var coordinates = boundingBoxCoordinates(center, radius);
  var queries = coordinates.map(function(coordinate) {
    return geohashQuery(encodeGeohash(coordinate, geohashPrecision), queryBits);
  });
  // 去重
  return queries.filter(function(query, index) {
    return !queries.some(function(other, otherIndex) {
      return index > otherIndex && query[0] === other[0] && query[1] === other[1];
    });
  });
};

/**
 * 把坐标位置信息和geohash封装为一个WildGeo对象
 * @param {Array.<number>} location  [latitude, longitude]坐标数组
 * @param {string} geohash 坐标位置的geohash值
 * @return {Object} GoeDog对象
 */
function encodeWildGeoObject(location, geohash) {
  validateLocation(location);
  validateGeohash(geohash);
  return {
    ".priority": geohash,
    "g": geohash,
    "l": location
  };
}

/**
 * 把WildGeo解码，解码失败返回null
 * @param {Object} geoDogObj 包含地理坐标信息的WildGeo对象
 * @return {?Array.<number>} location [latitude, longitude]坐标数组，如果解码失败，返回null
 */
function decodeWildGeoObject(geoDogObj) {
  if (geoDogObj !== null && geoDogObj.hasOwnProperty("l") && Array.isArray(geoDogObj.l) && geoDogObj.l.length === 2) {
    return geoDogObj.l;
  } else {
    throw new Error("Unexpected WildGeo location object encountered: " + JSON.stringify(geoDogObj));
  }
}
/**
 * 创建一个GeoQuery实例
 * @constructor
 * @this {GeoQuery}
 * @param {Wilddog} wilddogRef 一个Wilddog实例
 * @param {Object} queryCriteria 一个指定了圆心和半径的查询条件
 */
var GeoQuery = function (wilddogRef, queryCriteria) {
  /*********************/
  /*  PRIVATE METHODS  */
  /*********************/
  /**
   * 为指定的时间类型触发各自的回调，传递给他key的数据
   *
   * @param {string} eventType 触发回调的事件类型. 包括 "key_entered", "key_exited", or "key_moved".
   * @param {string} key 位置坐标的key值，用来触发事件类型的回调.
   * @param {?Array.<number>} location [latitude, longitude]类型的坐标数组
   * @param {?double} distanceFromCenter 距离圆心的距离或者返回null
   */
  function _fireCallbacksForKey(eventType, key, location, distanceFromCenter) {
    _callbacks[eventType].forEach(function(callback) {
      if (typeof location === "undefined" || location === null) {
        callback(key, null, null);
      }
      else {
        callback(key, location, distanceFromCenter);
      }
    });
  }

  /**
   * 为"ready"事件触发回调
   */
  function _fireReadyEventCallbacks() {
    _callbacks.ready.forEach(function(callback) {
      callback();
    });
  }

  /**
   * Decodes a query string to a query
   * 将查询参数由string转化为一个查询数组对象
   * @param {string} str String类型的查询条件
   * @return {Array.<string>} 数组型的查询条件
   */
  function _stringToQuery(string) {
    var decoded = string.split(":");
    if (decoded.length !== 2) {
      throw new Error("Invalid internal state! Not a valid geohash query: " + string);
    }
    return decoded;
  }

  /**
   * 数组类型的查询转化为String类型的查询
   * 
   * @param {Array.<string>} query 数组类型的查询
   * @param {string} 字符串类型的查询
   */
  function _queryToString(query) {
    if (query.length !== 2) {
      throw new Error("Not a valid geohash query: " + query);
    }
    return query[0]+":"+query[1];
  }

  /**
   * Turns off all callbacks for the provide geohash query.
   * 关闭某geohash查询的所有回调
   * @param {Array.<string>} query 一个geohash查询
   * @param {Object} queryState 一个保存着当前查询现有状态的对象
   */
  function _cancelGeohashQuery(query, queryState) {
    var queryRef = _wilddogRef.orderByChild("g").startAt(query[0]).endAt(query[1]);
    queryRef.off("child_added", queryState.childAddedCallback);
    queryRef.off("child_removed", queryState.childRemovedCallback);
    queryRef.off("child_changed", queryState.childChangedCallback);
    queryRef.off("value", queryState.valueCallback);
  }

  /**
   * 删除当前正在查询的但是非必须的Wilddog查询
   */
  function _cleanUpCurrentGeohashesQueried() {
    var keys = Object.keys(_currentGeohashesQueried);
    var numKeys = keys.length;
    for (var i = 0; i < numKeys; ++i) {
      var geohashQueryStr = keys[i];
      var queryState = _currentGeohashesQueried[geohashQueryStr];
      if (queryState.active === false) {
        var query = _stringToQuery(geohashQueryStr);
        // 删除将来不会再进行查询操作的查询
        //_cancelGeohashQuery(query, queryState);
        delete _currentGeohashesQueried[geohashQueryStr];
      }
    }

    // 删除不会再被查询的位置信息
    keys = Object.keys(_locationsTracked);
    numKeys = keys.length;
    for (i = 0; i < numKeys; ++i) {
      var key = keys[i];
      if (!_geohashInSomeQuery(_locationsTracked[key].geohash)) {
        if (_locationsTracked[key].isInQuery) {
          throw new Error("Internal State error, trying to remove location that is still in query");
        }
        delete _locationsTracked[key];
      }
    }

    // 指示清除当前的geohash查询的任务已经结束
    _geohashCleanupScheduled = false;

    // 取消未完成的计划清理  
    if (_cleanUpCurrentGeohashesQueriedTimeout !== null) {
      clearTimeout(_cleanUpCurrentGeohashesQueriedTimeout);
      _cleanUpCurrentGeohashesQueriedTimeout = null;
    }
  }

  /**
   * 更新位置信息时的回调。当某key的位置信息改变时会更新key相关的信息并且触发相关的事件
   * 当一个key从WildGeo中删除时或者函数参数为null时，会执行必要的清理
   * @param {string} key wildgeo位置信息的key
   * @param {?Array.<number>} location  [latitude, longitude] 数组形式的位置信息
   */
  function _updateLocation(key, location) {
    validateLocation(location);
    // Get the key and location
    var distanceFromCenter, isInQuery;
    var wasInQuery = (_locationsTracked.hasOwnProperty(key)) ? _locationsTracked[key].isInQuery : false;
    var oldLocation = (_locationsTracked.hasOwnProperty(key)) ? _locationsTracked[key].location : null;

    // 确定参数location代表的位置是否在查询范围内
    distanceFromCenter = WildGeo.distance(location, _center);
    isInQuery = (distanceFromCenter <= _radius);

    // 把参数传递的location添加到位置查询字典中，即使他不在查询范围内
    _locationsTracked[key] = {
      location: location,
      distanceFromCenter: distanceFromCenter,
      isInQuery: isInQuery,
      geohash: encodeGeohash(location, g_GEOHASH_PRECISION)
    };
    // 如果参数key进入查询范围，触发"key_entered"事件
    if (isInQuery && !wasInQuery) {
      _fireCallbacksForKey("key_entered", key, location, distanceFromCenter);
    } else if (isInQuery && oldLocation !== null && (location[0] !== oldLocation[0] || location[1] !== oldLocation[1])) {
      _fireCallbacksForKey("key_moved", key, location, distanceFromCenter);
    } else if (!isInQuery && wasInQuery) {
      _fireCallbacksForKey("key_exited", key, location, distanceFromCenter);
    }
  }

  /**
   * 检查参数geohash当前是否在任意查询中
   * @param {string} geohash The geohash.
   * @param {boolean} Returns 当geohash在某个geohash查询当中时返回true
   */
  function _geohashInSomeQuery(geohash) {
    var keys = Object.keys(_currentGeohashesQueried);
    var numKeys = keys.length;
    for (var i = 0; i < numKeys; ++i) {
      var queryStr = keys[i];
      if (_currentGeohashesQueried.hasOwnProperty(queryStr)) {
        var query = _stringToQuery(queryStr);
        if (geohash >= query[0] && geohash <= query[1]) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 删除某个位置信息，必要时触发事件
   * @param {string} key 要被删除的key
   * @param {?Array.<number>} currentLocation [latitude, longitude]型式的当前位置信息，如果已经被删除了，为null
   */
  function _removeLocation(key, currentLocation) {
    var locationDict = _locationsTracked[key];
    delete _locationsTracked[key];
    if (typeof locationDict !== "undefined" && locationDict.isInQuery) {
      var distanceFromCenter = (currentLocation) ? WildGeo.distance(currentLocation, _center) : null;
      _fireCallbacksForKey("key_exited", key, currentLocation, distanceFromCenter);
    }
  }

  /**
   * 当有字节点被添加的时候执行的回调
   * @param {Wilddog DataSnapshot} locationDataSnapshot 删除节点的数据快照
   */
  function _childAddedCallback(locationDataSnapshot) {
    _updateLocation(locationDataSnapshot.key(), decodeWildGeoObject(locationDataSnapshot.val()));
  }

  /**
   * 子节点改变事件的回调
   * @param {Wilddog DataSnapshot} locationDataSnapshot 变化节点的数据快照
   */
  function _childChangedCallback(locationDataSnapshot) {
    _updateLocation(locationDataSnapshot.key(), decodeWildGeoObject(locationDataSnapshot.val()))
  }

  /**
   * Callback for child removed events
   * 子节点被删除事件的回调
   * @param {Wilddo DataSnapshot} locationDataSnapshot 被删除节点存在时的数据快照
   */
  function _childRemovedCallback(locationDataSnapshot) {
    var key = locationDataSnapshot.key();
    if (_locationsTracked.hasOwnProperty(key)) {
      _wilddogRef.child(key).once("value", function(snapshot) {
        var location = snapshot.val() === null ? null : decodeWildGeoObject(snapshot.val());
        var geohash = (location !== null) ? encodeGeohash(location) : null;
        if (!_geohashInSomeQuery(geohash)) {
          _removeLocation(key, location);
        }
      });
    }
  }

  /**
   * 当所有的geohash查询都已经获取完所有的子节点添加事件并且必要时触发了ready事件时，调用此回调。
   */
  function _geohashQueryReadyCallback(queryStr) {
    var index = _outstandingGeohashReadyEvents.indexOf(queryStr);
    if (index > -1) {
      _outstandingGeohashReadyEvents.splice(index, 1);
    }
    _valueEventFired = (_outstandingGeohashReadyEvents.length === 0);

    // 如果所有的查询都已经被执行，触发ready事件。
    if (_valueEventFired) {
      _fireReadyEventCallbacks();
    }
  }

  /**
   * 当有新的geohash进入查询边界时附加一个监听器到Wilddo
   */
  function _listenForNewGeohashes() {
    // 获取所有geohash查询列表
    var geohashesToQuery = geohashQueries(_center, _radius*1000).map(_queryToString);

    //去重
    geohashesToQuery = geohashesToQuery.filter(function(geohash, i){
      return geohashesToQuery.indexOf(geohash) === i;
    });

    // 对于我们正在查询的geohash，检查他们是否还需要查询。如果是，不要再查询他们。
    // 否则当我们下一次清理查询字典的时候把他们标记为未查询状态
    var keys = Object.keys(_currentGeohashesQueried);
    var numKeys = keys.length;
    for (var i = 0; i < numKeys; ++i) {
      var geohashQueryStr = keys[i];
      var index = geohashesToQuery.indexOf(geohashQueryStr);
      if (index === -1) {
        _currentGeohashesQueried[geohashQueryStr].active = false;
      }
      else {
        _currentGeohashesQueried[geohashQueryStr].active = true;
        geohashesToQuery.splice(index, 1)
      }
    }

    // 如果还没有清理现有的geohash查询，并且geohash数量超过25个，
    // 剔除掉一个超时的geohash来清理，避免我们创建无限大的无用查询。
    if (_geohashCleanupScheduled === false && Object.keys(_currentGeohashesQueried).length > 25) {
      _geohashCleanupScheduled = true;
      _cleanUpCurrentGeohashesQueriedTimeout = setTimeout(_cleanUpCurrentGeohashesQueried, 10);
    }

    // 追踪那些已经执行的geohash，从而知道何时触发"ready"事件
    _outstandingGeohashReadyEvents = geohashesToQuery.slice();

    
    //轮询所有geohash找到并监听到新的具有相同前缀的geohash，每有一个匹配，就附加一个回调触发相应的事件
    // 当所有的geohash查询都完成后，触发"ready"事件
    geohashesToQuery.forEach(function(toQueryStr) {
      // 解码geohash查询字符串
      var query = _stringToQuery(toQueryStr);

      // 建立Wilddog查询
      var wilddogQuery = _wilddogRef.orderByChild("g").startAt(query[0]).endAt(query[1]);

      // 对于新的匹配的geohash,决定是否触发"key_entered"事件
      var childAddedCallback = wilddogQuery.on("child_added", _childAddedCallback);
      var childRemovedCallback = wilddogQuery.on("child_removed", _childRemovedCallback);
      var childChangedCallback = wilddogQuery.on("child_changed", _childChangedCallback);

      // 当当前的geohash查询被执行，看看它是否是最后一个被执行的
      // 如果是，标记"value"事件已经触发
      // 注意: Wilddog在所有的"child_added" 事件触发后触发"value"事件
      var valueCallback = wilddogQuery.on("value", function() {
        wilddogQuery.off("value", valueCallback);
        _geohashQueryReadyCallback(toQueryStr);
      });

      // 把geohash添加到当前的geohash查询字典中并保存他的状态
      _currentGeohashesQueried[toQueryStr] = {
        active: true,
        childAddedCallback: childAddedCallback,
        childRemovedCallback: childRemovedCallback,
        childChangedCallback: childChangedCallback,
        valueCallback: valueCallback
      };
    });
    // 基于计算geohash的算法，即使更新撸查询半径，也有可能查询不到新的geohash。
    // 这将导致，.updateQuery()被调用后不会触发"READY"事件
    // 查看是否是这种情况，然后出发"READY"事件
    if(geohashesToQuery.length === 0) {
      _geohashQueryReadyCallback();
    }
  }

  /********************/
  /*  PUBLIC METHODS  */
  /********************/
  /**
   * 返回查询的圆心坐标
   * @return {Array.<number>} 查询圆心的坐标，形式为[latitude, longitude]
   */
  this.center = function() {
    return _center;
  };

  /**
   * 返回查询的半径,单位km
   * @return {number} 查询的半径,单位km
   */
  this.radius = function() {
    return _radius;
  };

  /**
   * 更新查询条件
   * @param {Object} newQueryCriteria 指定了圆心坐标和半径的查询条件。
   */
  this.updateCriteria = function(newQueryCriteria) {
    // 校验并存储新的查询条件
    validateCriteria(newQueryCriteria);
    _center = newQueryCriteria.center || _center;
    _radius = newQueryCriteria.radius || _radius;

    // 遍历所有查询范围内的位置，更新它们到查询圆心的距离，并触发正确的事件
    var keys = Object.keys(_locationsTracked);
    var numKeys = keys.length;
    for (var i = 0; i < numKeys; ++i) {
      var key = keys[i];

      // 获取当前key的缓存信息
      var locationDict = _locationsTracked[key];

      // 查看这个位置是否已经在查询中
      var wasAlreadyInQuery = locationDict.isInQuery;

      // 更新该位置到新的查询圆心的距离
      locationDict.distanceFromCenter = WildGeo.distance(locationDict.location, _center);

      // 判断这个位置现在是否在查询中
      locationDict.isInQuery = (locationDict.distanceFromCenter <= _radius);

      // 如果这个位置刚好离开了查询范围， 触发"key_exited"事件
      if (wasAlreadyInQuery && !locationDict.isInQuery) {
        _fireCallbacksForKey("key_exited", key, locationDict.location, locationDict.distanceFromCenter);
      }

      // 如果这个位置刚好进入查询范围内， 触发"key_entered"事件回调
      else if (!wasAlreadyInQuery && locationDict.isInQuery) {
        _fireCallbacksForKey("key_entered", key, locationDict.location, locationDict.distanceFromCenter);
      }
    }

    // 重置控制核实触发"ready"事件的变量
    _valueEventFired = false;

    // 监听新的被添加到WildGeo中的geohash，并触发正确的事件
    _listenForNewGeohashes();
  };

  /**
   * 为查询附加某事件类型触发的回调。可用的事件包括： "ready", "key_entered", "key_exited", 和 "key_moved"。
   *  "ready"事件回调不传递参数。其他的回调将传递三个参数：(1)位置的key, (2) 位置的经纬坐标数组[latitude, longitude]，
   * (3)位置到查询圆心的距离，单位是km
   *
   * 当查询从服务器中初始化的时候就会触发一次ready事件。当所有其他的加载数据的事件触发后ready事件会触发。 每次用
   * updateQuery()的时候ready事件将被立即触发一次，当所有的数据被加载并且其他所有的事件都被触发后也会引发ready事件。
   * 
   * 当一个key进入了查询范围内时触发key_entered事件。当一个key从查询范围外进入查询范围内或者一个key被写入数据正好
   * 落入查询范围内时会触发key_entered事件。 
   *
   * 当一个Key从查询范围内移出查询范围时，会触发key_exited事件。如果这个key被彻底从GeoDo中删除的话，被传递给回调
   * 函数的位置信息和距离信息将为null。 
   * 
   * 当一个key已经在查询范围内部，当它在内部发生移动的时候，会触发key_moved事件。
   * 
   * 返回一个GeoCallbackRegistration，用来取消 callback回调。
   * 
   * @param {string} eventType 附加回调的事件类型，包括 "ready", "key_entered","key_exited", or "key_moved"
   * @callback callback 某个事件触发时调用的回调函数
   * @return {GeoCallbackRegistration} 用来取消一个回调
   */
  this.on = function(eventType, callback) {
    // 输入校验
    if (["ready", "key_entered", "key_exited", "key_moved"].indexOf(eventType) === -1) {
      throw new Error("event type must be \"ready\", \"key_entered\", \"key_exited\", or \"key_moved\"");
    }
    if (typeof callback !== "function") {
      throw new Error("callback must be a function");
    }

    // 把回调添加到查询的回调列表中
    _callbacks[eventType].push(callback);

    // 如果这是一个"key_entered"回调， 如果一个位置进入查询范围，触发此回调
    if (eventType === "key_entered") {
      var keys = Object.keys(_locationsTracked);
      var numKeys = keys.length;
      for (var i = 0; i < numKeys; ++i) {
        var key = keys[i];
        var locationDict = _locationsTracked[key];
        if (locationDict.isInQuery) {
          callback(key, locationDict.location, locationDict.distanceFromCenter);
        }
      }
    }

    // 如果这是一个"ready"回调， 如果查询准备就绪，触发此回调
    if (eventType === "ready") {
      if (_valueEventFired) {
        callback();
      }
    }

    // 返回一个事件注册，它能用来取消回调
    return new GeoCallbackRegistration(function() {
      _callbacks[eventType].splice(_callbacks[eventType].indexOf(callback), 1);
    });
  };

  /**
   * 终止这个查询，所有通过on()附加的回调都会被取消，这个查询在未来都不会再被使用了
   */
  this.cancel = function () {
    // 取消查询回调列表中的所有回调
    _callbacks = {
      ready: [],
      key_entered: [],
      key_exited: [],
      key_moved: []
    };

    // 关闭所有对当前geohash进行查询的Wilddog监听器
    var keys = Object.keys(_currentGeohashesQueried);
    var numKeys = keys.length;
    for (var i = 0; i < numKeys; ++i) {
      var geohashQueryStr = keys[i];
      var query = _stringToQuery(geohashQueryStr);
      _cancelGeohashQuery(query, _currentGeohashesQueried[geohashQueryStr]);
      delete _currentGeohashesQueried[geohashQueryStr];
    }

    // 删除所有缓存的位置
    _locationsTracked = {};

    // 关闭当前的geohash查询清理时间间隔
    clearInterval(_cleanUpCurrentGeohashesQueriedInterval);
  };


  /*****************/
  /*  CONSTRUCTOR  */
  /*****************/
  // 创建查询的GoeDog的Wilddog引用
  if (Object.prototype.toString.call(wilddogRef) !== "[object Object]") {
    throw new Error("wilddogRef must be an instance of Wilddog");
  }
  var _wilddogRef = wilddogRef;

  // 事件回调
  var _callbacks = {
    ready: [],
    key_entered: [],
    key_exited: [],
    key_moved: []
  };

  // 决定核实触发"ready"事件的变量
  var _valueEventFired = false;
  var _outstandingGeohashReadyEvents;

  // 一个保存当前查询中活跃的位置的字典
  // 注意，不是所有的位置都在查询范围内
  var _locationsTracked = {};

  // 保存有活跃回调的geohash查询的字典
  var _currentGeohashesQueried = {};

  // 每隔十秒钟，清理我们正在查询的geohash。这样做，是为了当他们移出查询范围的之后不久我们可以再次查询他们。
  var _geohashCleanupScheduled = false;
  var _cleanUpCurrentGeohashesQueriedTimeout = null;
  var _cleanUpCurrentGeohashesQueriedInterval = setInterval(function() {
      if (_geohashCleanupScheduled === false) {
        _cleanUpCurrentGeohashesQueried();
      }
    }, 10000);

  // 校验并存储查询条件
  validateCriteria(queryCriteria, /* requireCenterAndRadius */ true);
  var _center = queryCriteria.center;
  var _radius = queryCriteria.radius;

  // Listen for new geohashes being added around this query and fire the appropriate events
  // 监听被添加到当前查询附近geohash,并触发适当的事件
  _listenForNewGeohashes();
};

return WildGeo;
})();

// Export WildGeo if this is being run in node
if (typeof module !== "undefined" && typeof process !== "undefined") {
  module.exports = WildGeo;
}