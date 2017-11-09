title: AMapLocationProvider
---

对高德定位 SDK 进行封装，使其可以作为位置信息的数据源。


## 方法

### sampleType

##### 定义

`sampleType()`

##### 说明

获取 `AMapLocationProvider` 的地理位置采集类型，`"timeInterval"`和`"distaneInterval"`两种类型。

##### 返回值

String

</br>

---

### timeInterval

##### 定义

`timeInterval()`

##### 说明

获取 `AMapLocationProvider` 按照时间间隔采集时的时间频率，单位为毫秒。

##### 返回值

Int

</br>

---

### distaneInterval

##### 定义

`distaneInterval()`

##### 说明

获取 `AMapLocationProvider` 按照距离间隔采集时的距离界限，单位为米 。

##### 返回值

Float

</br>

---

### getCurrentPosition

##### 定义

`getCurrentPosition()`

##### 说明

获取当前的地理位置信息，数据的采集不受 `timeInterval` 和 `distaneInterval` 的限制。

##### 返回值

Promise<[Position](Position.html)>

</br>

---
