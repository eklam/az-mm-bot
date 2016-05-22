var _ = require('lodash');

positions = 4;
console.log(score('RBWY', 'RRRR'))

var Solver = require('./Solver.js');
    
var chars = 'RBGYPOCM',
    positions = 8;

var solver = Solver.createSolver(chars, positions);
solver.checkPopulationSample = true;
var allPerms = solver.generatePermutations();



for(var i = 0; i < 10; i++) {
    
    solver.resetWithPopulation(allPerms);

    var secretCode = randomCode(chars, positions);

    var someGuess = solver.getFirstGuess();
    var someGuessScore = score(someGuess, secretCode);

    while (someGuessScore.exact < positions) {
        console.log('..receiveFeedback: ' );
        solver.receiveFeedback(someGuess, someGuessScore);
        
        console.log('..getNextBestGuess: ' );
        someGuess = solver.getNextBestGuess(someGuessScore);
        
        console.log('..trying: ' );
        console.log('..'+secretCode + ' = ' + someGuess);
        
        someGuessScore = score(someGuess, secretCode);
    }

    console.log('VICTORY');
    console.log(secretCode + ' = ' + someGuess);
}




var mko = 'nji';

function randomCode() {
    var secret = '';
    for (var i = 0; i < positions; i++) {
        var j = _.random(0, chars.length-1);
        secret += chars[j];
    }
    return secret;
}

function score(test, hidden) {
        
    var exact = 0;
    var near = 0;
    
    for (var i = 0; i < positions; i++) {
        if (hidden[i] == test[i]) {
            exact++;
            near++;
        } else if (test.indexOf(hidden[i]) >= 0) {
            near++;
        }
    }
    
    return { exact: exact, near: near-exact };
}

