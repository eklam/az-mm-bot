var _ = require('lodash');

var chars = 'RBGYPOCM',
    positions = 8;

// console.log(isSameScore(score('RBWY', 'RRRR') , {exact:1, near:0}) ? 'OK' : 'NOK');
// console.log(isSameScore(score('RRRR', 'RBWY') , {exact:1, near:0}) ? 'OK' : 'NOK');
// console.log(isSameScore(score('1111', '1122') , {exact:2, near:0}) ? 'OK' : 'NOK');
// console.log(isSameScore(score('1122', '1111') , {exact:2, near:0}) ? 'OK' : 'NOK');
// console.log(isSameScore(score('1124', '1234') , {exact:2, near:1}) ? 'OK' : 'NOK');
// console.log(isSameScore(score('1234', '1124') , {exact:2, near:1}) ? 'OK' : 'NOK');
// console.log(isSameScore(score('YYYR', 'RRRR') , {exact:1, near:0}) ? 'OK' : 'NOK');
// console.log(isSameScore(score('RRRR', 'YYYR') , {exact:1, near:0}) ? 'OK' : 'NOK');
// validateScores('OPGB', 'YYOG')
// validateScores('YYOG', 'OPGB')

function validateScores(guess1, guess2) {
    var isValid = isSameScore(score(guess1, guess2), score(guess2, guess1));
    if (!isValid) {
        console.log('Score mismatch: ' + guess1 + '!=' + guess2);    
    }
}

console.log('timing');
console.time("time");

for (var count = 0; count < 500000; count++) {
    var guess1 = randomCode();
    var guess2 = randomCode();
    validateScores(guess1, guess2);
}

console.timeEnd("time");

var Solver = require('./Solver.js');
   

var solver = Solver.createSolver(chars, positions);
solver.checkPopulationSample = true;

function randomCode() {
    var secret = '';
    for (var i = 0; i < positions; i++) {
        var j = _.random(0, chars.length-1);
        secret += chars[j];
    }
    return secret;
}

function isSameScore(score1, score2) {
    return score1.exact == score2.exact && score1.near == score2.near;
}

function matchScore(test, hidden, targetScore) {
    var exact = 0;
    var near = 0;
    
    test = test.split('');
    hidden = hidden.split('');
    
    for (var i = 0; i < positions; i++) {
        if (hidden[i] == test[i]) {
            exact++;
            hidden[i] = null;
            test[i] = null;
        }
        if (exact > targetScore.exact)
            return false;
    }
    for (var i = 0; i < positions; i++) {
        if (test[i] == null) continue;
        var index = _.indexOf(hidden, test[i])
        if (index >= 0) {
            near++;
            hidden[index] = null;
            test[i] = null;
        }
        if (near > targetScore.near)
            return false;
    }
    
    return isSameScore(targetScore, { exact: exact, near: near });
}

function score(test, hidden) {
    
    var exact = 0;
    var near = 0;
    
    test = test.split('');
    hidden = hidden.split('');
    
    for (var i = 0; i < positions; i++) {
        if (hidden[i] == test[i]) {
            exact++;
            hidden[i] = null;
            test[i] = null;
        }
    }
    for (var i = 0; i < positions; i++) {
        if (test[i] == null) continue;
        var index = baseIndexOf(hidden, test[i])
        if (index >= 0) {
            near++;
            hidden[index] = null;
            test[i] = null;
        }
    }
    
    return { exact: exact, near: near };
}

function baseIndexOf(array, value) {
    var index = -1;
    
    while (++index < positions) {
        if (array[index] === value) {
            return index;
        }
    }
    return -1;
}

