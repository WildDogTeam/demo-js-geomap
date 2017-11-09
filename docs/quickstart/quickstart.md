title: 快速入门
---

你可以通过一次简单的位置同步的来了解 Realtime Location 的用法。

<div class="env">
    <p class="env-title">环境准备</p>
    <ul>
        <li>支持 Chrome、IE 10+ 、Firefox、Safari 等主流浏览器环境 </li>
    </ul>
</div>

## 1. 创建应用

首先，你需要在控制面板中创建应用。

## 2. 安装 SDK

Realtime Location 依赖于高德定位 SDK，因此需要按顺序引入：

**通过标签引用**

<figure class="highlight html"><table style='line-height:0.1'><tbody><tr><td class="code"><pre><div class="line"><span class="tag">&lt;<span class="name">script</span> <span class="attr">src</span>=<span class="string">&quot;<span>ht</span>tp://webapi.amap.com/maps?v=1.3&key=&lt;AMapKey&gt;&quot;</span>&gt;</span><span class="undefined"></span><span class="tag">&lt;/<span class="name">script</span>&gt;</span></div></pre><pre><div class="line"><span class="tag">&lt;<span class="name">script</span> <span class="attr">src</span>=<span class="string">&quot;<span>ht</span>tps://cdn.wilddog.com/sdk/js/<span class="sync_web_v">2.5.6</span>/wilddog.js&quot;</span>&gt;</span><span class="undefined"></span><span class="tag">&lt;/<span class="name">script</span>&gt;</span></div></pre><br><pre><div class="line"><span class="tag">&lt;<span class="name">script</span> <span class="attr">src</span>=<span class="string">&quot;<span>ht</span>tps://cdn.wilddog.com/sdk/js/<span class="location_web_v">0.1.0</span>/wilddog-location.js&quot;</span>&gt;</span><span class="undefined"></span><span class="tag">&lt;/<span class="name">script</span>&gt;</span></div></pre></td></tr></tbody></table></figure>

<blockquote class="warning">
  <p><strong>注意：</strong></p>

引入高德定位 SDK 的时候，需要填入你高德应用的 AMapKey。如果没有，请在[高德开放平台](http://lbs.amap.com/)中获取。

</blockquote>

**通过 npm 下载**

1.安装依赖。

    npm install wilddog wilddog-location

2.在代码中注册 Realtime Location 服务。

```javascript
var wilddog = require('wilddog');
var RealtimeLocation = require('wilddog-location');

wilddog.regService('location', function(app) {
  if (app == null) {
    throw new Error('application not initialized!Please call wilddog.initializeApp first');
    return;
  };
  return new RealtimeLocation(app);
});
wilddog.Location = RealtimeLocation;
```
3.在 html 中引用高德 api。
<figure class="highlight html"><table style='line-height:0.1'><tbody><tr><td class="code"><pre><div class="line"><span class="tag">&lt;<span class="name">script</span> <span class="attr">src</span>=<span class="string">&quot;<span>ht</span>tp://webapi.amap.com/maps?v=1.3&key=&lt;AMapKey&gt;&quot;</span>&gt;</span><span class="undefined"></span><span class="tag">&lt;/<span class="name">script</span>&gt;</span></div></pre></td></tr></tbody></table></figure>

<blockquote class="warning">
  <p><strong>注意：</strong></p>

引入高德定位 SDK 的时候，需要填入你高德应用的 AMapKey。如果没有，请在[高德开放平台](http://lbs.amap.com/)中获取。

</blockquote>

## 3. 初始化 SDK

使用 Realtime Location SDK 之前，需要先创建实例。

```javascript
var config = {
  syncURL: "https://<appId>.wilddogio.com" //输入节点 URL
};
wilddog.initializeApp(config);
var wildLocation = wilddog.location();
```
<blockquote class="warning">
  <p><strong>注意：</strong></p>

初始化需要野狗 AppID。野狗 AppID [野狗控制面板](https://www.wilddog.com/dashboard/) 应用中获取。


</blockquote>

## 4. 位置上传

`startTracingPosition() `方法可以根据 Key 向云端持续上传设备位置，如果云端不存在该 Key，将会自动创建。

```javascript
var locationProvider = wildLocation.AMapLocationProvider("timeInterval", 5000);
wildLocation.startTracingPosition(key, locationProvider);
```
## 5. 位置监听

开启位置上传之后，你可以通过上传的 Key 监听位置的变化。

`onPosition()`  用于实时获取指定 Key 的最新位置信息。

```javascript
var cancelCallback = wildLocation.onPosition(key, function(position) {
    console.log('最新位置的经纬度为： ', position.latitude(), ',' , position.longitude());
})
```


Realtime Location 更多使用方式，请参考 [完整指南](/location/Web/guide/install-sdk.html) 和  [API 文档](/location/Web/api/AMapLocationProvider.html)。
