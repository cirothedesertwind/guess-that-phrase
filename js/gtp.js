(function ($) {

    GTP = {};

    GTP.lang = {};
    GTP.lang.code = "en";
    GTP.lang.ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    GTP.lang.VOWELS = "AEIOU";
    GTP.lang.CONSONANTS = "BCDFGHJKLMNPQRSTVWXYZ";

    GTP.ruleset = {};
    GTP.ruleset.ROUNDS = 5;
    GTP.ruleset.PLAYERS = 3;
    GTP.ruleset.CURRENCY = '$';

    GTP.tiles = {};
    GTP.tiles.ROW12_TILES = 12;
    GTP.tiles.ROW14_TILES = GTP.tiles.ROW12_TILES + 2;
    GTP.tiles.TOTAL_TILES = GTP.tiles.ROW12_TILES * 2 + GTP.tiles.ROW14_TILES * 2;
    GTP.tiles.RPUNCTUATION_REGEX = /[\.\,\?\!\@\#\$\%\^\&\*\(\)\<\>\:\;\']/g;
    GTP.tiles.PRHASE_REGEX = "^[A-Za-z\\s\\.\\,\\?\\!\\@\\#\\$\\%\\^\\&\\*\\(\\)\\<\\>\\:\\;\\']+$"; //This is a string to use with parsley.js
    GTP.tiles.PLAYER_REGEX = "^[A-Za-z\\s\\.\\,\\?\\!\\@\\#\\$\\%\\^\\&\\*\\(\\)\\<\\>\\:\\;\\']+$"; //This is a string to use with parsley.js

    GTP.gamestate = {};
    GTP.gamestate.currentSliceValue = -1;
    GTP.gamestate.currentPlayer = -1;
    // Global Variables can't have var in front of them?
    GTP.gamestate.phrases = new Array();
    GTP.gamestate.hints = new Array();
    GTP.gamestate.currentRound = -1;
    GTP.gamestate.isPuzzleSolved = false;
    GTP.gamestate.numberOfVowelsRemaining = 0;
    var noMoreVowelsAlertDisplayed = false;
    GTP.gamestate.numberOfConsonantsRemaining = 0;
    var noMoreConsonantsAlertDisplayed = false;

    GTP.dialog = {};
    GTP.dialog.shift = 5;
    GTP.dialog.drawSlice = function () {
        var ctx = $("#slice_canvas").get(0).getContext("2d");

        circle_origin_x = 70 + GTP.dialog.shift;
        circle_origin_y = 100 + GTP.dialog.shift;
        circle_radius = 100;
        start_angle = Math.PI * (5 / 4);
        end_angle = Math.PI * (7 / 4);

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.fillStyle = "#000000";
        ctx.arc(circle_origin_x, circle_origin_y, circle_radius, start_angle, end_angle);
        ctx.lineTo(90 + GTP.dialog.shift, 200 + GTP.dialog.shift);
        ctx.lineTo(50 + GTP.dialog.shift, 200 + GTP.dialog.shift);
        ctx.closePath();
        ctx.fillStyle = currentSliceColor;
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.font = "2em Raleway";

        str = GTP.ruleset.CURRENCY + GTP.gamestate.currentSliceValue.toString();
        for (var i = 0; i < str.length; i++) {
            ctx.fillText(str.charAt(i), 60 + GTP.dialog.shift, 60 + 30 * i + GTP.dialog.shift);
        }

        ctx.stroke();
    };
    GTP.dialog.clearSlice = function () {
        var ctx = $("#slice_canvas").get(0).getContext("2d");
        ctx.clearRect(0, 0, 200 + GTP.dialog.shift, 200 + GTP.dialog.shift);
    };
    GTP.dialog.alphabetElement = null;
    GTP.dialog.messageContainerElement = null;
    GTP.dialog.sliceContainerElement = null;
    GTP.dialog.showMessage = function (message, tuple) {
        $("#message-label").append(message);

        for (var i = 0; i < tuple.length; i++) {
            $("button#" + tuple[i]).show();
        }

        GTP.dialog.alphabetElement.show();

        GTP.dialog.messageContainerElement.show();
    };
    GTP.dialog.hideMessage = function () {
        $("#message-label").empty();

        buttons = ["spin", "guess", "solve", "yes", "no", "cancel", "okay"];

        for (var i = 0; i !== buttons.length; i++) {
            $("button#" + buttons[i]).hide();
        }

        $(".vowel, .consonant").hide();
        GTP.dialog.alphabetElement.hide();

        GTP.dialog.clearSlice();
        GTP.dialog.sliceContainerElement.hide();

        GTP.dialog.messageContainerElement.hide();
    };
    // we display this message when we finish the game 
    GTP.dialog.gameFinishDialog = function () {
        var winners = scorebd.getWinners();
        if (winners.length === 1) {
            var winner = scorebd.getPlayerName(winners[0] + 1);
            var message = 'The game has ended. ' + winner + ' is the winner!';
        } else if (winners.length === 2) {
            var winner1 = scorebd.getPlayerName(winners[0] + 1);
            var winner2 = scorebd.getPlayerName(winners[1] + 1);
            var message = 'The game has ended. It seems there is a tie. ' + winner1 + ' and ' + winner2 + ' are both winners!';
        } else {
            var message = 'The game has ended. You\'re all winners!';
        }

        $("button#okay").unbind("click");
        $("button#okay").click({}, function () {
            return;
        });
        GTP.dialog.showMessage(message, ["okay"]);
    };
    // we display this dialog when the round finishes
    GTP.dialog.termRoundDialog = function () {
        message = "Congratulations " + scorebd.getPlayerName(+1) + "! ";
        if ((GTP.gamestate.currentRound + 1 < GTP.ruleset.ROUNDS)) {
            message += "The next round will begin shortly!";
        }
        GTP.dialog.showMessage(message, []);
    };
    // we display this dialog when the user chooses to solve the puzzle
    GTP.dialog.solveLockInDialog = function () {
        message = 'Did ' + scorebd.getPlayerName(+1) + ' guess the puzzle correctly?';
        GTP.dialog.showMessage(message, ["yes", "no", "cancel"]);
    };
    GTP.dialog.vowelSpinSolveDialog = function (message) {
        message += 'Would you like to buy a vowel, spin the wheel, or solve the puzzle?';
        GTP.dialog.showMessage(message, ["spin", "guess", "solve"]);
    };
    GTP.dialog.spinSolveDialog = function (message) {
        message += 'Would you like to spin the wheel or solve the puzzle?';
        GTP.dialog.showMessage(message, ["spin", "solve"]);
    };
    GTP.dialog.vowelSolveDialog = function (message) {
        message += 'Would you like to buy a vowel or solve the puzzle?';
        GTP.dialog.showMessage(message, ["guess", "solve"]);
    };
    GTP.dialog.solveDialog = function (message) {
        message += 'You must solve the puzzle. What is your guess?';
        GTP.dialog.showMessage(message, ["solve"]);
    };
    GTP.dialog.chooseConsonantDialog = function () {
        message = 'Please choose a consonant.';
        $(".consonant").show();             // show consonants
        GTP.dialog.drawSlice();                        // draw slice spin
        GTP.dialog.sliceContainerElement.show();       // show slice spun
        GTP.dialog.showMessage(message, []);           // show message
    };
    GTP.dialog.chooseVowelDialog = function () {
        message = 'Please choose a vowel.';
        $(".vowel").show();                 // show vowels
        GTP.dialog.showMessage(message, []);           // show message
    };

    GTP.sounds = {};
    GTP.sounds.newGameSound = function () {
        //Add sound effect for new puzzle
        var sound = new Howl({
            urls: ['sound/new_puzzle.ogg']
        }).play();
    };
    GTP.sounds.incorrectLetterSound = function () {
        var sound = new Howl(
                {
                    urls: ['sound/incorrectConsonantOrVowelSound.mp3'],
                    sprite: {portion: [0, 400]}
                }
        );
        sound.play("portion");
    };
    GTP.sounds.correctLetterSound = function () {
        var sound = new Howl(
                {
                    urls: ['sound/correctConsonantOrVowelSound.mp3']
                }
        );
        sound.play();
    };
    GTP.sounds.endRoundSound = function () {
        var sound = new Howl(
                {
                    urls: ['sound/endRoundSuccess.ogg']
                }
        );
        sound.play();
    };
    GTP.sounds.bankruptOrLooseTurnSound = function () {
        var sound = new Howl(
                {
                    urls: ['sound/bankruptOrLooseTurn.ogg']
                }
        );
        sound.play();
    };

    GTP.util = {};
    GTP.util.countVowels = function (p) {
        var acc = 0;
        // for every vowel...
        for (var i = 0; i !== GTP.lang.VOWELS.length; i++) {
            // if the vowel is in our phrase...
            if (p.indexOf(GTP.lang.VOWELS[i]) !== -1) {
                acc++;
            }
        }

        return acc;
    };
    GTP.util.countConsonants = function (phrase) {
        var acc = 0;
        // for every consonant...
        for (var i = 0; i !== GTP.lang.CONSONANTS.length; i++) {
            // if the consonant is in our phrase...
            if (phrase.indexOf(GTP.lang.CONSONANTS[i]) !== -1) {
                acc++;
            }
        }

        return acc;
    };

    $(document).ready(function () {

        ///////////////////////////////////////////////////////////
        ////////////// GAME VARIABLES /////////////////////////////
        ///////////////////////////////////////////////////////////




        var game = $(".game");
        var board;
        var character;
        var isCharacterOnLeft = true;
        scorebd = new $.SCOREBOARD(game, GTP.ruleset.PLAYERS, GTP.ruleset.CURRENCY);

        var wheelContainerElement;


        console.log(scorebd);

        var spinFinishedCallback = function () {
            GTP.gamestate.currentSliceValue = wheel.getValue();
            currentSliceColor = wheel.getColor();
            //TODO: unlock letters here
            wheelContainerElement.fadeOut();

            //Enter the appropriate wheel state:
            if (GTP.gamestate.currentSliceValue === 0xFFFFBA) { //bankrupt
                gsm.bankrupt();
            }
            else if (GTP.gamestate.currentSliceValue === 0xFFFF10) { //lose turn
                gsm.loseTurn();
            }
            else {
                //only choose consonants after a wheel spin
                gsm.chooseConsonant();
            }
        };

        var vowelOrConsonant = function (letter) {
            if (['A', 'E', 'I', 'O', 'U'].indexOf(letter) !== -1)
                return "vowel";
            else
                return "consonant";
        };

        var bankruptifyOnWheel = function (context) {
            scorebd.setScore(GTP.gamestate.currentPlayer, 0);
            GTP.sounds.bankruptOrLooseTurnSound();
            gsm.loseTurn();
        };

        var loseTurnOnWheel = function (context) {
            GTP.sounds.bankruptOrLooseTurnSound();
            gsm.loseTurn();
        };


        phraseFormPopup = function () {

            // The Messi message needs to be broken down for maintainability
            var MessiStrExplanation = '<p>Please input the phrases you like to use in this game.</p>';
            var MessiStrFormOpening = '<form id="phrase_input" action="" data-parsley-validate>';
            var MessiStrContent = "";
            for (var phraseNum = 1; phraseNum <= GTP.ruleset.ROUNDS; phraseNum++) {
                var MessiStrPhraseLabel = 'Phrase ' + phraseNum + ': ';

                // the first phrase is required
                if (phraseNum === 1) {
                    var required = "required";
                } else {
                    var required = "";
                }
                var MessiStrPhraseInput = '<input type="text" id="phrase' + phraseNum + '" name="phrase' + phraseNum + '" data-parsley-maxlength="50" data-parsley-fits pattern="' + GTP.tiles.PRHASE_REGEX + '" ' + required + '>';

                var space = " ";
                var MessiStrHintLabel = 'Hint ' + phraseNum + ': ';
                var MessiStrHintContent = '<input type="text" id="hint' + phraseNum + '" name="hint' + phraseNum + '">';
                MessiStrContent += MessiStrPhraseLabel + MessiStrPhraseInput + space + MessiStrHintLabel + MessiStrHintContent;

                // add a new line after every hint entry box
                if (phraseNum !== GTP.ruleset.ROUNDS) {
                    MessiStrContent += '<br>';
                }
            }
            var MessiStrFormClosing = '</form>';
            var MessiStr = MessiStrExplanation + MessiStrFormOpening + MessiStrContent + MessiStrFormClosing;

            new Messi(MessiStr,
                    {title: 'Set your phrases', titleClass: 'info',
                        buttons: [{id: 0, label: 'Ok', val: 'Ok', class: 'btn-success'}],
                        callback: function (val) {
                            gsm.initPlayerNames();
                        }
                    });
        };

        playerNamesFormPopup = function () {

            // The Messi message needs to be broken down for maintainability
            var MessiStrExplanation = '<p>Please input each player\'s name in the boxes below. Each name is limited to 12 characters maximum.</p>';
            var MessiStrFormOpening = '<form id="player_name_input_form" action="" data-parsley-validate>';
            var MessiStrContent = "";
            for (var phraseNum = 1; phraseNum <= GTP.ruleset.PLAYERS; phraseNum++) {
                var MessiStrPhraseLabel = 'Player ' + phraseNum + ': ';

                var MessiStrPhraseInput = '<input type="text" class="player_name_input" id="player' + phraseNum + '" name="player' + phraseNum + '" data-parsley-maxlength="12" data-parsley-fits pattern="' + GTP.tiles.PLAYER_REGEX + '" required>';

                MessiStrContent += MessiStrPhraseLabel + MessiStrPhraseInput;

                // add a new line after every hint entry box
                if (phraseNum !== GTP.ruleset.ROUNDS) {
                    MessiStrContent += '<br>';
                }
            }
            var MessiStrFormClosing = '</form>';
            var MessiStr = MessiStrExplanation + MessiStrFormOpening + MessiStrContent + MessiStrFormClosing;

            new Messi(MessiStr,
                    {title: 'Set Your Player Names', titleClass: 'info',
                        buttons: [{id: 0, label: 'Ok', val: 'Ok', class: 'btn-success'}],
                        callback: function (val) {
                            gsm.initGame();
                            gsm.initRound();
                        }
                    });
        };

        ///////////////////////////////////////////////////////////
        ////////////// BOARD //////////// /////////////////////////
        ///////////////////////////////////////////////////////////

        //build a board
        buildBoard = function () {
            //TODO: Sanitize phrases and set to uppercase

            //prepare board
            board = ich.board_template();
            game.append(board);

            //Disable selection on board.
            board.attr('unselectable', 'on')
                    .css('user-select', 'none')
                    .on('selectstart', false);

            //Set up the board
            cell = ich.board_cell_template();
            cell_n = 0;

            for (var r = 0; r < 4; r++) {
                row = ich.board_row_template();

                //Specialize the row
                if (r === 0 || r === 3) {
                    columns = GTP.tiles.ROW12_TILES;
                    row.addClass("grid_12 prefix_3");
                }
                else { //r == 1 || r == 2
                    columns = GTP.tiles.ROW14_TILES;
                    row.addClass("grid_14 prefix_2");
                }

                board.append(row);

                //add all cells
                for (var c = 0; c < columns; c++) {
                    row.append(cell.clone().addClass("cell_" + cell_n));
                    cell_n++;
                }

                //grid styling
                row.children().first().addClass("alpha");
                row.children().last().addClass("omega");

            }

            // finally, we create the hint template
            board.append(ich.puzzle_hint_template({hint: ""}));
        };

        /*end board setup*/
        populateBoard = function () {
            //Phrase setup----------------------------------------------
            //This is alpha quality

            //*needs to clean up strings here like double spaces

            ///////////////////////////////////////////////////////////
            ///////////////// TESTING PURPOSES ////////////////////////
            ///////////////////////////////////////////////////////////

            // CANNOT FIT!!!!
            // phrase = "BAKED POTATO WITH SOUR CREAM & CHIVES AWDAWD AWDAWD";

            // CANT FIT!!!!
            // phrase = "ICE'S CREAME SANDWICHES";
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

            // here, we'll set the new phrase at the beginning of each round
            phrase = GTP.gamestate.phrases[GTP.gamestate.currentRound];

            // These indices point to the locations on the board below.
            //  X-----------  //
            // -X------------ //
            // -X------------ //
            //  X-----------  //

            FIRST_LINE_IND = 0;
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

            //Checks phrase for length
            if (phrase.length > GTP.tiles.TOTAL_TILES) {
                window.alert("Phrase is too long for the board.");
            }
            //checks words for length
            for (var i = 0; i !== words.length; i++) {
                if (words[i].length >= 14) {
                    alert("You can't have words that are 14 characters or longer.");
                }
            }

            // if the phrase length can fit in one line, then we'll do that...
            // otherwise, we need an algorithm to decide how to best fit it on the board
            if ((phrase.length > 10) && (words.length > 1)) {

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
                    for (choose[1] = MIN; choose[1] < MAX - choose[0]; choose[1]++) {
                        tmp_choose[1] = choose[1];
                        for (choose[2] = MIN; choose[2] < MAX - choose[0] - choose[1]; choose[2]++) {
                            tmp_choose[2] = choose[2];
                            choose[3] = MAX - choose[0] - choose[1] - choose[2];
                            tmp_choose[3] = choose[3];

                            // to decide which choice of words per line is best, we need to calculate the length of the
                            // line with the words, taking into consideration the spaces. we do this for each line

                            len = 0;
                            for (var i = 0; i < choose[0]; i++) {
                                word = words[i];
                                len += word.length;
                            }
                            if (len !== 0) {
                                len += choose[0] - 1;
                            }
                            len_per_line[0] = len;

                            len = 0;
                            for (var i = 0; i < choose[1]; i++) {
                                word = words[i + choose[0]];
                                len += word.length;
                            }
                            if (len !== 0) {
                                len += choose[1] - 1;
                            }
                            len_per_line[1] = len;

                            len = 0;
                            for (var i = 0; i < choose[2]; i++) {
                                word = words[i + choose[0] + choose[1]];
                                len += word.length;
                            }
                            if (len !== 0) {
                                len += choose[2] - 1;
                            }
                            len_per_line[2] = len;

                            len = 0;
                            for (var i = 0; i < choose[3]; i++) {
                                word = words[i + choose[0] + choose[1] + choose[2]];
                                len += word.length;
                            }
                            if (len !== 0) {
                                len += choose[3] - 1;
                            }
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

                            if (num_lines_occupied === 2) {
                                var count = 0;
                                var temp_len_per_line = new Array(4);
                                temp_len_per_line[0] = 0;
                                temp_len_per_line[3] = 0;
                                tmp_choose[0] = 0;
                                tmp_choose[3] = 0;
                                for (var i = 0; i < len_per_line.length; i++) {
                                    if (len_per_line[i] > 0) {
                                        if (count === 1) {
                                            temp_len_per_line[2] = len_per_line[i];
                                            tmp_choose[2] = choose[i];
                                            len_per_line = temp_len_per_line;
                                            break;
                                        }
                                        else if (count === 0) {
                                            temp_len_per_line[1] = len_per_line[i];
                                            tmp_choose[1] = choose[i];
                                            count++;
                                        }
                                    }
                                }

                            } else if (num_lines_occupied === 3) {
                                var count = 0;
                                var temp_len_per_line = new Array(4);
                                temp_len_per_line[3] = 0;
                                tmp_choose[3] = 0;
                                for (var i = 0; i < len_per_line.length; i++) {
                                    if (len_per_line[i] > 0) {
                                        if (count === 2) {
                                            temp_len_per_line[2] = len_per_line[i];
                                            tmp_choose[2] = choose[i];
                                            len_per_line = temp_len_per_line;
                                            break;
                                        } else if (count === 1) {
                                            temp_len_per_line[1] = len_per_line[i];
                                            tmp_choose[1] = choose[i];
                                            count++;
                                        }
                                        else if (count === 0) {
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
                                for (var j = i + 1; j < 4; j++) {
                                    if ((len_per_line[i] !== 0) && (len_per_line[j] !== 0)) {
                                        tmp_diff = Math.abs(len_per_line[i] - len_per_line[j]);
                                        if (tmp_diff > cur_max_diff) {
                                            cur_max_diff = tmp_diff;
                                        }
                                    }
                                }
                            }

                            // if we enter here, it means we found a new best option!
                            if ((cur_max_diff < min_max_diff) && (cur_max_diff !== -1)) {
                                min_max_diff = cur_max_diff;

                                // we need to set the indent variable to center the text
                                // to do this, we need to know the length of the longest line
                                max_line_len = 0;
                                for (var i = 0; i < len_per_line.length; i++) {
                                    max_line_len = Math.max(max_line_len, len_per_line[i]);
                                }


                                // we set the words here
                                words_per_line[0] = [];
                                words_per_line[1] = [];
                                words_per_line[2] = [];
                                words_per_line[3] = [];
                                for (var i = 0; i < tmp_choose[0]; i++) {
                                    word = words[i];
                                    words_per_line[0].push(word);
                                }

                                for (var i = 0; i < tmp_choose[1]; i++) {
                                    word = words[i + tmp_choose[0]];
                                    words_per_line[1].push(word);
                                }

                                for (var i = 0; i < tmp_choose[2]; i++) {
                                    word = words[i + tmp_choose[0] + tmp_choose[1]];
                                    words_per_line[2].push(word);
                                }

                                for (var i = 0; i < tmp_choose[3]; i++) {
                                    word = words[i + tmp_choose[0] + tmp_choose[1] + tmp_choose[2]];
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
            if (successful_find === false) {
                alert("could not fit the phrase on the board");
            }

            // here we set the indent variable
            var indent;
            if (max_line_len >= 14 || max_line_len < 1)
                console.log("Error: max line length is too large ( >= 14) or less than 1.");

            indent = Math.ceil(-0.5 * max_line_len + GTP.tiles.ROW12_TILES / 2);

            // since we have our best choice, we have to now set the indices to place the words on the board
            var count = 0;
            var index;
            for (var i = 0; i < words_per_line.length; i++) {
                index = LINE_IND[i] + indent;
                for (var j = 0; j < words_per_line[i].length; j++) {
                    wordIndex[count] = index;
                    count++;
                    index += words_per_line[i][j].length;
                    if (j !== words_per_line[i].length - 1) {
                        index += 1;
                    }
                }
            }

            //place letters in respective tiles, tile by tile using a schedule
            delay = 0;
            for (var word = 0; word < words.length; word++) {
                for (var c = 0; c < words[word].length; c++) {
                    $('div.cell_' + (wordIndex[word] + c)).schedule(delay, function () {
                        $(this).addClass("contains_letter");
                    });
                    $('div.cell_' + (wordIndex[word] + c) + ' div.flipper div.back p.letter').text(words[word].charAt(c));
                    delay += 75; //add 250ms per letter

                    //Display punctuation
                    if (GTP.tiles.RPUNCTUATION_REGEX.test(words[word].charAt(c))) {
                        $('div.cell_' + (wordIndex[word] + c)).addClass("flip");
                    }
                }


            }

            //reveal punctuation marks (apostrophes,hyphens, question marks and exclamation marks)

            // finally, we display the hint for the players
            $(".puzzle_hint").text(GTP.gamestate.hints[GTP.gamestate.currentRound]);


            ///////////////////////////////////////////////////////////
            /////////////////// END PHRASE SETUP //////////////////////
            ///////////////////////////////////////////////////////////

        };

        /*change the board */
        depopulateBoard = function () {
            //Flip all tiles back to blank the board
            $("p.letter").empty(); // this is needed to clear all the letters on the board so they don't reappear in the next round
            $(".contains_letter").removeClass("flip");
            $(".cell").removeClass("contains_letter");
        };

        resetAlphabet = function () {
            //Set all the letters so they are uncalled
            $(".letter").removeClass("letter_called letter_called_none");
        };

        ///////////////////////////////////////////////////////////
        ////////////// CHARACTER //////// /////////////////////////
        ///////////////////////////////////////////////////////////

        buildCharacter = function () {
            character = ich.character_template();
            $("body").append(character);
            character.css("top", 200);
            character.css("left", 200);
            character.sprite({fps: 6, no_of_frames: 3}).active();
        };

        flipTiles = function (letter) {
            letterSet = $("p.letter:contains('" + letter + "')").parents(".cell");
            letterSet.addClass("flip");

            //only move if there are characters to be flipped
            if (letterSet.length > 0) {
                if (isCharacterOnLeft) {
                    character.velocity({translateX: "1100px"});
                    isCharacterOnLeft = false;
                } else {
                    character.velocity({translateX: "0px"});
                    isCharacterOnLeft = true;
                }
            }
        };

        ///////////////////////////////////////////////////////////
        ////////////// PANEL //////////// /////////////////////////
        ///////////////////////////////////////////////////////////

        buildPanel = function () {
            panel = ich.panel_template();
            game.append(panel);
            buildWheel(panel);
            buildClickableLetters();
            buildSlice(panel);
            buildMessage(panel);
        };

        buildClickableLetters = function () {
            //Add clickable letters
            l = ich.alphabet_template();
            for (var e = 0; e < GTP.lang.ALPHABET.length; e++) {
                //add special break for two lines of letters
                if (e === 15) { //Magic number
                    l.append("</br>");
                }

                l.append(ich.letter_template(
                        {
                            "letter": GTP.lang.ALPHABET.charAt(e),
                            "vowelOrConsonant": vowelOrConsonant(GTP.lang.ALPHABET.charAt(e))
                        }
                ).click({"letter": GTP.lang.ALPHABET.charAt(e)}, onLetterClick));
            }

            GTP.dialog.alphabetElement = l;

            // hide the alphabet
            $(".vowel, .consonant").hide();
            GTP.dialog.alphabetElement.hide();
        };

        buildWheel = function (element) {
            wheelContainer = ich.wheel_container_template();
            wheelCanvas = ich.wheel_canvas_template({size: 1200}); //TODO: Duplicated defns.

            wheelContainer.append(wheelCanvas);
            element.append(wheelContainer);

            canvas = wheelCanvas.get(0);
            canvasCtx = canvas.getContext("2d");

            wheel = new $.WHEEL(canvasCtx, 0, spinFinishedCallback, null);

            //TODO: make this part of init in wheel
            wheel.setAllCallbacks(spinFinishedCallback);
            wheel.setCallback(10, bankruptifyOnWheel);
            wheel.setCallback(19, bankruptifyOnWheel);
            wheel.setCallback(27, loseTurnOnWheel);

            //TODO: Ideally, set bankrupt callbacks here
            wheelContainerElement = wheelContainer;

        };

        buildSlice = function (element) {
            sliceContainer = ich.slice_container_template();
            sliceCanvas = ich.slice_canvas_template(
                    {width: 200 + GTP.dialog.shift,
                        height: 200 + GTP.dialog.shift});

            sliceContainer.append(sliceCanvas);
            element.append(sliceContainer);

            slice_canvas = sliceCanvas.get(0);
            slice_canvasCtx = slice_canvas.getContext("2d");

            GTP.dialog.sliceContainerElement = sliceContainer;

        };

        buildMessage = function (element) {

            button_spin = ich.button_template(
                    {
                        "id": "spin",
                        "name": "spin",
                        "color": "red",
                        "label": "Spin the Wheel"
                    }
            ).click({}, function () {
                gsm.spin();
            });
            button_guess = ich.button_template(
                    {
                        "id": "guess",
                        "name": "guess",
                        "color": "green",
                        "label": "Guess a Vowel"
                    }
            ).click({}, function () {
                gsm.buyVowel();
            });
            button_solve = ich.button_template(
                    {
                        "id": "solve",
                        "name": "solve",
                        "color": "yellow",
                        "label": "Solve the Puzzle"
                    }
            ).click({}, function () {
                gsm.solvePuzzle();
            });

            button_yes = ich.button_template(
                    {
                        "id": "yes",
                        "name": "yes",
                        "color": "green",
                        "label": "Yes"
                    }
            ).click({}, function () {
                gsm.guessCorrectly();
            });

            button_no = ich.button_template(
                    {
                        "id": "no",
                        "name": "no",
                        "color": "red",
                        "label": "No"
                    }
            ).click({}, function () {
                gsm.guessIncorrectly();
            });

            button_cancel = ich.button_template(
                    {
                        "id": "cancel",
                        "name": "cancel",
                        "color": "yellow",
                        "label": "Cancel"
                    }
            ).click({}, function () {
                gsm.cancelGuess();
            });

            button_okay = ich.button_template(
                    {
                        "id": "okay",
                        "name": "okay",
                        "color": "green",
                        "label": "Okay"
                    }
            ).click({}, function () {
                gsm.filledPuzzle();
            });

            // retrieve the message box container
            GTP.dialog.messageContainerElement = ich.message_form_template();
            messageFieldSetElement = ich.message_fieldset_template();
            messageControlGroupElement = ich.message_control_group_template();
            messageButtonListElement = ich.message_button_list_template();
            messageLabelElement = ich.message_label_template();

            messageButtonListElement.append(button_spin);
            messageButtonListElement.append(button_guess);
            messageButtonListElement.append(button_solve);
            messageButtonListElement.append(button_yes);
            messageButtonListElement.append(button_no);
            messageButtonListElement.append(button_cancel);
            messageButtonListElement.append(button_okay);

            messageControlGroupElement.append(messageLabelElement);
            messageControlGroupElement.append(messageButtonListElement);

            messageFieldSetElement.append(messageControlGroupElement);
            messageFieldSetElement.append(GTP.dialog.alphabetElement);
            messageFieldSetElement.append(GTP.dialog.sliceContainerElement);

            GTP.dialog.messageContainerElement.append(messageFieldSetElement);

            // append to panel
            element.append(GTP.dialog.messageContainerElement);
        };

        ///////////////////////////////////////////////////////////
        ////////////// GAME STATE MACHINE /////////////////////////
        ///////////////////////////////////////////////////////////

        var gsm = StateMachine.create({
            initial: 'init',
            events: [
                //Create the Phrases
                {name: 'initPhrases', from: 'init', to: 'initPhrases'},
                //Set the players' names
                {name: 'initPlayerNames', from: 'initPhrases', to: 'initPlayerNames'},
                //Init the game
                {name: 'initGame', from: 'initPlayerNames', to: 'initGame'},
                //Init round when either starting the game or ending the last round
                {name: 'initRound', from: ['initGame', 'termRound'], to: 'initRound'},
                //Start the game with the randomized starting player
                {name: 'initTurn', from: ['initRound', 'termTurn'], to: 'initTurn'},
                //Spin a wheel at the start of the turn, or after sucessfully calling a consonant or buying a vowel.
                {name: 'spin', from: ['initTurn', 'success'], to: 'wheelspin'},
                //Choose a consonant from the alphabet
                {name: 'chooseConsonant', from: 'wheelspin', to: 'consonant'},
                //Go bankrupt
                {name: 'bankrupt', from: 'wheelspin', to: 'bankruptState'},
                //Buy a vowel only after spinning the wheel and calling a consonant or buying another vowel previously
                {name: 'buyVowel', from: 'success', to: 'vowel'},
                //On a sucessful selection, prompt for next action
                {name: 'success', from: ['initTurn', 'consonant', 'vowel', 'wheelspin', 'noMoreVowels', 'noMoreConsonants'], to: 'success'},
                //Lose your turn by incorrectly calling a letter or vowel,
                //landing on bankrupt or lose your trn, or incorrectly
                //solving the puzzle (triggered by facilitator clicking button)
                {name: 'loseTurn', from: ['consonant', 'vowel', 'wheelspin'], to: 'termTurn'},
                // We would like a state to declare when there are no vowels
                {name: 'declareNoMoreVowels', from: 'success', to: 'noMoreVowels'},
                // We would like a state to declare when there are no vowels
                {name: 'declareNoMoreConsonants', from: 'success', to: 'noMoreConsonants'},
                //The user guessed the last letter correctly
                {name: 'filledPuzzle', from: ['success', 'guess'], to: 'termRound'},
                //The user has asked to solve the puzzle
                {name: 'solvePuzzle', from: ['initTurn', 'success'], to: 'guess'},
                //when correctly guessed, terminate round
                {name: 'guessCorrectly', from: 'guess', to: 'termRound'},
                //when guessed incorrectly terminate round
                {name: 'guessIncorrectly', from: 'guess', to: 'termTurn'},
                //Allow the user to cancel their guess attempt. 
                {name: 'cancelGuess', from: 'guess', to: 'success'},
                //End game when all rounds end
                {name: 'stop', from: 'initRound', to: 'term'}
            ],
            callbacks: {
                onleavestate: function (event, from, to) {
                    console.log("on leave |event:" + event + "|from:" + from + "|to:" + to + "|");
                },
                onenterstate: function (event, from, to) {
                    scorebd.updateScore();
                },
                onenterinitPhrases: function (event, from, to) {
                    phraseFormPopup();
                },
                onenterinitPlayerNames: function (event, from, to) {
                    playerNamesFormPopup();
                },
                onenterinitGame: function (event, from, to) {
                    buildBoard();
                    buildPanel();
                    buildCharacter();

                    // initialiy make these items hidden for now
                    wheelContainerElement.hide();
                    GTP.dialog.hideMessage();

                },
                onenterinitRound: function (event, from, to) {
                    GTP.gamestate.currentRound = GTP.gamestate.currentRound + 1;

                    /*If there are more rounds to play, start by randomizing the
                     onenterstate: function(event, from, to start player and start the player's turn. */

                    if (GTP.gamestate.currentRound < GTP.ruleset.ROUNDS) {

                        GTP.sounds.newGameSound();
                        populateBoard();

                        scorebd.newRound();

                        scorebd.updateScore();

                        //re-enable all letters by re-setting the attributes to yes
                        $("span.letter").attr("data-clickable", "yes");

                        // we should check if phrases with no consonants or no
                        // vowels are introduced to the game
                        GTP.gamestate.numberOfConsonantsRemaining = GTP.util.countConsonants(phrase);
                        GTP.gamestate.numberOfVowelsRemaining = GTP.util.countVowels(phrase);

                        GTP.gamestate.currentPlayer = Math.floor((Math.random() * GTP.ruleset.PLAYERS));
                        gsm.initTurn();
                    } else {
                        gsm.stop();
                    }

                },
                onenterinitTurn: function (event, from, to) {
                    // set the correct players stuff to be highlighted          
                    $(".scoreboad").children().eq(GTP.gamestate.currentPlayer).addClass("active");
                    gsm.success();
                },
                onenterwheelspin: function (event, from, to) {
                    GTP.dialog.hideMessage();
                    wheelContainerElement.fadeIn();
                    wheel.spin();
                },
                onenterbankruptState: function (event, from, to) {
                    //lose current winnings
                    scoreboard.setScore(GTP.gamestate.currentPlayer, 0);
                    gsm.termTurn();
                },
                onenterconsonant: function (event, from, to) {
                    GTP.dialog.chooseConsonantDialog();
                },
                onentervowel: function (event, from, to) {
                    GTP.dialog.hideMessage();
                    GTP.dialog.chooseVowelDialog();
                },
                onentersuccess: function (event, from, to) {
                    //success only occurs after a correct guess and no
                    //bankrupt or lose turn
                    GTP.dialog.hideMessage();

                    // Check the status of the puzzle
                    if (GTP.gamestate.numberOfVowelsRemaining === 0) {
                        allVowelsFound = true;
                        if (!noMoreVowelsAlertDisplayed) {
                            gsm.declareNoMoreVowels();
                            return; // we need to return to indicate we want to leave this state
                        }
                    } else {
                        allVowelsFound = false;
                    }
                    if (GTP.gamestate.numberOfConsonantsRemaining === 0) {
                        allConsonantsFound = true;
                        if (!noMoreConsonantsAlertDisplayed) {
                            gsm.declareNoMoreConsonants();
                            return; // we need to return to indicate we want to leave this state
                        }
                    } else {
                        allConsonantsFound = false;
                    }
                    GTP.gamestate.isPuzzleSolved = allVowelsFound && allConsonantsFound;

                    // What should the message to the user be
                    if (from === "initTurn") {
                        var message = scorebd.getPlayerName(GTP.gamestate.currentPlayer + 1) + ", it is your turn. ";
                    } else {
                        var message = scorebd.getPlayerName(GTP.gamestate.currentPlayer + 1) + ", it is still your turn. ";
                    }

                    /*If puzzle is unsolved, prompt (iff vowels available & player has >= $250, incude vowel option) */
                    if (!GTP.gamestate.isPuzzleSolved) {
                        if (!allVowelsFound && !allConsonantsFound && scorebd.score(GTP.gamestate.currentPlayer) >= 250) {
                            GTP.dialog.vowelSpinSolveDialog(message);
                        }
                        else if (!allVowelsFound && scorebd.score(GTP.gamestate.currentPlayer) > 250) {
                            GTP.dialog.vowelSolveDialog(message);
                        }
                        else if (!allConsonantsFound) {
                            GTP.dialog.spinSolveDialog(message);
                        } else {
                            GTP.dialog.solveDialog(message);
                        }
                        //otherwise, the user has finished the puzzle
                    } else {
                        gsm.filledPuzzle();
                    }

                },
                onentertermTurn: function (event, from, to) { /*Go to next player and start turn. */
                    //remove highlight from all three scores
                    $(".score").removeClass("active");
                    GTP.gamestate.currentPlayer = GTP.gamestate.currentPlayer + 1;
                    GTP.gamestate.currentPlayer = GTP.gamestate.currentPlayer % GTP.ruleset.PLAYERS;
                    GTP.dialog.alphabetElement.hide(); // hide the letters after the round has been terminated
                    gsm.initTurn(); //Init next turn.
                },
                onentertermRound: function (event, from, to) { /*Go to next round and start. */
                    //remove highlight from all three scores
                    $(".score").removeClass("active");
                    GTP.sounds.endRoundSound();

                    GTP.dialog.hideMessage();
                    GTP.dialog.termRoundDialog();

                    //Flip all tiles
                    $(".contains_letter").addClass("flip");

                    // reset vowel and consonant dependent variables
                    GTP.gamestate.numberOfVowelsRemaining = 0;
                    noMoreVowelsAlertDisplayed = false;
                    GTP.gamestate.numberOfConsonantsRemaining = 0;
                    noMoreConsonantsAlertDisplayed = false;

                    //winning player minimum wins 1000.
                    scorebd.setScore(GTP.gamestate.currentPlayer, Math.max(1000, scorebd.score(GTP.gamestate.currentPlayer)));

                    //Add point totals of winning player to total score
                    scorebd.pushToTotalScore(GTP.gamestate.currentPlayer);

                    var timer = $.timer(function () {
                        depopulateBoard(); //Clear the board
                        resetAlphabet(); // reset the alphabet
                        gsm.initRound();  //Init next round
                    });
                    timer.once(5000);

                },
                onenternoMoreVowels: function (event, from, to) {
                    noMoreVowelsAlertDisplayed = true;
                    setRemainingVowelsToRed();
                    new Messi('All the vowels in the phrase have been called out.',
                            {title: 'No more vowels!',
                                titleClass: 'anim warning',
                                buttons: [{id: 0, label: 'Close', val: 'X'}],
                                modal: true,
                                callback: function (val) {
                                    gsm.success();
                                }
                            });
                },
                onenternoMoreConsonants: function (event, from, to) {
                    noMoreConsonantsAlertDisplayed = true;
                    setRemainingConsonantsToRed();
                    new Messi('All the consonants in the phrase have been called out.',
                            {title: 'No more consonants!',
                                titleClass: 'anim warning',
                                buttons: [{id: 0, label: 'Close', val: 'X'}],
                                callback: function (val) {
                                    gsm.success();
                                }
                            });
                },
                onenterguess: function (event, from, to) {
                    GTP.dialog.hideMessage();
                    GTP.dialog.solveLockInDialog();
                },
                onenterterm: function (event, from, to) {
                    GTP.dialog.hideMessage();
                    GTP.dialog.gameFinishDialog();
                }
            }

        });


        ///////////////////////////////////////////////////////////
        //////////////////////  START /////////////////////////////
        ///////////////////////////////////////////////////////////


        var setRemainingConsonantsToRed = function () {
            $(".consonant:not(.letter_called)").addClass("letter_called_none");
        };

        var setRemainingVowelsToRed = function () {
            $(".vowel:not(.letter_called)").addClass("letter_called_none");
        };

        onLetterClick = function (event) {

            if ($(event.target).attr("data-clickable") === "yes") {

                // we shouldn't be able to click the letter again this round
                // so we set the attribute to no 
                $(event.target).attr("data-clickable", "no");

                // hide the alphabet
                GTP.dialog.alphabetElement.hide();
                $(".letter").show(); //show all letters b/c only shows consonant or vowels

                // we clicked a letter
                // we need to see if we were allowed to click that letter
                letter = event.data.letter;
                vowelChosen = ['A', 'E', 'I', 'O', 'U'].indexOf(letter) !== -1;
                consonantChosen = !vowelChosen;

                count = $("p.letter:contains('" + letter + "')").parents(".cell").length;
                flipTiles(letter);

                // regardless if there are or aren't any selected vowels in 
                // the phrase, we must deduct $250 from the current player's 
                // score
                if (vowelChosen) {
                    scorebd.buyVowel(GTP.gamestate.currentPlayer);
                }

                if (count > 0) {

                    GTP.sounds.correctLetterSound(); // play the "correctGuess" sound

                    $(".letter_" + letter).addClass("letter_called");

                    // handle choosing an unselected vowel 
                    if (vowelChosen) {
                        GTP.gamestate.numberOfVowelsRemaining -= 1;

                        // handle choosing an unselected consonant
                    } else {
                        GTP.gamestate.numberOfConsonantsRemaining -= 1;
                        scorebd.earnConsonant(GTP.gamestate.currentPlayer, count * GTP.gamestate.currentSliceValue);
                    }

                    //Successful selection
                    gsm.success();

                } else { /*Count == 0 */
                    GTP.sounds.incorrectLetterSound(); // Play the "incorrectGuess sound"

                    $(".letter_" + letter).addClass("letter_called_none");

                    //There were no instances of that letter therefore player loses turn
                    gsm.loseTurn();
                }
            }
        };

        //GAME INIT
        gsm.initPhrases();


    });
})(jQuery);
