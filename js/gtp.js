(function($){
	$(document).ready(function() {
		//---------------------------------------------------------------------
		//Pre-scripted macros
		$.fn.disableSelection = function() {
			return this
            .attr('unselectable', 'on')
            .css('user-select', 'none')
            .on('selectstart', false);
		};


    //---------------------------------------------------------------------

		onLetterClick = function(event) {
			var letter = event.data.letter;
			var words = event.data.words;
			var wordIndex = event.data.wordIndex;
			var count = 0;

      			for (var word = 0; word < words.length; word++){
       				 for (var c = 0; c < words[word].length; c++){
				   if (words[word].charAt(c) == letter){
					   $('div.cell_'+(wordIndex[word]+c)).addClass("flip");
					   count++;
				   }
      				  }
    			  }

			if (count > 0)
				$(".letter_"+letter).addClass("letter_called");
			else
				$(".letter_"+letter).addClass("letter_called_none");
		};

		onCellClick = function(event) {
			var game = event.data.game;
			var board = event.data.board;
		};

		//Initialization of board----------------------------------------------
    ROW12_TILES = 12;
    ROW14_TILES = 14;
    TOTAL_TILES = ROW12_TILES * 2 + ROW14_TILES * 2;
	 PUNCTUATION_REGEX = /[\.\,\?\!\@\#\$\%\^\&\*\(\)\<\>\:\;\']/g
    ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";


			var game = $(".game");


			//prepare board
			var board = ich.board_template();
			game.append(board);
			//var round = quizData.rounds[0];

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

              var num_lines_occupied = 0;
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

              if ((cur_max_diff < min_max_diff) && (cur_max_diff != -1)) {
                // if we enter here, it means we found a new best option!
                min_max_diff = cur_max_diff;
                
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
        successful_find = true;

        len_per_line[0] = 0;
        len_per_line[1] = phrase.length;
        len_per_line[2] = 0;
        len_per_line[3] = 0;

        words_per_line[0] = new Array();
        words_per_line[1] = words;
        words_per_line[2] = new Array();
        words_per_line[3] = new Array();
      }

      if (successful_find == false) {
        alert("could not fit the phrase on the board");
      }

      // since we have our best choice, we have to now set the indices to place the words on the board
      var count = 0; 
      var index;
      for (var i = 0; i < words_per_line.length; i++) {
        index = LINE_IND[i];
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

      ///////////////////////////////////////////////////////////
      /////////////////// END PHRASE SETUP //////////////////////
      ///////////////////////////////////////////////////////////

      //Add clickable letters

	
      		l = ich.alphabet_template();
      		for (var e = 0; e < ALPHABET.length; e++){
			l.append(ich.letter_template({"letter":ALPHABET.charAt(e)}).click({"letter":ALPHABET.charAt(e),"words":words,"wordIndex":wordIndex},onLetterClick));
		}
		

	game.append(l);

      



	});
})(jQuery);
