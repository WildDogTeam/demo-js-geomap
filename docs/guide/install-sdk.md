
title: 安装与初始化
---

本篇文档介绍如何安装和初始化 SDK。



## 1. 安装 SDK

Realtime Location SDK 提供标签引用和 npm 下载两种方式安装。

**通过标签引用**

实时定位 API 依赖于高德定位 SDK，因此需要按顺序引入：

<figure class="highlight html"><table style='line-height:0.1'><tbody><tr><td class="code"><pre><div class="line"><span class="tag">&lt;<span class="name">script</span> <span class="attr">src</span>=<span class="string">&quot;<span>ht</span>tp://webapi.amap.com/maps?v=1.3&key=&lt;AMapKey&gt;&quot;</span>&gt;</span><span class="undefined"></span><span class="tag">&lt;/<span class="name">script</span>&gt;</span></div></pre><pre><div class="line"><span class="tag">&lt;<span class="name">script</span> <span class="attr">src</span>=<span class="string">&quot;<span>ht</span>tps://cdn.wilddog.com/sdk/js/<span class="sync_web_v">2.5.6</span>/wilddog.js&quot;</span>&gt;</span><span class="undefined"></span><span class="tag">&lt;/<span class="name">script</span>&gt;</span></div></pre><br><pre><div class="line"><span class="tag">&lt;<span class="name">script</span> <span class="attr">src</span>=<span class="string">&quot;<span>ht</span>tps://cdn.wilddog.com/sdk/js/<span class="location_web_v">0.1.0</span>/wilddog-location.js&quot;</span>&gt;</span><span class="undefined"></span><span class="tag">&lt;/<span class="name">script</span>&gt;</span></div></pre></td></tr></tbody></table></figure>

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



## 2. 初始化 SDK

使用 Wilddog Location SDK 之前，需要先创建实例。

```javascript
var config = {
  syncURL: "https://<appId>.wilddogio.com" //输入AppID
};
wilddog.initializeApp(config);
// 注意类名不要覆盖全局的变量，如：location 和 Location
var wildLocation = wilddog.location();
```


<blockquote class="warning">
  <p><strong>注意：</strong></p>

初始化需要野狗 AppID。野狗 AppID [野狗控制面板](https://www.wilddog.com/dashboard/) 应用中获取。


</blockquote>
