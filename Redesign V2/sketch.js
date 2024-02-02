// KNN Classification
// A Beginner's Guide to Machine Learning with ml5.js
// The Coding Train / Daniel Shiffman
// 1: https://youtu.be/KTNqXwkLuM4
// 2: https://youtu.be/Mwo5_bUVhlA
// 3: https://youtu.be/JWsKay58Z2g
// https://thecodingtrain.com/learning/ml5/4.1-ml5-save-load-model.html
// https://editor.p5js.org/codingtrain/sketches/RERqlwJL

//
//pre-game variables
//
let knn; //ml5.js model I used
let features; //pre-trained model that knn is based off
let test_label = "nothing"; //label of image being classified
let model_ready = false; //model is ready when there exists at least one training image to classify
let video_ready = false; //video is ready when video element finishes loading
let model_paused = false; //true when model is actively classifying training data
let collectPressed = false; //if train button is pressed
let selected_button; //currently selected class

//
//while playing variables
//
let playing = false; //true when play button is pressed
let timer; //span between beginning a round and image capture, in seconds
let ai_move; //stores move computer played 
let bot_moves = ['Stein', 'Papier', 'Schere']; //possible moves bot can play
let acc_dict = {}; //dictionary storing number of images collected for each class 
let emoji_dict = {}; //maps move name to respective emoji
let counting = false; //if countdown is active
let win_matrix = {
  'Stein': {'Stein': 0, 'Papier': -1, 'Schere': 1},  //stores as win_matrix[player_move][ai_move] = winner
  'Papier': {'Stein': 1, 'Papier': 0, 'Schere': -1}, // 0 = tie, 1 = player_win, -1 = ai_win
  'Schere': {'Stein': -1, 'Papier': 1, 'Schere': 0}
}

//
//p5.element variables (for html elements)
//
let train_div; //training & settings div

//class button divs
let Stein_button;
let Papier_button;
let Schere_button;

//class button text elements
let Stein;
let Papier;
let Schere; 

let instructions; //instructions text
let reset; //reset button
let play; //play button
let collect; //train button
let tipps;

let bot; //computer component div
let player; //player component
let video; //html video element
let ai_move_text; //html text for ai_move
let player_text; //text element showing current classification
let winner; //countdown + winner html text 

