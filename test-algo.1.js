var _ = require('lodash');
var rp = require('request-promise');

var url = 'http://az-mastermind.herokuapp.com';

var Solver = require('./Solver.js');
    
var chars = 'RBGYPOCM',
    positions = 8;

var solver = Solver.createSolver(chars, positions);
solver.checkPopulationSample = true;
var allPerms = solver.generatePermutations();

var params = { user: 'az-mm-bot' };
rp.post(url + '/new_game', { json: params }).then(function(body) {
    
    var game_state = body;
    solver.resetWithPopulation(allPerms);
    
    return tryGuess(solver.getFirstGuess(), game_state);
});

function tryGuess(nextGuess, game_state) {
    return rp.post(url + '/guess', { json: { code: nextGuess, game_key: game_state.game_key } })
             .then(receiveGuess);
}

function receiveGuess(body) {
    var someGuessScore = body.result;
    
    if (someGuessScore.exact >= positions) {
        console.log('VICTORY in ' + body.past_results.length + ' tries');
        return;
    } else {
        solver.receiveFeedback(body.guess, someGuessScore);
        var nextGuess = solver.getNextBestGuess(someGuessScore);
        return tryGuess(nextGuess, body);
    }
}
