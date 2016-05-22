var SlackBot = require('slackbots');

var request = require('request');
var _ = require('lodash');
var Solver = require('./Solver.js');

var azmmbot_token = 'xoxb-44758592562-ZStf1kqsQ2lYj0Iz1G7EGPs6';

var url = 'http://az-mastermind.herokuapp.com'

console.log('Creating solver');

var game_state = null;
var solver = Solver.createSolver('RBGYPOCM', 8);
solver.checkPopulationSample = true;
  
var allPerms = solver.generatePermutations();

var someGuess = null;

console.log('Solver created');

// create a bot
var bot = new SlackBot({
    token: azmmbot_token, 
    name: 'az-mm-bot'
});

bot.on('start', function() {
    
    var commands = [
        { hear: /hi|hello/,
          execute: function(data) { reply(data, 'Hi'); } },
        { hear: /new game/,
          execute: newGame },
        { hear: /[RBGYPOCM]{8}/i,
          execute: playGuess },
        { hear: /tip/,
          execute: tip }
    ];
   
    function newGame(data) {
        var params = { user: 'az-mm-bot' };
        request.post(url + '/new_game', { json: params }, function(error, reqResponse, body) {
            if (!error && reqResponse.statusCode == 200) {
                game_state = body;
                solver.resetWithPopulation(allPerms);
                    
                reply(data, 'Okay, I got a new game for you' +
                            '\r\nThe game is composed of ' + game_state.code_length + ' positions' +
                            '\r\nThe available colors are ' + game_state.colors +
                            '\r\nYou have 5 minutes to try to guess the code' +
                            '\r\nWhat\'s your first guess? Type something like: "RRBPPCBC"');
            } else {
                reply(data, 'Something weird happened..' +
                            '\r\nHave a look: ' + error);
            }
        });
    }
    
    function playGuess(data, matches) {
        var params = { code: matches[0], game_key: game_state.game_key };

        request.post(url + '/guess', { json: params }, function(error, reqResponse, body) {
            if (!error && reqResponse.statusCode == 200) {
                game_state = body;
                askGuess_evaluateGuess(data);
            } else {
                reply(data, 'Something weird happened..' +
                        '\r\nHave a look: ' + error);
            }
        });
    }
    
    var isWarnGiven = false;
    function tip(data) {
        
        if (!isWarnGiven) {
           reply(data, 'You know there are more than 16 million possibilities? I may take a while...' + 
           '\r\nIf you want a tip, say "tip" again');
            isWarnGiven = true;
        } else {
            someGuess = someGuess == null ? solver.getFirstGuess() : solver.getNextBestGuess(game_state.result);
            console.log('guess could be: ' + someGuess);
            reply(data, 'Okay, how about: ' + someGuess + ' ?');    
        }
    }
    
    bot.on('message', function(data) {
        if(data.type === 'message' && data.bot_id === undefined) {
            _.forEach(commands, function(cmd) {
                if (cmd.hear.test(data.text))
                    cmd.execute(data, cmd.hear.exec(data.text));
            });
        }
    }); 
    
    function reply(data, message, callback) {
        bot.getUsers().then(function(users) {
            for (var eachuser in users.members) {
                if (users.members[eachuser].id == data.user) {
                    name = users.members[eachuser].name;
                    bot.postMessageToUser(name, message, callback);
                }
            }
        });    
    }
    
    function askGuess_evaluateGuess(data) {
        solver.receiveFeedback(game_state.guess, game_state.result);
           
        if (game_state.solved == 'true') {
            reply(data, 'You win!!!' +
                        '\r\nIf you want to play again, type *new game*');
        } else {
            reply(data, 'You got ' + game_state.result.exact + ' exact guesses and ' + game_state.result.near + ' near' +
                        '\r\nGuess again!');
        }   
    }
    
    console.log('Bot started!');
});