//
//setup function: automatically is run once immediately when page is loaded
//
function setup() {
  noCanvas(); //removes default canvas
  
  //
  //divs are generally intialized hierarchically, from largest to smallest.
  //however, take note that children elements cannot be added to their parents
  //until both have been intialized. for this reason, child() calls occur at
  //the inverse end of the function.
  //
  let app = createDiv(''); //contains everything except the header
  app.class('app');

  //int battleground for game interface
  battleground = createDiv('');
  battleground.class('battleground');

  //init text in-between players
  let winner_div = createDiv('');
  winner_div.class('winner');
  winner = createP(' ');
  //winner.class('big-text');
  play = createButton("Spiele");
  play.class('button');
  play.id('play');
  winner_div.child(play);
  //tipps = createButton("Tipps");
  //tipps.class('button');
  //tipps.id('tipps');
  winner_div.child(play);
  winner_div.child(winner);

  //init player div with subcomponents
  player = createDiv('');
  player.class('competitor-div');
  let player_header = createP('Du');
  player_header.style('font-weight: bold;');
  //player_header.class('big-text');
  video = createCapture(VIDEO, videoReady);
  video.style('transform', 'scaleX(-1)');
  player_text = createP("Trainingsdaten benötigt");
  //player_text.class("big-text");
  //add subcomponents to parent div
  player.child(player_header);
  player.child(video);
  player.child(player_text);

  //init bot div with subcomponents
  bot = createDiv('');
  let bot_header = createP('Virtueller Gegner');
  bot_header.style('font-weight: bold;');
  //bot_header.class('big-text');
  let bot_img = createImg('images/robot.png');
  bot_img.style('min-width: 100px')
  ai_move_text = createP('');
  //ai_move_text.class('big-text');
  bot.class('competitor-div');
  //add subcomponents to parent div
  bot.child(bot_header);
  bot.child(bot_img);
  bot.child(ai_move_text);

  //add players and winner text to battleground
  battleground.child(player);
  battleground.child(winner_div);
  battleground.child(bot);

  //init training & setting panel
  train_div = createDiv('');
  train_div.class('train');
  //init instructions text
  instructions = createP("Wähle eine Klasse und halte die Leertaste gedrückt, um mit dem Training zu beginnen");
  
  
  //init class buttons and subcomponents
  Stein_button = createDiv('');
  Papier_button = createDiv('');
  Schere_button = createDiv('');
  Stein_button.class('class_div');
  Papier_button.class('class_div');
  Schere_button.class('class_div');
  Stein = createP();
  Papier = createP();
  Schere = createP();
  Stein.class('label');
  Papier.class('label');
  Schere.class('label');
  Stein_button.id('Stein');
  Papier_button.id('Papier');
  Schere_button.id('Schere');  

  // New CSS labels:
  let Stein_img = createImg('./images/hand.Stein.png');
  Stein_img.style('max-height: 50px; max-width: 50px;');
  let Stein_label = createP("Stein");
  Stein_label.style('color: white;');
  Stein.child(Stein_img);
  Stein.child(Stein_label);

  let Schere_img = createImg('./images/hand.Schere.png');
  Schere_img.style('max-height: 50px; max-width: 50px;');
  let Schere_label = createP("Schere");
  Schere_label.style('color: white;');
  Schere.child(Schere_img);
  Schere.child(Schere_label);

  let Papier_img = createImg('./images/hand.Papier.png');
  Papier_img.style('max-height: 50px; max-width: 50px;');
  let Papier_label = createP("Papier");
  Papier_label.style('color: white;');
  Papier.child(Papier_img);
  Papier.child(Papier_label);

  // old plain html labels:
  //Stein.html('Stein ✊');
  //Papier.html('Papier ✋');
  //Schere.html('Schere ✌️');

  //add subcomponents to parents
  Stein_button.child(Stein);
  Schere_button.child(Schere);
  Papier_button.child(Papier);

  //init play, reset, and train buttons
  let settings = createDiv('');
  reset = createButton("Gewählte Klasse zurücksetzen");
  collect = createButton("Gewählte Klasse trainieren");
  reset.class('button');
  reset.id('reset');
  collect.class('button');
  collect.id('collect');
  //add play and reset to settings. train is not a part of settings.
  //settings.child(tipps);
  //settings.child(reset);
  let tipps_link = createP('');
  tipps_link.html('<a href="javascript:togglePopup()" style="position: relative; display: flex; min-width: 100px;">Tipps</a>');
  settings.child(tipps_link);
  settings.class('settings');

  let outerDiv = createDiv('');
  outerDiv.child(instructions);
  outerDiv.child(settings);

  //add all subcomponents to train & settings panel.
  //NOTE: order matters here. Each subcomponent is added in the order it appears on-screen
  train_div.child(Stein_button);
  train_div.child(Papier_button);
  train_div.child(Schere_button);
  train_div.child(collect);
  train_div.child(reset);

  //add training panel and game panel to app framework
  app.child(outerDiv);
  app.child(train_div);
  app.child(battleground);
  //
  //end html element initialization
  //

  //init ML models. features is the pre-trained model, 
  //knn is custom-made model
  features = ml5.featureExtractor("MobileNet");
  knn = ml5.KNNClassifier();

  //init emoji dictionary
  emoji_dict[Stein_button.id()] = '<img src="./images/hand.Stein.png"/>'; //'✊';
  emoji_dict[Papier_button.id()] = '<img src="./images/hand.Papier.png"/>'; //"✋";
  emoji_dict[Schere_button.id()] = '<img src="./images/hand.Schere.png"/>'; //'✌️';
  
  //
  //the for loop iterates through each class and initializes
  //its respective accumulator dictionary, as well the the event listener.
  //The event listen listens for a discreet button click, and when detected,
  //changes the selected_button variable to match accordingly, as well as the 
  //button styles. 
  //
  let classes = [Stein_button, Papier_button, Schere_button];
  for (let i = 0; i < classes.length; i++) {
    let this_button = classes[i];
    acc_dict[this_button.id()] = 0;
    //event listener
    this_button.mouseClicked(() =>  {
      // change old selected button back to the "unpressed" style
      if (selected_button) {
        selected_button.style('background-color', color(220));
        selected_button.style('box-shadow', '0 0 10px rgba(0, 0, 0, 0.4)');
      }
      // set new selected button to "pressed" style
      selected_button = this_button;
      selected_button.style('background-color', color('#cdcdcd'));
      selected_button.style('box-shadow', 'inset 0 0 5px rgba(0, 0, 0, 0.4)');
    });
  }

  //
  //Init the train button to respond to mouse/touch presses and releases.
  //These events are listened to continuously (each frame) rather than discreetly,
  //e.g. with mouseClicked().
  //
  collect.mousePressed(startFunction);
  collect.mouseReleased(stopFunction);
  collect.touchStarted(startFunction);
  collect.touchEnded(stopFunction);

  //init reset button event listener. When clicked, the reset button
  //clears the training data from the selected class.
  reset.mouseClicked(() => {
    if (selected_button){
      knn.clearLabel(selected_button.id());
      acc_dict[selected_button.id()] = 0;
      instructions.html("Wähle eine Geste und halte die Leertaste gedrückt, um mit dem Training zu beginnen.");
      reset.elt.blur();
      model_ready = false;
      model_paused = false;
      winner.style('visibility', 'hidden');
    }
  });
  
  //init play button event listener. When clicked, attempt to play a round.
  play.mouseClicked(() => {
    goPlay();
  });
}
//
//end of setup()
//

