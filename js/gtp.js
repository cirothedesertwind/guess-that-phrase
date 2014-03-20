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

		onCellClick = function(event) {
			var game = event.data.game;
			var board = event.data.board;
		};

		//Initialization of board----------------------------------------------
    ROW12_TILES = 12;
    ROW14_TILES = 14;
    TOTAL_TILES = ROW12_TILES * 2 + ROW14_TILES * 2;
	 PUNCTUATION_REGEX = /[\.\,\?\!\@\#\$\%\^\&\*\(\)\<\>\:\;\']/g


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

      phrase = "ICE'S CREAME SANDWICHES";

      //Checks phrase for length
      if (phrase.length > TOTAL_TILES)
        window.alert("Phrase is too long for the board.");


      //Positioning on board----


      //create word chunks for board
      var words = phrase.split(" ");
      var wordIndex = new Array(words.length);

      //wordIndex[0] = 0;
      //guess an even splitting for now
      wordIndex[0] = Math.floor((TOTAL_TILES - phrase.length)/2);//Javascript does not use integer division

      for (var w = 1; w < words.length; w++){
        wordIndex[w] = wordIndex[w-1] + words[w-1].length+1;//+1 for space
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

      //End phrase setup----------------------------------------------

      //Board flips test

      ctx2 = $.schedule({
    id:      null,         /* unique identifier of high-level schedule */
    time:    5000,         /* time in milliseconds after which the task is run */
    repeat:  false,        /* whether schedule should be automatically repeated */
    protect: false,        /* whether schedule should be protected from double scheduling */
    obj:     null,         /* function context object ("this") */
    func:    function(){ $('.contains_letter').addClass("flip"); }, /* function to call */
    args:    [row]            /* function arguments to pass */
    });



	});
})(jQuery);
