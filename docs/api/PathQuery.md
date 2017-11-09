title: PathQuery
---

进行轨迹查询的实例。

## 方法

### startTime

##### 定义

`startTime()`

##### 说明

获取 PathQuery 查询条件的起始时间。

##### 返回值

Int

</br>

---

### endTime

##### 定义

`endTime()`

##### 说明

获取 PathQuery 查询条件的结束时间 。

##### 返回值

Int

</br>

---

### key

##### 定义

`key()`

##### 说明

获取 PathQuery 查询条件的 key 。

##### 返回值

String

</br>

---
<!-- 
### updateCriteria

##### 定义

`updateCriteria(newPathQueryCriteria)`

##### 说明

更新 PathQuery 的查询条件，动态修改，不影响现有监听的使用。

##### 参数

| 参数名 | 说明 |
|---|---|
| PathQueryCriteria | [PathQueryCriteria](Location.html#PathQueryCriteria) 类型，范围查询的条件 Map。 |

</br>

--- -->

### on

##### 定义

`on(callback)`

##### 说明

监听轨迹的变化，每当复合查询条件的轨迹发生变化时都会触发回调。
返回 [CallbackRegistration](CallbackRegistration.html) 用于取消回调。

##### 参数

| 参数名            | 说明                                       |
| -------------- | ---------------------------------------- |
| callback      | Function 类型<br> 回调函数的参数为 PathSnapshot 。 |

##### 返回值

[CallbackRegistration](CallbackRegistration.html)

<br>
---

### once

##### 定义

`once(callback)`

##### 说明

查询当前轨迹的快照。

##### 参数

| 参数名            | 说明                                       |
| -------------- | ---------------------------------------- |
| callback      | Function 类型<br> 回调函数的参数为 PathSnapshot 。 |

##### 返回值

Promise<[PathSnapshot](PathSnapshot.html)>

<br>
---

### cancel

##### 定义

`cancel()`

##### 说明

终止这个查询，所有通过on()附加的回调都会被取消，这个查询在未来都不会再被使用了。

<br>
---
