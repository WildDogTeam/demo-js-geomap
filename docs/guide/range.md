title: 范围监听
---

### 创建监听范围
`CircleQuery.on()`  根据位置与半径创建监听范围。

```javascript
CircleQuery.on();
```
### 开始监听

`circleQuery` 创建监听范围之后可以开始监听范围内的设备。

例如，监听范围内的设备，如果有新设备进入将会不断更新。

```javascript
var circleQuery = wildLocation.circleQuery({center:position, radius:500});
circleQuery.on('key_entered', function (key, position, distance) {
    console.log('key 为', key, '的地理单位进入范围内！');
    console.log(key, '距离的查询范围圆心的距离为： ', distance);
});
```



> 获取新进入范围或者离开范围的设备，可以参考 [API 文档]()。



### 监听范围事件

`CircleQuery` 每当设备进入或者离开监听范围的时候，都可以设置触发。

`key_exited` 在设备离开范围时触发

```javascript
var exitCb = circleQuery.on('key_exited', function (key, position, distance) {
    console.log('key 为', key, '的地理单位离开查询范围内！');
});

```

`key_entered` 在设备进入范围时触发

```javascript
var enterCb = circleQuery.on('key_entered', function (key, position, distance) {
    console.log('key 为', key, '的地理单位进入范围内！');
});

```

### 取消监听

`CallbackRegistration.cancel()` 用于取消指定范围的监听

```javascript
enterCb();
exitCb();
```

`circleQuery.cancel()` 用于取消所有的范围监听。

```javascript
circleQuery.cancel();
```

### 实时变更监听范围

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
