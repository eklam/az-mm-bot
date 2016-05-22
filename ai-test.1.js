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

var someGuess = fixedNext(i);
var someGuessScore = score(someGuess, secretCode);

while (someGuessScore.exact < positions) {
    i++;
    console.log('..receiveFeedback: ' );
    solver.receiveFeedback(someGuess, someGuessScore);
    
    console.log('..getNextBestGuess: ' );
    someGuess = solver.getNextBestGuess(someGuessScore);
    someGuess = fixedNext(i);
    
    console.log('..trying: ' );
    console.log('..'+secretCode + ' = ' + someGuess);
    
    someGuessScore = score(someGuess, secretCode);
}

function fixedNext(i) {
    if (i == 0) return 'GCYCOCBR';
    if (i == 1) return 'BPCPPPPR';
    if (i == 2) return 'MMMYMOBM';
    if (i == 3) return 'GMPMMGMO';
    return null;
}

console.log('VICTORY');
console.log(secretCode + ' = ' + someGuess);


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
        
    if (test == 'GCYCOCBR') {
        return {exact:1,near:2}
    }
    else if (test == 'BPCPPPPR') {
        return {exact:0,near:1};
    }
    else if (test == 'MMMYMOBM') {
        return {exact:2,near:3};
    }
    else if (test == 'GMPMMGMO') {
        return {exact:1,near:4};
    }
    else {
        var mko = 'nji';
    }
    
}

