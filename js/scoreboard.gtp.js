// jQuery Plugin Boilerplate
// A boilerplate for jumpstarting jQuery plugins development
// version 2.0, July 8th, 2011
// by Stefan Gabos

;
(function($) {

    $.SCOREBOARD = function(el, players, currency, options) {

        var scoreboard;
        var playerTotalScore;
        var playerScore;
        var currency;

        // Update Score Function (uses scoreboard

        var defaults = {
            propertyName: 'value',
            onSomeEvent: function() {
            }
        }

        var plugin = this;

        plugin.settings = {}

        var init = function() {
            plugin.settings = $.extend({}, defaults, options);
            plugin.el = el;
            plugin.currency = currency;
            // code goes here

            playerTotalScore = new Array(players);
            playerTotalScore[0] = 0;
            playerTotalScore[1] = 0;
            playerTotalScore[2] = 0;

            playerScore = new Array(players);
            playerScore[0] = 0;
            playerScore[1] = 0;
            playerScore[2] = 0;


            ///////////////////////////////////////////////////////////
            ///////////////// SCOREBOARD SETUP ////////////////////////
            ///////////////////////////////////////////////////////////

            //alert("hellow");
            scoreboard = ich.scoreboard_template();

            for (var p = 0; p < players; p++) {
                scoreboard.append(ich.score_template());
            }

            scoreboard.children().first().addClass("alpha");
            scoreboard.children().last().addClass("omega");

            el.append(scoreboard);


            ///////////////////////////////////////////////////////////
            ////////////// END SCOREBOARD SETUP ///////////////////////
            ///////////////////////////////////////////////////////////
        }

        plugin.newRound = function() {
            //Clear out old round scores
            playerScore[0] = 0;
            playerScore[1] = 0;
            playerScore[2] = 0;
        }

        plugin.score = function(player) {
            return playerScore[player];
        }

        plugin.pushToTotalScore = function(player) {
            //Add point totals of winning player to total score
            playerTotalScore[player] += playerScore[player];
        }

        plugin.buyVowel = function(player) {
            playerTotalScore[player] -= 250;
        }

        plugin.earnConsonant = function(player, value) {
            playerTotalScore[player] += value;
        }

        plugin.updateScore = function() {
            scoreboard.children().each(function(i) {
                $(this).children().first().text(plugin.currency + playerScore[i]);
                $(this).children().last().text(plugin.currency + playerTotalScore[i]);
            })
        };

        init();

    }

})(jQuery);