(function () {
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