(function() {
  var flag = true;
  $(".description").on("click", function() {
    if (flag) {
      flag = false;
      $(this).children('.description-details').slideDown("fast");
      $(this).children('.slide-up-arr').slideUp("fast");
      return false;
    }
    // else{
    //   flag = true;
    //   $(this).children('.description-details').slideUp("fast");
    //   $(this).children('.slide-up-arr').slideDown("fast");
    //   return false;
    // }
  });
  $('#moblie-trace').css('color', '#e6501e');
  $('#moblie-trace').on("click", function() {
    flag = true;
    $('.description-details').slideUp("fast");
    $('.slide-up-arr').slideDown("fast");
    switch (currentFunction) {
      case 'pathFunction':
        $('#moblie-path').css('color', '#666');
        $('#moblie-path').children('.arr-right-selected').hide();
        $('#moblie-path').children('.arr-right').show();
        stopRealPath();
        break;
      case 'circleFunction':
        $('#moblie-circle').css('color', '#666');
        $('#moblie-circle').children('.arr-right-selected').hide();
        $('#moblie-circle').children('.arr-right').show();
        stopCircleQuery();
        break;
      case 'traceFunction':
        return false;
    }
    $(this).css('color', '#e6501e');
    $(this).children('.arr-right-selected').show();
    $(this).children('.arr-right').hide();
    currentFunction = 'traceFunction';
    startRealPosition();
    map.setCenter(new AMap.LngLat(locations.center[1], locations.center[0]));
    return false;
  })
  $('#moblie-path').on("click", function() {
    flag = true;
    $('.description-details').slideUp("fast");
    $('.slide-up-arr').slideDown("fast");
    switch (currentFunction) {
      case 'pathFunction':
        return false;
      case 'circleFunction':
        $('#moblie-circle').css('color', '#666');
        $('#moblie-circle').children('.arr-right-selected').hide();
        $('#moblie-circle').children('.arr-right').show();
        stopCircleQuery();
        break;
      case 'traceFunction':
        $('#moblie-trace').css('color', '#666');
        $('#moblie-trace').children('.arr-right-selected').hide();
        $('#moblie-trace').children('.arr-right').show();
        stopRealPosition();
        break;
    }
    $(this).css('color', '#e6501e');
    $(this).children('.arr-right-selected').show();
    $(this).children('.arr-right').hide();
    currentFunction = 'pathFunction';
    startRealPath();
    map.setCenter(new AMap.LngLat(locations.center[1], locations.center[0]));
    return false;
  })
  $('#moblie-circle').on("click", function() {
    flag = true;
    $('.description-details').slideUp("fast");
    $('.slide-up-arr').slideDown("fast");
    switch (currentFunction) {
      case 'pathFunction':
        $('#moblie-path').css('color', '#666');
        $('#moblie-path').children('.arr-right-selected').hide();
        $('#moblie-path').children('.arr-right').show();
        stopRealPath();
        break;
      case 'circleFunction':
        return false;
      case 'traceFunction':
        $('#moblie-trace').css('color', '#666');
        $('#moblie-trace').children('.arr-right-selected').hide();
        $('#moblie-trace').children('.arr-right').show();
        stopRealPosition();
        break;
    }
    $(this).css('color', '#e6501e');
    $(this).children('.arr-right-selected').show();
    $(this).children('.arr-right').hide();
    currentFunction = 'circleFunction';
    startCircleQuery();
    circle.setCenter(new AMap.LngLat(center.longitude(), center.latitude()));
    map.setCenter(circle.getCenter());
    return false;
  })
  $('.slide-down-arr').on("click", function() {
    $('.description-details').slideUp("fast");
    $('.slide-up-arr').slideDown("fast");
    flag = true;
    return false;
  });
}());
