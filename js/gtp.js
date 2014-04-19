(function($){
	$(document).ready(function() {

    ///////////////////////////////////////////////////////////
    ////////////// GAME VARIABLES /////////////////////////////
    ///////////////////////////////////////////////////////////


    var players = 3;
    var playerTotalScore = new Array(players);
    playerTotalScore[0] = 0;
    playerTotalScore[1] = 0;
    playerTotalScore[2] = 0;

    var playerScore = new Array(players);
    playerScore[0] = 0;
    playerScore[1] = 0;
    playerScore[2] = 0;
    var currentPlayer = 0;

    var rounds = 1;
    var currentRound  = 0;

    var isPuzzleSolved = false;
    var allVowelsFound = false;
    var numberOfVowelsRemaining = 0;

    var currency = "$";

      ///////////////////////////////////////////////////////////
      ///////////////// SCOREBOARD SETUP ////////////////////////
      ///////////////////////////////////////////////////////////


      scoreboard = ich.scoreboard_template();

      for (var p = 0; p < players; p++){
         scoreboard.append(ich.score_template());
      }

      scoreboard.children().first().addClass("alpha");
      scoreboard.children().last().addClass("omega");


      ///////////////////////////////////////////////////////////
      ////////////// END SCOREBOARD SETUP ///////////////////////
      ///////////////////////////////////////////////////////////
    
   // Update Score Function (uses scoreboard

    var updateScore = function(){
      scoreboard.children().each(function(i) { 
    	$(this).children().first().text(currency + playerScore[i]);
	$(this).children().last().text(currency + playerTotalScore[i]);
      });
    }


    ///////////////////////////////////////////////////////////
    ////////////// GAME STATE MACHINE /////////////////////////
    ///////////////////////////////////////////////////////////

    var gsm = StateMachine.create({
      initial: 'init',
      events: [
        //Init the game
        { name: 'initGame',  from: 'init',  to: 'initGame' },
        //Init round when either start or end of last round
        { name: 'initRound', from: ['initGame','termRound'], to: 'initRound'},
        //Start the game with the randomized starting player
        { name: 'initTurn', from: ['initRound', 'termTurn'], to: 'initTurn'},
        //Spin a wheel at the start of the turn, or after sucessfully calling a consonant or buying a vowel.
        { name: 'spin',  from: ['initTurn', 'success'],    to: 'consonant' },
        //Buy a vowel only after spinning the wheel and calling a consonant or buying another vowel previously
        { name: 'buyVowel', from: 'success', to: 'vowel' },
        //On a sucessful selection, prompt for next action
        { name: 'success', from: ['consonant', 'vowel'], to: 'success' },
        //Loose your turn by incorrectly calling a letter or vowel,
        //landing on bankrupt or loose your turn, or incorrectly
        //solving the puzzle (triggered by facilitator clicking button)
        { name: 'looseTurn', from: ['consonant', 'vowel', 'spin'], to: 'termTurn' },
        //Terminate round when solved
        { name: 'solvePuzzle', from: ['initTurn', 'success'], to: 'termRound'  },
        //End game when all rounds end
        { name: 'stop', from: 'termROund', to: 'term'}
      ],

      callbacks: {
        onenterstate:     function(event, from, to) { updateScore(); },
        onenterinitGame:  function(event, from, to) { buildBoard(); },
        onenterinitRound: function(event, from, to) {
		
		/*If there are more rounds to play, start by randomizing the start player and start the player's turn. */		
		if (currentRound < rounds) {

                //Clear out old round scores
    		playerScore[0] = 0;
    		playerScore[1] = 0;
    		playerScore[2] = 0;

                updateScore();

    		currentPlayer = Math.floor((Math.random()*players));
	    	showStartingPlayer();
	    	gsm.initTurn();
		} else { 
	    	gsm.stop();
		}

		},
        onenterinitTurn:  function(event, from, to) { 

        //TODO: Lock out letters and buy a vowel button

        if (!isPuzzleSolved) {
            spinSolveDialog();
        } else {
            console.log("Error: Puzzle cannot be solved at the beginning of a turn because it is the previous player's win");
        }

        },
        onentersuccess:   function(event, from, to) {

        /*If puzzle is unsolved, prompt (iff vowels available & player has > $250, incude vowel option) */ 
        if (!isPuzzleSolved && !allVowelsFound && playerScore[currentPlayer] > 250){
            //alert("Buy a vowel, spin or solve?");
            vowelSpinSolveDialog();
        }
        else if (!isPuzzleSolved){
            spinSolveDialog();
        }
        else if (isPuzzleSolved){
            alert("Please read out the completed phrase");
        }
        else {
            console.log("Error: isPuzzleSolved:" + isPuzzleSolved + " allVowelsFound:" + allVowelsFound + " currentPlayerScore:" + playerScore[currentPlayer]);
        }


        },
        onentertermTurn:  function(event, from, to) { /*Go to next player and start turn. */
		currentPlayer = currentPlayer + 1;
		currentPlayer = currentPlayer % players;
                gsm.initTurn(); //Init next turn.
        },
        onentertermRound: function(event, from, to) { /*Go to next round and start. */ 
		
		//Add point totals of winning player to total score
		playerTotalScore[currentPlayer] += playerScore[currentPlayer];

		currentRound = currentRound + 1;
		gsm.initRound();  //Init next round
        },
        onenterterm:      function(event, from, to) { alert("The game has ended."); },
      }

    });

    var showStartingPlayer = function(){
      alert("Player " + (currentPlayer + 1) + " will start this round.");  /* Uses 1->n rather than 0->(n-1)*/
    }

    ///////////////////////////////////////////////////////////
    ////////////// DIALOG START ///////////////////////////////
    ///////////////////////////////////////////////////////////

    var vowelSpinSolveDialog = function(){
      new Messi('Player ' + (currentPlayer + 1) + ', would you like to buy a vowel, spin the wheel, or solve the puzzle?', 
               {title: 'Buttons', 
                buttons: [
                  {id: 0, label: 'Buy Vowel',  val: 'buyVowel', class: 'btn-success'}, 
                  {id: 1, label: 'Spin Again', val: 'spin', class: 'btn-danger'}, 
                  {id: 2, label: 'Solve',      val: 'solvePuzzle'}],
                callback: function(val) { 
                  if      (val === 'buyVowel')    { gsm.buyVowel(); } 
                  else if (val === 'spin')        { } 
                  else if (val === 'solvePuzzle') { gsm.solvePuzzle(); }
                  else                            { alert("How did you get here?"); }
                }
              });
    }

    var spinSolveDialog = function(){
      new Messi('Player ' + (currentPlayer + 1) + ', would you like to spin the wheel or solve the puzzle?', 
               {title: 'Buttons', 
                buttons: [
                  {id: 0, label: 'Spin', val: 'spin', class: 'btn-danger'}, 
                  {id: 1, label: 'Solve',      val: 'solvePuzzle'}],
                callback: function(val) { 
                  if      (val === 'spin')        {  } 
                  else if (val === 'solvePuzzle') { gsm.solvePuzzle(); }
                  else                            { alert("How did you get here?"); }
                }
              });
    }

    ///////////////////////////////////////////////////////////
    ////////////// DIALOG FINISH //////////////////////////////
    ///////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////
    ////////////// WHEEL START ////////////////////////////////
    ///////////////////////////////////////////////////////////

    //Inspired by http://bramp.net/blog/2011/07/27/html5-canvas-lunch-wheel/

    ///////////////////////////////////////////////////////////
    ////////// WHEEL VARIABLES ////////////////////////////////
    ///////////////////////////////////////////////////////////

    var canvasContext = null;
    var wheelSpinTimer = null;

    var isSpinning = false;
    var spinDuration = 0;
    var countTime = 0;

    var wheelAngle = 0;
    var spinRandomFactor = 0;

    ///////////////////////////////////////////////////////////
    ////////// WHEEL FORMATTING FUNCTIONS /////////////////////
    ///////////////////////////////////////////////////////////

    //Formatting functions should only have a context argument

    var bankruptFormat = function(context){
            context.lineWidth    = 1;
            context.fillStyle  = '#FFFFFF';
            context.textBaseline = "middle";
            context.textAlign    = "center";
            context.font         = "1em Arial";
    }

    ///////////////////////////////////////////////////////////
    ////////// WHEEL CALLBACK FUNCTIONS ///////////////////////
    ///////////////////////////////////////////////////////////

    //Callbacks are used to change gameplay eg. bankrupt
    //and loose your turn.

    ///////////////////////////////////////////////////////////
    ////////////////// WHEEL DATA /////////////////////////////
    ///////////////////////////////////////////////////////////

    var WHEEL = {
      size: 600,
      radius: 290,
      slices: [
        { value : 100, alt : "", color : '#cc0000', formatting : null, callback : null},
        { value : 100, alt : "", color : '#00cc00', formatting : null, callback : null},
        { value : 100, alt : "", color : '#0000cc', formatting : null, callback : null},
        { value :  -1, alt : "BANKRUPT", color : '#000000', formatting : bankruptFormat, callback : null},
        { value : 100, alt : "", color : '#cc0000', formatting : null, callback : null},
        { value : 100, alt : "", color : '#00cc00', formatting : null, callback : null},
        { value : 100, alt : "", color : '#0000cc', formatting : null, callback : null},
        { value :  -1, alt : "BANKRUPT", color : '#000000', formatting : bankruptFormat, callback : null},
        { value : 100, alt : "", color : '#cc0000', formatting : null, callback : null},
        { value : 100, alt : "", color : '#00cc00', formatting : null, callback : null},
        { value : 100, alt : "", color : '#0000cc', formatting : null, callback : null},
        { value :  -1, alt : "BANKRUPT", color : '#000000', formatting : bankruptFormat, callback : null},
        { value : 100, alt : "", color : '#cc0000', formatting : null, callback : null},
        { value : 100, alt : "", color : '#00cc00', formatting : null, callback : null},
        { value : 100, alt : "", color : '#0000cc', formatting : null, callback : null},
        { value :  -1, alt : "BANKRUPT", color : '#000000', formatting : bankruptFormat, callback : null},
        { value : 100, alt : "", color : '#cc0000', formatting : null, callback : null},
        { value : 100, alt : "", color : '#00cc00', formatting : null, callback : null},
        { value : 100, alt : "", color : '#0000cc', formatting : null, callback : null},
        { value :  -1, alt : "BANKRUPT", color : '#000000', formatting : bankruptFormat, callback : null},
        { value : 100, alt : "", color : '#cc0000', formatting : null, callback : null},
        { value : 100, alt : "", color : '#00cc00', formatting : null, callback : null},
        { value : 100, alt : "", color : '#0000cc', formatting : null, callback : null},
        { value :  -1, alt : "BANKRUPT", color : '#000000', formatting : bankruptFormat, callback : null},
        { value : 100, alt : "", color : '#cc0000', formatting : null, callback : null},
        { value : 100, alt : "", color : '#00cc00', formatting : null, callback : null},
        { value : 100, alt : "", color : '#0000cc', formatting : null, callback : null},
        { value :  -1, alt : "BANKRUPT", color : '#000000', formatting : bankruptFormat, callback : null}
      ],

      lineHeight : 22,

      innerLineWidth : 1,
      innerCircleFill : '#ffffff',
      innerCircleStroke : '#000000',

      outerLineWidth : 4,
      outerCircleStroke : '#000000',

      rotations : 25.1327412287, //Math.PI * 8
      spinDuration : 600,

      ///////////////////////////////////////////////////////////
      /////////////// INTERNAL VARS /////////////////////////////
      ///////////////////////////////////////////////////////////

      REFRESH_RATE : 15,

      ///////////////////////////////////////////////////////////
      ////////////////// WHEEL FXNS /////////////////////////////
      ///////////////////////////////////////////////////////////

      /* Easing Equation from
         jQuery Easing v1.3. BSD License. Copyright © 2008 George McGinley Smith
         t: current time, b: beginning value, c: change In value, d: duration  */
      easeOutCubic : function (t, b, c, d) {
	        return c*((t=t/d-1)*t*t + 1) + b;
      },

       onTimerTick : function() {
           countTime += WHEEL.REFRESH_RATE;

           if (countTime >= spinDuration){
             isSpinning = false;
             wheelSpinTimer.stop();

             //Simplify the wheel angle after each spin
             while (wheelAngle >= Math.PI * 2){
               wheelAngle -= Math.PI * 2;
             }

             //Declare spin was decision made by player
             gsm.spin();
           }
           else {
             wheelAngle = WHEEL.easeOutCubic(countTime,0,1,spinDuration) * WHEEL.rotations * spinRandomFactor;
           }

           WHEEL.draw(canvasContext, wheelAngle);

        },

      spin  : function() {
        if (wheelSpinTimer == null){ //Initialize timer first time
           wheelSpinTimer = $.timer(WHEEL.onTimerTick);
           wheelSpinTimer.set({ time : WHEEL.REFRESH_RATE, autostart : false });
        }

        if (!isSpinning && (gsm.is('initTurn') || gsm.is('success'))){
          isSpinning = true;
          spinDuration = WHEEL.spinDuration;
          countTime = 0;

          spinRandomFactor = 0.90 + 0.1 * Math.random();

          wheelSpinTimer.play();
        }
      },

      draw : function(context, angleOffset) {
            WHEEL.clear(context);
            WHEEL.drawSlices(context, angleOffset);
            WHEEL.drawCircles(context);
            WHEEL.drawPointer(context);
      },

      clear : function(context) {
            context.clearRect(0, 0, context.width, context.height);
      },

      drawSlices : function(context, angleOffset) {
            context.lineWidth    = 1;
            context.strokeStyle  = '#000000';
            context.textBaseline = "middle";
            context.textAlign    = "center";
            context.font         = "1.4em Arial";

            sliceAngle = (2 * Math.PI) / WHEEL.slices.length;

            for (var i = 0; i < WHEEL.slices.length; i++) {
                WHEEL.drawSlice(context, i, angleOffset+sliceAngle*i, sliceAngle);
            }
      },

      drawSlice : function(context, index, angle, sliceAngle){
            context.save();
            context.beginPath();

            context.moveTo(WHEEL.size / 2, WHEEL.size / 2);
            context.arc(WHEEL.size / 2, WHEEL.size / 2, WHEEL.radius+WHEEL.outerLineWidth/2, angle, angle + sliceAngle, false); // Draw a arc around the edge
            context.lineTo(WHEEL.size / 2, WHEEL.size / 2);
            context.closePath();

            context.fillStyle = WHEEL.slices[index].color;
            context.fill();
            context.stroke();

            // Draw the text verticaly
            context.translate(WHEEL.size / 2, WHEEL.size / 2);
            context.rotate((angle + angle + sliceAngle) / 2);
	          context.translate(0.85 * WHEEL.radius, 0);
	          context.rotate(Math.PI / 2);

            context.fillStyle = '#000000';

            var str = null;
            if (WHEEL.slices[index].alt.length == 0){
              str = currency + WHEEL.slices[index].value.toString();
            } else {
              str = WHEEL.slices[index].alt;
            }

            if (WHEEL.slices[index].formatting != null)
              WHEEL.slices[index].formatting(context);

            for (var i=0; i < str.length; i++){
                context.fillText(str.charAt(i), 0, WHEEL.lineHeight * i);
            }

            context.restore();
      },

      drawCircles : function(context) {
            //Draw inner circle to conceal Moire pattern
            context.beginPath();
            context.arc(WHEEL.size / 2, WHEEL.size / 2, 20, 0, 2 * Math.PI, false);
            context.closePath();

            context.fillStyle   =  WHEEL.innerCircleFill;
            context.strokeStyle =  WHEEL.innerCircleStroke;
            context.fill();
            context.stroke();

            // Draw outer circle to conceal jaggy edges
            // TODO: This circle aliases pretty bad.
            context.beginPath();
            context.arc(WHEEL.size / 2, WHEEL.size / 2, WHEEL.radius, 0, 2 * Math.PI, false);
            context.closePath();

            context.lineWidth   = WHEEL.outerLineWidth;
            context.strokeStyle = WHEEL.outerCircleStroke;
            context.stroke();
      },

      drawPointer : function(context) {

            context.lineWidth = 2;
            context.strokeStyle = '#000000';
            context.fileStyle = '#ffffff';

            context.beginPath();

            context.moveTo(WHEEL.size / 2, 40);
            context.lineTo(WHEEL.size / 2-10, 0);
            context.lineTo(WHEEL.size / 2+10, 0);
            context.closePath();

            context.stroke();
            context.fill();
      },

    }

    ///////////////////////////////////////////////////////////
    //////////////////////  START /////////////////////////////
    ///////////////////////////////////////////////////////////


	//build a board
    buildBoard = function(){
      var game = $(".game");

      //create the forms to collect phrases
      var phrases_template = ich.phrases_template();
      game.append(phrases_template);

      $(".phrases").append(
        "<form>First phrase: <input type=\"text\" id=\"phrase1\"><br>"+
        "<form>Second phrase: <input type=\"text\" id=\"phrase2\"><br>"+
        "<form>Third phrase: <input type=\"text\" id=\"phrase3\"><br>"+
        "<form>Fourth phrase: <input type=\"text\" id=\"phrase4\"><br>"+
        "<form>Fifth phrase: <input type=\"text\" id=\"phrase5\"><br>"+
        "<input type=\"submit\" value=\"Submit\">"
      );


      //TODO: Sanitize phrases and set to uppercase

			//prepare board
			var board = ich.board_template();
			game.append(board);

			board.disableSelection();

      //Set up the board
      cell = ich.board_cell_template();
      cell_n = 0;

      for (var r=0;r<4;r++) {
        row = ich.board_row_template();

        //Specialize the row
        if ( r == 0 || r == 3){
           columns = ROW12_TILES;
           row.addClass("grid_12 prefix_3")
        }
        else{ //r == 1 || r == 2
           columns = ROW14_TILES;
           row.addClass("grid_14 prefix_2")
        }

        board.append(row);

        //add all cells
        for (var c=0;c<columns;c++) {
          row.append(cell.clone().addClass("cell_"+cell_n));
          cell_n++;
        }

        //grid styling
        row.children().first().addClass("alpha");
        row.children().last().addClass("omega");

      }


      board.append(ich.puzzle_hint_template({hint:"Phrase"}));

      /*end board setup*/

      //Phrase setup----------------------------------------------
      //This is alpha quality

      //*needs to clean up strings here like double spaces

      ///////////////////////////////////////////////////////////
      ///////////////// TESTING PURPOSES ////////////////////////
      ///////////////////////////////////////////////////////////

      // CANNOT FIT!!!!
      // phrase = "BAKED POTATO WITH SOUR CREAM & CHIVES AWDAWD AWDAWD";

      // CANT FIT!!!!
      phrase = "ICE'S CREAME SANDWICHES";
      // phrase = "BAKED POTATO WITH SOUR CREAM & CHIVES";
      // phrase = "THE LORD OF THE RINGS";
      // phrase = "LORD OF THE RINGS";
      // phrase = "SEVEN SWAMS A-SWIMMING";
      // phrase = "I'VE GOT A GOOD FEELING ABOUT THIS";
      // phrase = "BUCKET LIST";
      // phrase = "NEW BABY BUGGY";
      // phrase = "CANADIAN BORDER";
      // phrase = "WHEEL OF FORTUNE";
      // phrase = "APPLE PIE";
      // phrase = "BIG BABY HI";

      ///////////////////////////////////////////////////////////
      ///////////////// END TESTING PURPOSES ////////////////////
      ///////////////////////////////////////////////////////////

      ///////////////////////////////////////////////////////////
      ///////////////// BEGIN PHRASE SETUP //////////////////////
      ///////////////////////////////////////////////////////////

      // we need to set which vowels are in the phrase
      countVowels(phrase);

      //Checks phrase for length
      if (phrase.length > TOTAL_TILES) {
        window.alert("Phrase is too long for the board.");
      }

      // These indices point to the locations on the board below.
      //  X-----------  //
      // -X------------ //
      // -X------------ //
      //  X-----------  //

      FIRST_LINE_IND  = 0;
      SECOND_LINE_IND = 13;
      THIRD_LINE_IND = 27;
      FOURTH_LINE_IND = 40;
      var LINE_IND = new Array();
      LINE_IND.push(FIRST_LINE_IND);
      LINE_IND.push(SECOND_LINE_IND);
      LINE_IND.push(THIRD_LINE_IND);
      LINE_IND.push(FOURTH_LINE_IND);

      //create word chunks for board
      var words = phrase.split(" ");
      var wordIndex = new Array(words.length);

      MIN = 0;            // for each line, we can minimally choose 0 words to display...
      MAX = words.length; // for each line, we can maximally choose "words.length" words to display...

      var string = "";
      var len;
      var words_per_line = new Array();
      var len_per_line = new Array();
      var min_max_diff = 100;
      var cur_max_diff, tmp_diff, word;
      var successful_find = false;
      var choose = new Array(4);
      var tmp_choose = new Array(4);
      var indent;
      var num_lines_occupied;
      var max_line_len;

      // if the phrase length can fit in one line, then we'll do that...
      // otherwise, we need an algorithm to decide how to best fit it on the board
      if (phrase.length > 10) {

        // the algorithm is simple -- try every possibility, and choose the best one that fits on the board
        // the best one minimizes the differences between the lengths of the lines, so
        //  X-----------  //
        // -WHAT-A------- //
        // -BUMMER------- //
        //  X-----------  //
        //
        // is better than
        //
        //  X-----------  //
        // -WHAT--------- //
        // -A-BUMMER----- //
        //  X-----------  //

        for (choose[0] = MIN; choose[0] < MAX; choose[0]++) {
          tmp_choose[0] = choose[0];
          for (choose[1] = MIN; choose[1] < MAX-choose[0]; choose[1]++) {
            tmp_choose[1] = choose[1];
            for (choose[2] = MIN; choose[2] < MAX-choose[0]-choose[1]; choose[2]++) {
              tmp_choose[2] = choose[2];
              choose[3] = MAX - choose[0] - choose[1] - choose[2];
              tmp_choose[3] = choose[3];

              // to decide which choice of words per line is best, we need to calculate the length of the
              // line with the words, taking into consideration the spaces. we do this for each line

              len=0;
              for (var i = 0; i < choose[0]; i++) {
                word = words[i];
                len += word.length;
              } if (len!=0) { len += choose[0]-1;}
              len_per_line[0] = len;

              len=0;
              for (var i = 0; i < choose[1]; i++) {
                word = words[i+choose[0]];
                len += word.length;
              } if (len!=0) { len += choose[1]-1;}
              len_per_line[1] = len;

              len=0;
              for (var i = 0; i < choose[2]; i++) {
                word = words[i+choose[0]+choose[1]];
                len += word.length;
              } if (len!=0) { len += choose[2]-1;}
              len_per_line[2] = len;

              len=0;
              for (var i = 0; i < choose[3]; i++) {
                word = words[i+choose[0]+choose[1]+choose[2]];
                len += word.length;
              } if (len!=0) { len += choose[3]-1;}
              len_per_line[3] = len;

              // now, sometimes the choices are bad -- i.e. the lengths of the lines are too long
              // we don't consider them
              if ((len_per_line[0] > 14) || (len_per_line[1] > 14) || (len_per_line[2] > 14) || (len_per_line[3] > 14)) {
                continue;
              }

              // now, our algorith someimes returns good choices, but the lines are fumbled, for example
              //  WHAT-A------  //
              // -X------------ //
              // -BUMMER------- //
              //  X-----------  //
              //
              // instead of
              //
              //  X-----------  //
              // -WHAT-A------- //
              // -BUMMER------- //
              //  X-----------  //
              //
              // so we fix it here...

              num_lines_occupied = 0;
              for (var i = 0; i < len_per_line.length; i++) {
                if (len_per_line[i] > 0) {
                  num_lines_occupied++;
                }
              }

              if (num_lines_occupied == 2) {
                var count = 0;
                var temp_len_per_line = new Array(4);
                temp_len_per_line[0] = 0; temp_len_per_line[3] = 0;
                tmp_choose[0] = 0; tmp_choose[3] = 0;
                for (var i = 0; i < len_per_line.length; i++) {
                  if (len_per_line[i] > 0) {
                    if (count == 1) {
                      temp_len_per_line[2] = len_per_line[i];
                      tmp_choose[2] = choose[i];
                      len_per_line = temp_len_per_line;
                      break;
                    }
                    else if (count == 0) {
                      temp_len_per_line[1] = len_per_line[i];
                      tmp_choose[1] = choose[i];
                      count++;
                    }
                  }
                }

              } else if (num_lines_occupied == 3) {
                var count = 0;
                var temp_len_per_line = new Array(4);
                temp_len_per_line[3] = 0; tmp_choose[3] = 0;
                for (var i = 0; i < len_per_line.length; i++) {
                  if (len_per_line[i] > 0) {
                    if (count == 2) {
                      temp_len_per_line[2] = len_per_line[i];
                      tmp_choose[2] = choose[i];
                      len_per_line = temp_len_per_line;
                      break;
                    } else if (count == 1) {
                      temp_len_per_line[1] = len_per_line[i];
                      tmp_choose[1] = choose[i];
                      count++;
                    }
                    else if (count == 0) {
                      temp_len_per_line[0] = len_per_line[i];
                      tmp_choose[0] = choose[i];
                      count++;
                    }
                  }
                }
              }

              // we check the validity of our choices one more time now that the lines aren't fumbled
              if ((len_per_line[0] > 12) || (len_per_line[1] > 13) || (len_per_line[2] > 13) || (len_per_line[3] > 12)) {
                continue;
              }


              // now that we've found a potential successful choice of word placements, we need to compare it with
              // other ones we've found. We do that here below
              successful_find = true;

              cur_max_diff = -1;

              for (var i = 0; i < 4; i++) {
                for (var j = i+1; j < 4; j++) {
                  if ((len_per_line[i] != 0) && (len_per_line[j] != 0)) {
                    tmp_diff = Math.abs(len_per_line[i]-len_per_line[j]);
                    if (tmp_diff > cur_max_diff) {
                      cur_max_diff = tmp_diff;
                    }
                  }
                }
              }

              // if we enter here, it means we found a new best option!
              if ((cur_max_diff < min_max_diff) && (cur_max_diff != -1)) {
                min_max_diff = cur_max_diff;

                // we need to set the indent variable to center the text
                // to do this, we need to know the length of the longest line
                max_line_len = 0;
                for (var i = 0; i < len_per_line.length; i++) {
                  max_line_len = Math.max(max_line_len, len_per_line[i]);
                }


                // we set the words here
                words_per_line[0]=[];
                words_per_line[1]=[];
                words_per_line[2]=[];
                words_per_line[3]=[];
                for (var i = 0; i < tmp_choose[0]; i++) {
                  word = words[i];
                  words_per_line[0].push(word);
                }

                for (var i = 0; i < tmp_choose[1]; i++) {
                  word = words[i+tmp_choose[0]];
                  words_per_line[1].push(word);
                }

                for (var i = 0; i < tmp_choose[2]; i++) {
                  word = words[i+tmp_choose[0]+tmp_choose[1]];
                  words_per_line[2].push(word);
                }

                for (var i = 0; i < tmp_choose[3]; i++) {
                  word = words[i+tmp_choose[0]+tmp_choose[1]+tmp_choose[2]];
                  words_per_line[3].push(word);
                }
              }
            }
          }
        }
      } else {

        // it looks like our selection fits on one line
        num_lines_occupied = 1;
        successful_find = true;
        max_line_len = phrase.length;

        len_per_line[0] = 0;
        len_per_line[1] = phrase.length;
        len_per_line[2] = 0;
        len_per_line[3] = 0;

        words_per_line[0] = new Array();
        words_per_line[1] = words;
        words_per_line[2] = new Array();
        words_per_line[3] = new Array();
      }

      // we need to alert the user if they gave a phrase that could not fit on the board
      if (successful_find == false) {
        alert("could not fit the phrase on the board");
      }

      // here we set the indent variable
      var indent;
      if ((max_line_len == 12) || (max_line_len == 13)) {
        indent = 0;
      } else if ((max_line_len == 10) || (max_line_len == 11)) {
        indent = 1;
      } else if ((max_line_len == 8) || (max_line_len == 9)) {
        indent = 2;
      } else if ((max_line_len == 6) || (max_line_len == 7)) {
        indent = 3;
      } else if ((max_line_len == 4) || (max_line_len == 5)) {
        indent = 4;
      } else if ((max_line_len == 2) || (max_line_len == 3)) {
        indent = 5;
      } else if ((max_line_len == 1)) {
        indent = 6;
      }


      // since we have our best choice, we have to now set the indices to place the words on the board
      var count = 0;
      var index;
      for (var i = 0; i < words_per_line.length; i++) {
        index = LINE_IND[i]+indent;
        for (var j = 0; j < words_per_line[i].length; j++) {
          wordIndex[count] = index;
          count++;
          index += words_per_line[i][j].length;
          if (j != words_per_line[i].length - 1) {
            index += 1;
          }
        }
      }

      //place letters in respective tiles

      for (var word = 0; word < words.length; word++){
        for (var c = 0; c < words[word].length; c++){
          $('div.cell_'+(wordIndex[word]+c)).addClass("contains_letter");
          $('div.cell_'+(wordIndex[word]+c)+' div.flipper div.back p.letter').text(words[word].charAt(c));

		   //Display punctuation
		   if (PUNCTUATION_REGEX.test(words[word].charAt(c))){
			   $('div.cell_'+(wordIndex[word]+c)).addClass("flip");
		   }
        }
      }



      //reveal punctuation marks (apostrophes,hyphens, question marks and exclamation marks)

      
      //Append scoreboard
      game.append(scoreboard);


      ///////////////////////////////////////////////////////////
      /////////////////// END PHRASE SETUP //////////////////////
      ///////////////////////////////////////////////////////////

      //Add clickable letters


      		l = ich.alphabet_template();
      		for (var e = 0; e < ALPHABET.length; e++){
			l.append(ich.letter_template({"letter":ALPHABET.charAt(e)}).click({"letter":ALPHABET.charAt(e),"words":words,"wordIndex":wordIndex},onLetterClick));
		}



	game.append(l);

      //Add options
      game.append(ich.options_template());

      ///////////////////////////////////////////////////////////
      ////////////////// BEGIN WHEEL SETUP //////////////////////
      ///////////////////////////////////////////////////////////

      wheelContainer = ich.wheel_container_template();
      wheelCanvas = ich.wheel_canvas_template({ size : WHEEL.size });

      wheelContainer.append(wheelCanvas);
      game.append(wheelContainer);

      canvas = wheelCanvas.get(0);
      canvas.addEventListener("click", WHEEL.spin);
      canvasContext = canvas.getContext("2d");

      WHEEL.draw(canvasContext, wheelAngle);

      ///////////////////////////////////////////////////////////
      /////////////////// END WHEEL SETUP ///////////////////////
      ///////////////////////////////////////////////////////////
    }


		//---------------------------------------------------------------------
		//Pre-scripted macros
		$.fn.disableSelection = function() {
			return this
            .attr('unselectable', 'on')
            .css('user-select', 'none')
            .on('selectstart', false);
		};


    //---------------------------------------------------------------------

    var noMoreVowelsAlert = function() {
        alert('All the vowels in the phrase have been called out.');
        // new Messi('All the vowels in the phrase have been called out.', 
        //          {title: 'No more vowels!', 
        //           titleClass: 'anim warning', 
        //           buttons: [{id: 0, label: 'Close', val: 'X'}],
        //           modal: true});
    }

    var countVowels = function(phrase) {
        
        vowels = ['A', 'E', 'I', 'O', 'U'];

        // for every vowel...
        for (var i = 0; i != vowels.length; i++) {    
            
            // if the vowel is in our phrase...
            if (phrase.indexOf(vowels[i]) !== -1) {

                // we need to incrememnt numberOfVowelsRemaining
                numberOfVowelsRemaining++;
            }
        }
    }

		onLetterClick = function(event) {
      
        // we clicked a letter
        // we need to see if we were allowed to click that letter

        var letter = event.data.letter;
        var vowelChosen = ['A', 'E', 'I', 'O', 'U'].indexOf(letter) !== -1;
        //var vowelChosen = VOWELS_REGEX.test(letter);
        var consonantChosen = !vowelChosen;
        var vowelState = gsm.is("vowel");
        var consonantState = gsm.is("consonant");
        var isGray = $(".letter_"+letter).hasClass("letter_called");
        var isRed = $(".letter_"+letter).hasClass("letter_called_none");
        var isWhite = !(isGray || isRed);

        if ( ((vowelState && vowelChosen) || (consonantState && consonantChosen)) && isWhite ) {

            var words = event.data.words;
    	    	var wordIndex = event.data.wordIndex;
    	    	var count = 0;

      			for (var word = 0; word < words.length; word++) {
       				  for (var c = 0; c < words[word].length; c++) {
            		    if (words[word].charAt(c) == letter) {
            			      $('div.cell_'+(wordIndex[word]+c)).addClass("flip");
            			      count++;
            		    }
      				  }
        		}

      		  if (count > 0) {
      			    $(".letter_"+letter).addClass("letter_called");

		if (vowelChosen) {
                    numberOfVowelsRemaining -= 1;
                    if (numberOfVowelsRemaining == 0) {
                        allVowelsFound = true;
                        noMoreVowelsAlert();
                    }

                  //Deduct $250 from score
	         playerScore[currentPlayer] -= 250;
               } else { /*Consonant */

                //TODO: Add count * value of slice to score of current player (currently adds 500 arbitrarily)
                playerScore[currentPlayer] += 500 * count;
              }

                //Successful selection
                gsm.success();

            } else { /*Count == 0 */
      			    $(".letter_"+letter).addClass("letter_called_none");

                //There were no instances of that letter therefore player looses turn
                gsm.looseTurn();
            }

    		}
		};

		onCellClick = function(event) {
			var game = event.data.game;
			var board = event.data.board;
		};

		//Initialization of board----------------------------------------------
    ROW12_TILES = 12;
    ROW14_TILES = 14;
    TOTAL_TILES = ROW12_TILES * 2 + ROW14_TILES * 2;
	  PUNCTUATION_REGEX = /[\.\,\?\!\@\#\$\%\^\&\*\(\)\<\>\:\;\']/g;
    ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    VOWELS_REGEX = /[AEIOU]/g;

    gsm.initGame();
    gsm.initRound();

	});
})(jQuery);
