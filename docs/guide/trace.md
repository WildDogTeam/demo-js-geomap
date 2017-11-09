title: 实时轨迹
---

## 1. 轨迹记录

`startRecordingPath()`  用于记录指定 Key 的轨迹，并实时上传至云端，默认为 5 秒 上传一次。

### 设置上传频率

你可以根据时间或距离设置上传频率：

- 根据时间间隔上传，最小间隔 1 秒, 最大间隔 300 秒。

例如，每 60 秒上传一次轨迹点：

```javascript
var locationProvider = wildLocation.AMapLocationProvider("timeInterval", 60000);
wildLocation.startRecordingPath(key, locationProvider);
```

- 根据距离间隔上传，最小间隔 0 米 (1 秒判断一次)，最大间隔 500 米。

例如，每 20 米 上传一次轨迹点：

```javascript
var locationProvider = wildLocation.AMapLocationProvider("distanceInterval", 20);
wildLocation.startRecordingPath(key, locationProvider);
```



### 停止记录轨迹

`stopRecordingPath()`用于停止记录指定 Key 的轨迹。

```javascript
wildLocation.stopRecordingPath(key);
```



## 2. 轨迹查询

### 实时轨迹查询

`PathQurey.on()` 用于查询实时轨迹，轨迹一旦发生变化，将会实时更新。

```javascript
var pathQuery = wildLocation.pathQuery(key);
pathQuery.on(function (pathSnapshot) {
    console.log('轨迹的路程长度为： ', pathSnapshot.length());
    var positions = pathSnapshot.points();
    var latestPosition = pathSnapshot.latestPoint();
});
```
<blockquote class="notice">
  <p><strong>提示：</strong></p>

如果你想绘制一条实时的轨迹，可以利用 latest point 实时绘制新的轨迹点。

</blockquote>


**根据时间范围查询轨迹。**

起始时间 QueryStartAtTime

```javascript
var pathQuery = wildLocation.pathQuery(key, {startTime: QueryStartAtTime});
pathQuery.on(function (pathSnapshot) {
    console.log('轨迹的路程长度为： ', pathSnapshot.length());
    var positions = pathSnapshot.points();
    var latestPosition = pathSnapshot.latestPoint();
});

```
结束时间 QueryEndAtTime

```javascript
var pathQuery = wildLocation.pathQuery(key, {endTime: QueryEndAtTime});
pathQuery.on(function (pathSnapshot) {
    console.log('轨迹的路程长度为： ', pathSnapshot.length());
    var positions = pathSnapshot.points();
    var latestPosition = pathSnapshot.latestPoint();
});

```



### 单次轨迹查询

`PathQurey.once()` 用于查询指定时间范围内的轨迹记录。

```javascript
var pathQuery = wildLocation.pathQuery(key);
pathQuery.once(function (pathSnapshot) {
    console.log('轨迹的路程长度为： ', pathSnapshot.length());
    var positions = pathSnapshot.points();
    var latestPosition = pathSnapshot.latestPoint();
});
```
<blockquote class="notice">
  <p><strong>提示：</strong></p>

如果查询时间范围超过轨迹时间范围，将只会返回轨迹时间范围内的轨迹点。

</blockquote>




## 3. 轨迹长度

`pathSnapshot` 的属性 `length` 用于记录轨迹的长度，单位为米。

```javascript
pathSnapshot.length();

```
