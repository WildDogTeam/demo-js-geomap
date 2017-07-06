var wilddog = require('wilddog');
var WildLocation = require('wilddog-location');

wilddog.regService('location', function(app) {
    if (app == null) {
        throw new Error('application not initialized!Please call wilddog.initializeApp first');
        return;
    };
    return new WildLocation(app);
});
wilddog.Location = WildLocation;

var config = {
    syncURL: "https://<appId>.wilddogio.com",
    authDomain: "<appId>.wilddog.com",
}

wilddog.initializeApp(config);

var sync = wilddog.sync();
var wildLocation = wilddog.location();

var defaultArray = [];

var pathArray = [
    [40.020605559354536, 116.46711616151447],
    [40.02061512895047, 116.468275889638],
    [40.020576, 116.469593],
    [40.020601, 116.470484],
    [40.020612, 116.471001],
    [40.020596, 116.471596],
    [40.020592, 116.472261],
    [40.020588, 116.472916],
    [40.020567, 116.473356],
    [40.020493, 116.47386],
    [40.020247, 116.4743],
    [40.019988, 116.474702],
    [40.019647, 116.475212],
    [40.019388, 116.475582],
    [40.019125, 116.475957],
    [40.018747, 116.476494],
    [40.018258, 116.47703],
    [40.017613, 116.477749],
    [40.017001, 116.477883],
    [40.016475, 116.477894],
    [40.016048, 116.477899],
    [40.01558, 116.477915],
    [40.015214, 116.477942],
    [40.014869, 116.477969],
    [40.01431, 116.477991],
    [40.013957, 116.478007],
    [40.013234, 116.478028],
    [40.01293, 116.478055],
    [40.012318, 116.478055],
    [40.011746, 116.478103],
    [40.01152, 116.478125],
    [40.011138, 116.478141],
    [40.010592, 116.478157],
    [40.010337, 116.478168],
    [40.009865, 116.478184],
    [40.009105, 116.478211],
    [40.008862, 116.478237],
    [40.008735, 116.478253],
    [40.008755, 116.477642],
    [40.008731, 116.476891],
    [40.008739, 116.476649],
    [40.008709, 116.476201],
    [40.008709, 116.475754],
    [40.008709, 116.475306],
    [40.008709, 116.474859],
    [40.008709, 116.474412],
    [40.008709, 116.473964],
    [40.008709, 116.473517],
    [40.008709, 116.473070],
    [40.008709, 116.472622],
    [40.008709, 116.472175],
    [40.008707, 116.471728],
    [40.008707, 116.471280],
    [40.008707, 116.470833],
    [40.008707, 116.470386],
    [40.008707, 116.469938],
    [40.008707, 116.469491],
    [40.008707, 116.469044],
    [40.008707, 116.468596],
    [40.008707, 116.468149],
    [40.008709, 116.467702],
    [40.008709, 116.467651],
    [40.009079, 116.467641],
    [40.009379, 116.467631],
    [40.009679, 116.467621],
    [40.009979, 116.467601],
    [40.010179, 116.467591],
    [40.010479, 116.467581],
    [40.010779, 116.467571],
    [40.010979, 116.467561],
    [40.011279, 116.467551],
    [40.011479, 116.467541],
    [40.011978, 116.467475],
    [40.012409, 116.467436],
    [40.012840, 116.467396],
    [40.013271, 116.467356],
    [40.013702, 116.467316],
    [40.014133, 116.467296],
    [40.014564, 116.467276],
    [40.014995, 116.467266],
    [40.015426, 116.467236],
    [40.015857, 116.467216],
    [40.016288, 116.467196],
    [40.016719, 116.467186],
    [40.017150, 116.467176],
    [40.017581, 116.467166],
    [40.018012, 116.467156],
    [40.018443, 116.467156],
    [40.018874, 116.467156],
    [40.019305, 116.467156],
    [40.019736, 116.467146],
    [40.020167, 116.467136],
    [40.020598, 116.467126],
];

function startUpdateActivePoint() {
    var pathArrayIndex = 0;
    wildLocation.removePath('activePoint');
    setInterval(function() {
        var position = wildLocation.customPosition(pathArray[pathArrayIndex]);
        wildLocation.setPosition('activePoint', position);
        var pushKey = 'points/' + sync.push().key();
        var newData = {};
        newData[pushKey] = {
            geohash:'defaulthash',
            location:pathArray[pathArrayIndex],
            timestamp:Date.now()
        };
        newData.isExists = true;
        sync.child('WilddogLocation/path/activePoint').update(newData);
        pathArrayIndex++;
        if (pathArrayIndex >= pathArray.length) {
            pathArrayIndex = 0;
            wildLocation.removePath('activePoint');
        };
    }, 2000);
};

startUpdateActivePoint();

var start = function() {
    setInterval(function() {
        var index = parseInt(Math.random() * defaultArray.length);
        var key = defaultArray[index].key;
        var oldLocation = defaultArray[index].location;
        var newLocation = getNewLocation(oldLocation);
        var position = wildLocation.customPosition(newLocation);

        sync.child('Beijing/' + key).set(newLocation);
        wildLocation.setPosition(key, position);
    }, 150);
}

var baseX1 = 116.310528;
var baseX2 = 116.458843;
var baseY1 = 39.856513;
var baseY2 = 39.963431;
var num1 = 70;
var moveDistanceX = (baseX2 - baseX1) / num1;
var moveDistanceY = (baseY2 - baseY1) / num1;

var getNewLocation = function(array) {
    var location = array;
    var randomDirection = parseInt(Math.random() * 4);
    switch (randomDirection) {
        case 0:
            location[1] += moveDistanceX;
            if (location[1] > baseX2) {
                location[1] -= moveDistanceX;
            };
            break;
        case 1:
            location[1] -= moveDistanceX;
            if (location[1] < baseX1) {
                location[1] += moveDistanceX;
            };
            break;
        case 2:
            location[0] += moveDistanceY;
            if (location[0] > baseY2) {
                location[0] -= moveDistanceX;
            };
            break;
        case 3:
            location[0] -= moveDistanceY;
            if (location[0] < baseY1) {
                location[0] += moveDistanceX;
            };
            break;
    };
    return location;
}

sync.child('Beijing').once('value', function(snap) {
    snap.forEach(function(snapshot) {
        defaultArray.push({
            key: snapshot.key(),
            location: snapshot.val()
        });
    });
    start();
});
