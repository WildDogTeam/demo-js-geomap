title: 范围监听
---


## 创建监听范围
`circleQuery()`  方法根据位置与半径创建监听范围。

例如，创建一个半径为 500 米的监听范围。
```javascript
var circleQuery = wildLocation.circleQuery({center:position, radius:500});
```

## 事件

范围监听通过事件的方式实时获取设备的变化信息。


事件包括以下四种


| 名称            | 说明                  |
| ------------- | ------------------- |
| key_entered   | 设备进入了查询范围内时触发 key_entered 事件。初始化时所有范围内的设备都会触发一次 key_entered 事件。 |
| key_exited | 设备从查询范围内离开查询范围时，会触发 key_exited 事件。如果这个 key 在云端被删除的话，被传递给回调函数的位置信息和距离信息将为null。 |
| key_moved | 设备已经在查询范围内部，当它在内部发生移动的时候，会触发 key_moved 事件。  |
| ready         | 当初始化或者更新范围条件后，数据都将会重新加载。加载完毕的时候将会触发 ready事件。|

## 监听范围事件

`CircleQuery.on()` 方法用于与事件配合，监听范围内的设备数据。




key_entered 在设备进入范围时触发，在初始化监听的时候，范围内的设备都将会触发一遍。

```javascript
var enterCb = circleQuery.on('key_entered', function (key, position, distance) {
    console.log('key 为', key, '的地理单位进入范围内！');
});

```

key_exited 在设备离开范围时触发。

```javascript
var exitCb = circleQuery.on('key_exited', function (key, position, distance) {
    console.log('key 为', key, '的地理单位离开查询范围内！');
});

```
key_moved 事件在范围内的设备进行移动的时候触发`。

```javascript

var moveCb = circleQuery.on('key_exited', function (key, position, distance) {
    console.log('key 为', key, '的地理单位离开查询范围内！');
});
```

ready 事件在初始化或者更新查询条件后，数据加载完毕时触发。
```javascript
var readyCb = circleQuery.on('ready', function (key, position, distance) {
    console.log('数据加载完毕');
});

```

## 取消监听

`CallbackRegistration.cancel()` 用于取消指定范围的监听。
例如，取消 `enterCb` 的监听。

```javascript
enterCb.cancel();

```

`circleQuery.cancel()` 用于取消所有的范围监听。

```javascript
circleQuery.cancel();
```

## 实时变更监听范围

`updateCriteria()` 范围监听过程中，可以随时变更监听的位置与半径。每次变更都将会同步一次最新数据。

```javascript
var newQueryCriteria = {
    center: newPosition,
    radius: newRadius
};
circleQuery.updateCriteria(newQueryCriteria);
```
例如，根据设备的实时位置不断更新监听范围。

```javascript
wildLocation.onPosition(myPositionKey, function (position) {
    circleQuery.updateCriteria({
        center: position,
    });
})
```
