var _ = require('lodash');

var Solver = require('./Solver.js');
    
var chars = 'RBGYPOCM',
    positions = 8;

var solver = Solver.createSolver(chars, positions);
solver.checkPopulationSample = true;
var allPerms = solver.generatePermutations();
    
solver.resetWithPopulation(allPerms);

var secretCode = randomCode(chars, positions);

var i = 0;

var someGuess = solver.getFirstGuess();
var someGuessScore = solver.score(someGuess, secretCode);

while (someGuessScore.exact < positions) {
    i++;
    console.log('..receiveFeedback: ' );
    solver.receiveFeedback(someGuess, someGuessScore);
    
    console.log('..getNextBestGuess: ' );
    someGuess = solver.getNextBestGuess(someGuessScore);
    
    console.log('..trying: ' );
    console.log('..'+secretCode + ' = ' + someGuess);
    
    someGuessScore = solver.score(someGuess, secretCode);
}

console.log('VICTORY');
console.log(secretCode + ' = ' + someGuess);

function randomCode() {
    var secret = '';
    for (var i = 0; i < positions; i++) {
        var j = _.random(0, chars.length-1);
        secret += chars[j];
    }
    return secret;
}
