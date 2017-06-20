var wilddog = require('wilddog');
var appName = '<appId>';

var wilddogConfig = {
    authDomain: appName + ".wilddog.com",
    syncURL: appName + ".wilddogio.com",
    websocketOnly: true
};

wilddog.initializeApp(wilddogConfig, "DEFAULT");

var sync = wilddog.sync().ref('dataInit');
var auth = wilddog.auth();

var data = {};

for (var i = 0; i < 16; i++) {
    var num1;
    if (i<10) {
        num1 = '0' + i;
    } else {
        num1 = i.toString();
    };
    39.856513 + Math.random() * 0.106918;
    for (var j = 0; j < 16; j++) {
        var num2;
        if (j<10) {
            num2 = '0' + j;
        } else {
            num2 = j.toString();
        };
        var latitude = 39.856513 + Math.random() * 0.106918;
        var longitude = 116.310528 + Math.random() * 0.148315;
        data[num1 + num2] = [latitude,longitude];
    }
};

sync.set(data).then(function () {
    process.exit(0);
}).catch(function () {
    process.exit(1);
});
