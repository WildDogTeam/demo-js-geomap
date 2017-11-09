title: 位置同步
---

本篇文档介绍如何实现实时位置同步。

## 1. 位置上传

### 持续上传

`AMapLocationProvider()`方法可以根据 Key 向云端持续上传设备位置，如果云端不存在该 Key，将会自动创建。如果不提供[AMapLocationProvider](AMapLocationProvider.html), 默认创建以时间间隔 5 秒采样的[AMapLocationProvider](AMapLocationProvider.html)上传数据。

```javascript
var locationProvider = wildLocation.AMapLocationProvider("timeInterval", 5000);
wildLocation.startTracingPosition(key[, locationProvider]);
```

<blockquote class="notice">
  <p><strong>提示：</strong></p>

 上传时的 Key 由用户自己创建，是云端位置数据的唯一标识。你可以使用已有的 ID 作为 Key，例如用户 ID，设备 ID 等。

</blockquote>


### 设置上传频率

你可以根据时间或距离设置上传频率：

- 根据时间间隔上传，最小间隔 1 秒, 最大间隔 300 秒。

例如，每 60 秒上传一次位置信息：

```javascript
var locationProvider = wildLocation.AMapLocationProvider("timeInterval", 60000);
wildLocation.startTracingPosition(key, locationProvider);
```

- 根据距离间隔上传，最小间隔 0 米 (1 秒判断一次)，最大间隔 500 米。

例如，每 20 米 上传一次位置信息：

```javascript
var locationProvider = wildLocation.AMapLocationProvider("distanceInterval", 20);
wildLocation.startTracingPosition(key, locationProvider);
```



### 上传自定义属性

除了位置之外，你还可以在上传时附带 JSON 形式的自定义属性。
```javascript
var location = [40,116]// 纬度和经度
var options = {
    timestamp = Date.now(),
    customAttributes = 'my firest customPosition!'
}
var myPosition = wildLocation.customPosition(location[,options]);

wildLocation.setPosition('myPosition', myPosition);
```

### 停止上传

`stopTracingPosition()` 用于取消指定 Key 的位置上传。

```javascript
wildLocation.stopTracingPosition(key);
```



###  单次上传

`setPosition()`方法可以根据 Key 向云端上传一次位置信息，如果 Key 不存在，云端会自动创建。

```javascript
wildLocation.setPosition('myPosition', myPosition);
```



## 2. 位置监听

### 持续监听
`onPosition()`  用于实时获取指定 Key 的最新位置信息。

```javascript
var cancelCallback = wildLocation.onPosition(key, function(position) {
    console.log('最新位置的经纬度为： ', position.latitude(), ',' , position.longitude());
})

```



### 取消监听

`cancelCallback()` 用于取消指定 Key 的位置监听。

```javascript
CallbackRegistration.cancelCallback();
```

`offPosition()` 用于取消所有的位置监听。

```javascript
wildLocation.offPosition();
```



### 单次监听

`getPosition()` 用于获取一次指定 Key 的最新位置信息。

```javascript
wildLocation.getPosition(key).then(function(position) {
    console.log('最新位置的经纬度为： ', position.latitude(), ',' , position.longitude());
})

```


## 3. 距离计算

`Location.distance()` 方法用于计算两个坐标点的距离。

```javascript
var distance = wilddog.Location.distance(position1, position2);
```

通过该方法可以实现实时距离的计算。

例如：持续监听两个 key 的位置，每当它们的位置更新后，计算二者的距离。

```javascript
var position1, position2, distance;
wildLocation.onPosition(key1, function(position) {
    position1 = position;
    distance = wilddog.Location.distance(position1, position2);
    console.log('最新的距离为： ', distance, 'm');
});
wildLocation.onPosition(key2, function(position) {
    position2 = position;
    distance = wilddog.Location.distance(position1, position2);
    console.log('最新的距离为： ', distance, 'm');
});

```
