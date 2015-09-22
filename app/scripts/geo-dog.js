$(document).ready(function () {
  (function () {
    $(".header-personal").hover(function() {
         $(".header-dropdown-menu").toggle();
     });
    var flag = true;
    $(".description").on("touchstart",function(){
      if(flag){
        flag = false;
        $(this).children('.description-details').slideDown("fast");
        return false;
      }
      else{
        flag = true;
        $(this).children('.description-details').slideUp("fast");
        return false;
      }
    });
    $(document).on("touchstart",function () {
      if(!flag){
        $('.description-details').slideUp("fast");
        flag = true;
        return false;
      }
    });
  }());
  
  (function () {
    function escFullScreen(ele) {

      $(ele).addClass('hide').siblings(".full-screen-btn").removeClass('hide');
      $("#mapContainer").removeClass('mapContainer-full-screen');
      $(".full-screen-aside").hide();

    };

    $(".amap-layers").ready(function(){
      $(".full-screen-btn").removeClass('hide');
    });

    $(".full-screen-btn").on("click",function() {
      $(this).addClass('hide').siblings(".esc-full-screen-btn").removeClass('hide').addClass('esc-full-screen-btn-animate');
      $("#mapContainer").addClass('mapContainer-full-screen');
      $(".full-screen-aside").show();

      $(window).one("keydown",function (event) {
      if (event.keyCode == 27) {
        escFullScreen($(".esc-full-screen-btn"));
      }
    });
    });

    $(".esc-full-screen-btn").on("click",function() {
      escFullScreen($(this));
    })
  }());
});