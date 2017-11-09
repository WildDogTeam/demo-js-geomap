title: GeoCircleQuery
---

进行范围查询的实例。

## 方法

### center

##### 定义

`center()`

##### 说明

获取 `CircleQuery`的中心点。

##### 返回值

[Position](Position.html)

</br>

---

### radius

##### 定义

`radius()`

##### 说明

获取 `CircleQuery` 的半径。

##### 返回值

Float

</br>

---

### updateCriteria

##### 定义

`updateCriteria(newCircleQueryCriteria)`

##### 说明

更新 `CircleQuery` 的查询条件，动态修改，不影响现有监听的使用。

##### 参数

| 参数名 | 说明 |
|---|---|
| [CircleQueryCriteria](Location.html#CircleQueryCriteria) | object 类型，范围查询的条件 Map。 |

</br>

---

### on

##### 定义

`on(eventType, callback)`

##### 说明

为查询附加某事件类型触发的回调。可用的事件包括： `"ready"`, `"key_entered"`, `"key_exited"`, 和 `"key_moved"`。
`"ready"`事件回调不传递参数。其他的回调将传递三个参数：(1)位置的`key`， (2) 地理位置，`Position` ，(3)位置到查询圆心的距离，单位是米 。
返回 [CallbackRegistration](CallbackRegistration.html) 用于取消回调。

##### 参数

| 参数名            | 说明                                       |
| -------------- | ---------------------------------------- |
| eventType      | String 类型(non-null)<br>事件类型参见 [EventType](CircleQuery.html#EventType)。 |
| onEvent        | [onEvent](CircleQuery.html#onEvent)(non-null)类型<br>事件发生时的回调函数 。

##### 返回值

[CallbackRegistration](CallbackRegistration.html)

---

#### EventType

GeoCircleQuery [on](CircleQuery.html#on) 方法所支持的事件列表。

| 名称            | 说明                  |
| ------------- | ------------------- |
| key_entered   | 设备进入了查询范围内时触发 key_entered 事件。初始化时所有范围内的设备都会触发一次 key_entered 事件。 |
| key_exited | 设备从查询范围内离开查询范围时，会触发 key_exited 事件。如果这个 key 在云端被删除的话，被传递给回调函数的位置信息和距离信息将为null。 |
| key_moved | 设备已经在查询范围内部，当它在内部发生移动的时候，会触发 key_moved 事件。  |
| ready         | 当初始化或者更新范围条件后，数据都将会重新加载。加载完毕的时候将会触发 ready事件。|

---

#### onEvent

##### 定义

`function(key, position, distance)`

##### 说明

事件发生时所触发的回调函数。

##### 参数

| 参数名      | 说明                                       |
| -------- | ---------------------------------------- |
| key      | String(non-null)类型<br> 地理位置单位的唯一标识。    |
| position     | [Position](Position.html)(non-null) 类型 <br> key 的最新地理位置。 |
| distance     | Float(non-null) 类型 <br> 当前位置到查询圆心的距离。 |

##### 返回值

Void

---


### cancel

##### 定义

`cancel()`

##### 说明

终止这个查询，所有通过`on()`附加的回调都会被取消，这个查询在未来都不会再被使用了。

<br>
---
