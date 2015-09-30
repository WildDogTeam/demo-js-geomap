# demo-js-geomap

demo-js-geomap 是一个使用wilddog.js,基于wilddog的轻量js库wildgeo.js和高德地图api完成的一个地图应用，能够实现实时的geohash范围查询。

## 在线示例
http://geomap.wilddogapp.com/

我们提供了一个实例，这个实例将展示在北京市某片区域内的某快递公司快递员的实时动态位置信息，点击地图内的任意点更改紫色圆圈的位置。
[![ 在 GeoMap 演示截图](screenshot.jpg)](http://geomap.wilddogapp.com/)


## 本地运行

首先确认本机已经安装 [Node.js](http://nodejs.org/) 运行环境，然后执行下列指令：

```
git clone git@github.com:WildDogTeam/demo-js-geomap.git
cd  demo-js-geomap
```

安装依赖：

```
npm install
```

启动项目：

```
grunt
```

## 依赖项目

* [lib-js-wildgeo](https://github.com/WildDogTeam/lib-js-wildgeo) 开源js库 WildGeo 可以基于地理坐标位置存储和查询一组key值，它的核心是存储位置坐标的key值。这最大的好处是能够实时地在给定的地理区域内查询符合条件的key值。


## TODO
nothing

## 支持
如果在使用过程中有任何问题，请提 [issue](https://github.com/WildDogTeam/demo-js-geomap/issues) ，我会在 Github 上给予帮助。

## 相关文档

* [Wilddog 概览](https://z.wilddog.com/overview/guide)
* [JavaScript SDK快速入门](https://z.wilddog.com/web/quickstart)
* [JavaScript SDK 开发向导](https://z.wilddog.com/web/guide/1)
* [JavaScript SDK API](https://z.wilddog.com/web/api)
* [下载页面](https://www.wilddog.com/download/)
* [Wilddog FAQ](https://z.wilddog.com/faq/qa)

## License
MIT
http://wilddog.mit-license.org/

## 感谢 Thanks

demo-js-geomap is built on and with the aid of several  projects. We would like to thank the following projects for helping us achieve our goals:

Open Source:

* [GeoFire](https://github.com/firebase/geofire-js) Realtime location queries with Firebase
* [Jquery](query.com) The Write Less, Do More, JavaScript Library

Commercial Partner：

* [高德开放平台](http://lbs.amap.com)  高德地图api,高德地图API,地图API,地图api,高德地图 api,高德手机API,LBS云,高德地图API Android,高德地图API iOS,URI API,最专业的地图API
