var _ = require('lodash');

var Solver = require('./Solver.js');
    
var chars = 'RBGYPOCM',
    positions = 8;

var solver = Solver.createSolver(chars, positions);
solver.checkPopulationSample = true;
var allPerms = solver.generatePermutations();

console.time('time');
    
for (var count = 0; count < 10; count++) {
    solver.resetWithPopulation(allPerms);

    var secretCode = randomCode(chars, positions);

    var i = 0;

    var someGuess = solver.getFirstGuess();
    var someGuessScore = solver.score(someGuess, secretCode);

    while (someGuessScore.exact < positions) {
        i++;
        
        solver.receiveFeedback(someGuess, someGuessScore);
        
        someGuess = solver.getNextBestGuess(someGuessScore);
        
        someGuessScore = solver.score(someGuess, secretCode);
    }

    console.log('VICTORY in ' + i + ' tries');    
}

console.timeEnd('time');

function randomCode() {
    var secret = '';
    for (var i = 0; i < positions; i++) {
        var j = _.random(0, chars.length-1);
        secret += chars[j];
    }
    return secret;
}
