$(function() {
  var numberOfChairs = 8;
  var numberOfOccupiedChairs = 4;
  
  var score = 0;
  var lives = 3;
  var endFlag = false;
  var speed = 1;
  
  // set score and lives in gui
  $("#score").text(score);
  $("#lives").text(lives);

  var main = $('#main');
  var massageElement = $('<p></p>').attr('id', 'massage').appendTo(main);
  
  // create array of image status (true/false) dynamically and shuffle it to be random 
  var imageStatus = [];
  for(var i=0; i < numberOfChairs; i++){
    imageStatus.push(i < numberOfOccupiedChairs);
  }
  shuffleArray(imageStatus);

  // create 8 moving chairs
  var chairs = imageStatus.map(function(status){
    return createChair(status ? 'img/face.png' : null);
  });
  
  // create start and finish chairs
  var startChair = createChair('img/me.png');
  startChair.el.attr('id','start');
  var finishChair = createChair(null);
  finishChair.el.attr('id','finish');
  
  // save the current object player and a pointer to me image
  var player = startChair;
  var meImage = $('#start').children('img');
  
  round();


 /**
  * Create Chairs.
  */
  function createChair(img){
    var el = $('<div></div>').appendTo(main);
  
    // Create image for avaters
    if(img){
      el.append($('<img />').attr("src", img));
    }
  
    return {el: el, img: !!img};
  }


 /**
  * Fisher-Yates shuffle algorithm 
  * for randomize array element in-place.
  */
  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
  }


 /**
  * Create the round moving table,
  * (moving the chairs in a circle).
  */
  function round(){
    var radius = main.width() * 0.42,
      cx = main.position().left + radius + 80,
      cy = main.position().top + radius,
      angles = [],
      deg2rad = Math.PI / 180;
    
    for (i = 1; i <= numberOfChairs; i++)
      angles.push((360 / numberOfChairs) * i);
    
    loop();
    
    function loop() {
      for (var i = 0; i < numberOfChairs; i++) {
        angle = angles[i];
        x = cx + radius * Math.cos(angle * deg2rad);
        y = cy + radius * Math.sin(angle * deg2rad);

        chairs[i].el.css({left:x - chairs[0].el.width(), top:y - chairs[0].el.width()});
        angles[i] = angles[i] + speed;
      }
      requestAnimationFrame(loop);
    }
  }


 /**
  * button handler
  */
  $('#jumpButton').click(function(){
    var target = (startChair.img === true) ? chairs : [finishChair];
    
    var closestChair = findChair(player, target);
    
    if (!closestChair){
      massage("close, try again..", 500);
      return;
    }
    
    // check if the seat is taken
    if (closestChair.img){
      lives -= 1;
      $('#lives').text(lives);
  
      // check if the player run out of lives and prompt him to start a new game
      if (lives === 0){
        alert("You don't have more lives, your score is: " + score + " press ok to start a new game.");
        location.reload();
      }
      massage("ouch!", 500);
      
    } else {
      // seat empty
      player.img = false;
      closestChair.img = true;
      player = closestChair;
      
      // change the avatar image to be inside the chair
      meImage.appendTo(closestChair.el);
      
      if (target === chairs) {
        score += 10;
      } else {
        score += 50;
        massage("Great job, now, come back to the previous seat", 2000);
        temp = startChair;
        startChair = finishChair;
        finishChair = temp;
        speed += 0.25;
      }
      
      $('#score').text(score);
    }
  });
  
  
 /**
  *  fade in/out a massage on the screen
  */
  function massage(str, delayTime){
    massageElement.text(str);
    massageElement.fadeIn("slow").delay(delayTime).fadeOut("slow");
  }
  
  
  /*
   * Find the seat near the player seat,
   * or return null if there isn't any.
   */
  function findChair(player, destination){
    player = player.el.position();
    
    for (var i=0; i < destination.length; i++){
      var e = destination[i].el.position();
      
      var left = Math.abs(player.left - e.left);
      var top = Math.abs(player.top - e.top);
      
      // find the seat near the destination seat
      if (left < 145 && top < 30)
        return destination[i];
    }
    return null;
  }
  
});