//
//The main purpose of the following functions is to set booleans to true or false. 
//These booleans are important to conditionals in the draw() function, and let it
//know when certain code blocks can be executed. 
//

//called by createVideo component in setup(). Lets program
//know that the video is ready to collect training data.
function videoReady() {
  video.size(320, 240);
  video_ready = true;
}

//called when collect button is pressed/released, respectively. 
//when collectPressed = true, training data is collected from the camera. 
function startFunction() {
  collectPressed = true;
}

function stopFunction() {
  collectPressed = false;
}
//
//end boolean functions
//

//
//model-specific functions. The following functions are used to train the ML
//model and classify subsequent test images.
//

//Add image captured from video component to the currently selected button,
//parameterized here as button. 
//Called by draw() if startFunction() has been called
function train(button) {
  if (acc_dict[button.id()] < 100) {
    const logits = features.infer(video);
    knn.addExample(logits, button.id());
    acc_dict[button.id()]++;
  }
}

//attempts to classify the image captured by video. classification
//occurs if and only if there exists one class with viable
//training data.
function goClassify() {
  const logits = features.infer(video);
  knn.classify(logits, function (error, result) {
    if (error) {
      console.error(error);
    } else if (!model_paused) {
      test_label = result.label;
      player_text.html(emoji_dict[result.label]);
      goClassify();
    }
  });
}
//
//end model-specific functions
//

//
//game-specific functions. the following functions control when
//and how game rounds can be called.
//

//attempt to start a round. fails if there isn't at least one viable class
//with training data.
function goPlay() {
  if (!model_ready) {
    instructions.html('Du musst erst eine Geste trainieren, bevor Du spielen kannst.');
  } else {    
    timer = 3; //countdown in seconds
    model_paused = false; //begin classifying again if paused
    model_ready = false; 
    playing = true; //starts countdown in draw()
  }
}

//helper function that simulates the AI "choosing" a move while playing = true.
function rollAI() {
  ai_move_text.html(emoji_dict[bot_moves[frameCount % 3]]);
}

//countdown function. Called by goPlay() once a viable round beings. 
//it's a bit overengineered because it relys on the current frameCount, but
//in summary it will count down from timer (seconds) to zero. At zero seconds, 
//the ML model is paused and the last image captured is passed to findWinner(), 
//along with a random move chosen for the computer opponent.
function countdown() {
  if (frameCount % 60 != 0) {
    if (counting == false) {
      winner.style('visibility', 'hidden');
      return;
    }
  }
  if (counting == false) {
    counting = true;
    winner.style('visibility', 'visible');
  }
  if (frameCount % 5 == 0) rollAI(); //change AI move
  if (frameCount % 60 == 59) {
    if (timer > 0) timer--;
    if (timer == 0) {
      playing = false;
      model_paused = true;
      counting = false;
      //randomly select AI move
      ai_move = bot_moves[Math.floor(Math.random() * bot_moves.length)]; 
      ai_move_text.html(emoji_dict[ai_move]);
      findWinner();
    }
  }
}

//called by countdown() when timer = 0. Evaluates the player's move against
//the computer's move and chooses a winner using win_matrix. 
function findWinner() {
  if (win_matrix[test_label][ai_move] > 0) winner.html(test_label + " schlägt " + ai_move + '. Du gewinnst!');
  else if (win_matrix[test_label][ai_move] < 0) winner.html(ai_move + " schlägt " + test_label + '. Du verlierst!');
  else (winner.html('Ihr habt beide ' + test_label + ' gezogen. Unentschieden!'));
}
//
//end play-specific functions
//

