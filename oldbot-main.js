var azmmbot_token = 'xoxb-44758592562-ZStf1kqsQ2lYj0Iz1G7EGPs6';

var Botkit = require('Botkit');
var os = require('os');
var request = require('request');
var _ = require('lodash');
var Solver = require('./Solver.js');
var Promise = require('bluebird');

var url = 'http://az-mastermind.herokuapp.com'

console.log('Creating solver');

var game_state = null;
var solver = Solver.createSolver('RBGYPOCM', 8);
solver.checkPopulationSample = true;
  
var allPerms = solver.generatePermutations();

var someGuess = null;

console.log('Solver created');

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: azmmbot_token
}).startRTM();

options = function(path, params) {
    return {
        host: url,
        port: 80,
        path: '/' + path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        }
    };
}

controller.on('rtm_open', function() {
    console.log('rtm is open');
});

controller.on('rtm_close', function() {
    console.log('rtm is closed!!!!!!!!!!!!');
});

controller.on('pong', function() {
    console.log('Wow, I almost fell asleep...');
    bot.say('Wow, I almost fell asleep...');
});

controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });

    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hello.');
        }
    });
});

controller.hears(['new game'], 'direct_message', function(bot, message) {
    bot.startConversation(message, startNewGame);
});

startNewGame = function(response, convo) {
    convo.say('Okay, I am setting up a new game for you...');

    var params = { user: 'az-mm-bot' };

    request.post(url + '/new_game', { json: params }, function(error, reqResponse, body) {
        if (!error && reqResponse.statusCode == 200) {
            game_state = body;
            convo.say('Okay, I got a new game for you');
            startNewGame_success(response, convo);
            convo.next();
        } else {
            convo.say('Something weird happened..');
            convo.say('Have a look: ' + error);
            convo.end();
        }
    });
}

startNewGame_success = function(response, convo) {
    
    // solver.resetWithPopulation(allPerms);
    
    explainGame(response, convo)
    askGuess(response, convo, 'What\'s your first guess? Type something like: "RRBPPCBC"');
    convo.next();
}

explainGame = function(response, convo) {
    convo.say('The game is composed of ' + game_state.code_length + ' positions' +
        '\r\nThe available colors are ' + game_state.colors +
        '\r\nYou have 5 minutes to try to guess the code');
}

askGuess = function(response, convo, askText) {
    convo.ask(askText, function(response, convo) {
        
        if (/new game/.test(response.text)) {
            confirmNewGame(response, convo);
            convo.next();
        } else if (/guesses/.test(response.text)) {
            var pastResults = _.reduce(game_state.past_results, function(result, x){
                return result + '\r\n' + x.guess + ' exact: ' + x.exact + ' near: ' + x.near;
            }, 'Your past guesses were: ');
            
            convo.say(pastResults);
            
            askGuess(response, convo, 'Try to guess now!');
            convo.next();
        } else if (/tip/.test(response.text)) {
            convo.say('You know there are more than 16 million possibilities? I may take a while...');
            
            console.log('initializing')
            
            someGuess = someGuess == null ? solver.getNextGuess() : solver.getNextBestGuess();
            
            convo.say('Okay, how about: ' + someGuess);
            askGuess(response, convo, 'Try to guess now!');
            convo.next();
            
        } else {
            convo.say('I\'ll check your guess right away!');
        
            var params = { code: response.text, game_key: game_state.game_key };

            request.post(url + '/guess', { json: params }, function(error, reqResponse, body) {
                if (!error && reqResponse.statusCode == 200) {
                    game_state = body;
                    askGuess_evaluateGuess(response, convo);
                    convo.next();
                } else {
                    convo.say('Something weird happened..');
                    convo.say('Have a look: ' + error);
                    
                    askGuess(response, convo, 'Try to guess again!');
                    convo.next();
                }
            });
        }
    });
}

askGuess_evaluateGuess = function(response, convo) {
    
    solver.receiveFeedback(game_state.guess, game_state.result);
    
    if (game_state.solved == 'true') {
        convo.say('You win!!!');
        convo.say('If you want to play again, type *new game*');
        convo.end();
    } else {
        convo.say('You got ' + game_state.result.exact + ' exact guesses and ' + game_state.result.near + ' near');
        askGuess(response, convo, 'Guess again!');
        convo.next();
    }   
}

confirmNewGame = function(response, convo) { 
    convo.ask('Are you sure you want to start a new game? I think you still have a shot...', function(response, convo) {
        
        if (/yes|new game|I do/.test(response.text)) {
            convo.say('Okay then');
            startNewGame(response, convo);
            convo.next();
        } else {
            askGuess(response, convo, 'I thought not! So, what\'s your guess?');
            convo.next();
        }
    });
}
