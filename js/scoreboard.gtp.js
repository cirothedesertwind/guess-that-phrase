// jQuery Plugin Boilerplate
// A boilerplate for jumpstarting jQuery plugins development
// version 2.0, July 8th, 2011
// by Stefan Gabos

;
(function($) {

    $.SCOREBOARD = function(el, players, currency, options) {

        var scoreboard;
        var playerName;
        var playerTotalScore;
        var playerScore;
        var currency;

        // Update Score Function (uses scoreboard

        var defaults = {
            propertyName: 'value',
            onSomeEvent: function() {
            }
        };

        var plugin = this;

        plugin.settings = {};

        var init = function() {
            plugin.settings = $.extend({}, defaults, options);
            plugin.el = el;
            plugin.currency = currency;
            // code goes here

            playerName = new Array(players);
            playerName[0] = "Player 1";
            playerName[1] = "Player 2";
            playerName[2] = "Player 3";
            
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
        };

        plugin.newRound = function() {
            //Clear out old round scores
            playerScore[0] = 0;
            playerScore[1] = 0;
            playerScore[2] = 0;
        };

        plugin.score = function(player) {
            return playerScore[player];
        };
        
        plugin.setScore = function(player, value){
            playerScore[player] = value;
        };

        plugin.pushToTotalScore = function(player) {
            //Add point totals of winning player to total score
            playerTotalScore[player] += playerScore[player];
        };

        plugin.buyVowel = function(player) {
            playerScore[player] -= 250;
        };

        plugin.earnConsonant = function(player, value) {
            playerScore[player] += value;
        };

        plugin.updateScore = function() {
            scoreboard.children().each(function(i) {
                $(this).children().first().text(playerName[i]);
                $(this).children().eq(2).text(plugin.currency + playerScore[i]);
                $(this).children().last().text(plugin.currency + playerTotalScore[i]);
            });
        };

        plugin.getWinners = function() {
            var arrayOfWinners = new Array();
            var maxScore = Math.max.apply(Math, playerTotalScore);
            for (var i = 0; i!=playerTotalScore.length;i++) {
                if (playerTotalScore[i] == maxScore) {
                    arrayOfWinners.push(i);
                }
            }

            return arrayOfWinners;
        };

        plugin.setPlayerName = function(player, name) {
            playerName[player] = name;
        }

        plugin.getPlayerName = function(player) {
            return "<b>" + playerName[player] + "</b>";
        }

        init();

    };

})(jQuery);