//
// draw is called everyframe after setup()-- 60 frames per second(!)
//
function draw() {
  
  //call train() if there is a valid button selected, the video is ready to capture,
  //and either the space bar or train button are being pressed.
  if (selected_button && video_ready) {
    if (keyIsDown(32) || collectPressed) {
      train(selected_button);
    }
  }

  //call goClassify() if there exists at least one valid class with training data
  if (!model_ready && knn.getNumLabels() > 0) {
    goClassify();
    model_ready = true;
  }

  //playing=true while play has been pressed and the timer has yet to reach 0.
  if (playing) {
    winner.html(timer);
    instructions.html("Ziehen in " + timer + " Sekunden...");
    countdown();
  } else if (acc_dict[Stein_button.id()] == 100 && acc_dict[Papier_button.id()] == 100 && acc_dict[Schere_button.id()] == 100) {
    instructions.html('Klicke auf Spielen und halte eine Geste in die Kamera!');
  }
}
//
//init training bars. each training bar is inside 1 of 3 p5 instances,
//each with its own canvas element. Each p5 instance below has its own
//setup() and draw() loop. These function the same as the main setup()/draw()
//loop, but they have their own local variables and functions. 
//
let canvas_width = 450;
let canvas_height = 40;
let text_height = 16
let text_width = 120;
// init Stein frame count
let Stein_sketch = function(p) {
  let canvas;
  let run_me;
  p.setup = function() {
    // p.background('#f0f0f0');
    canvas = p.createCanvas(canvas_width, canvas_height);
    // console.log(p.Stein_button);
    // canvas.parent(Stein_button);
    // console.log(document.getElementById('collect'));
    // canvas.parent('Stein');
    run_me = true;
    p.background(255);
    p.textSize(24);
    p.fill(0);
    p.text('0 Bilder erfasst', text_width, text_height); // Adjusted Y-coordinate
  };
  //draw Stein frame count
  p.draw = function() {
    if (run_me) {
      canvas.parent(Stein_button);
      run_me = false;
      //console.log('adding canvas to Stein parent');
    }
    if (selected_button == Stein_button) {
      p.background(255);
      // Calculate the width of the bar based on the accumulator value
      let barWidth = p.map(acc_dict['Stein'], 0, 100, 0, p.width);
  
      // Interpolate the color from red to gree
      let barColor = p.lerpColor(p.color('#B5C8F8'), p.color('#85A6F9'), acc_dict['Stein'] / 100);
       
      // Draw the bar
       p.fill(barColor);
       p.rect(0, 0, barWidth, 100);
  
       p.textSize(24);
       p.fill(0);
       p.text(acc_dict['Stein'] + ' Bilder erfasst', text_width, text_height); // Adjusted Y-coordinate
    }
  };
};
// init Schere frame count
let Schere_sketch = function(p) {
  let canvas;
  let run_me;
  p.setup = function() {
    //p.background(220);
    canvas = p.createCanvas(canvas_width, canvas_height);
    p.background(255);
    p.textSize(24);
    p.fill(0);
    run_me = true;
    p.text('0 Bilder erfasst', text_width, text_height); // Adjusted Y-coordinate
  };

  //draw Schere frame count
  p.draw = function() {
    if (run_me) {
      canvas.parent(Schere_button);
      run_me = false;
    }
    if (selected_button == Schere_button) {
      p.background(255);
      // Calculate the width of the bar based on the accumulator value
      let barWidth = p.map(acc_dict['Schere'], 0, 100, 0, p.width);
  
      // Interpolate the color from red to gree
      let barColor = p.lerpColor(p.color('#B5C8F8'), p.color('#85A6F9'), acc_dict['Schere'] / 100);
       
      // Draw the bar
       p.fill(barColor);
       p.rect(0, 0, barWidth, 100);
  
       p.textSize(24);
       p.fill(0);
       p.text(acc_dict['Schere'] + ' Bilder erfasst', text_width, text_height); // Adjusted Y-coordinate
    }
  };
};
//init Papier frame count
let Papier_sketch = function(p) {
  let canvas;
  let run_me;
  p.setup = function() {
    //p.background(220);
    canvas = p.createCanvas(canvas_width, canvas_height);
    p.background(255);
    p.textSize(24);
    p.fill(0);
    run_me = true
    p.text('0 Bilder erfasst', text_width, text_height); // Adjusted Y-coordinate
  };
  //draw Papier frame count
  p.draw = function() {
    if (run_me) {
      canvas.parent(Papier_button);
      run_me = false;
    }
    if (selected_button == Papier_button) {
      p.background(255);
      // Calculate the width of the bar based on the accumulator value
      let barWidth = p.map(acc_dict['Papier'], 0, 100, 0, p.width);
  
      // Interpolate the color from red to gree
      let barColor = p.lerpColor(p.color('#B5C8F8'), p.color('#85A6F9'), acc_dict['Papier'] / 100);
       
      // Draw the bar
       p.fill(barColor);
       p.rect(0, 0, barWidth, 100);
  
       p.textSize(24);
       p.fill(0);
       p.text(acc_dict['Papier'] + ' Bilder erfasst', text_width, text_height); // Adjusted Y-coordinate
    }
  };
};

//instantiate all canvases so they actually run
let Stein_canvas = new p5(Stein_sketch);
let Schere_canvas = new p5(Schere_sketch);
let Papier_canvas =  new p5(Papier_sketch);


