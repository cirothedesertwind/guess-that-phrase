window.ParsleyValidator
    .addValidator('fits', function (value, requirement) {
        if (value === "") {
            return true;
        } else {
            var pass = canFitOnBoard(value);
            return pass;
        }
    }, 32)
    .addMessage('en', 'fits', 'This phrase must fit in the Wheel of Fortune board.');

canFitOnBoard = function(phrase) {
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

    // These indices point to the locations on the board below.
    //  X-----------  //
    // -X------------ //
    // -X------------ //
    //  X-----------  //

    TOTAL_TILES = 12 + 14 + 14 + 12;
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
    if (phrase.length > TOTAL_TILES) {
        return false;
    }

    //checks words for length
    for (var i = 0; i != words.length; i++) {
        if (words[i].length >= 14) {
            return false;
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
                    if (len != 0) {
                        len += choose[0] - 1;
                    }
                    len_per_line[0] = len;

                    len = 0;
                    for (var i = 0; i < choose[1]; i++) {
                        word = words[i + choose[0]];
                        len += word.length;
                    }
                    if (len != 0) {
                        len += choose[1] - 1;
                    }
                    len_per_line[1] = len;

                    len = 0;
                    for (var i = 0; i < choose[2]; i++) {
                        word = words[i + choose[0] + choose[1]];
                        len += word.length;
                    }
                    if (len != 0) {
                        len += choose[2] - 1;
                    }
                    len_per_line[2] = len;

                    len = 0;
                    for (var i = 0; i < choose[3]; i++) {
                        word = words[i + choose[0] + choose[1] + choose[2]];
                        len += word.length;
                    }
                    if (len != 0) {
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

                    if (num_lines_occupied == 2) {
                        var count = 0;
                        var temp_len_per_line = new Array(4);
                        temp_len_per_line[0] = 0;
                        temp_len_per_line[3] = 0;
                        tmp_choose[0] = 0;
                        tmp_choose[3] = 0;
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
                        temp_len_per_line[3] = 0;
                        tmp_choose[3] = 0;
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
                    return true;

                }
            }
        }
    } else {

        // it looks like our selection fits on one line
        return true;
    }

    // we need to alert the user if they gave a phrase that could not fit on the board
    return false;
}