var _ = require('lodash');
var Solver = require('./Solver.js');

var chars = 'RBGYPOCM';
var positions = 0;

test4positions();
test8positions();
timeValidateScores();

function test4positions() {
    positions = 4;
    var solver = Solver.createSolver(chars, positions);
    solver.checkPopulationSample = true;

    var score = solver.score;

    console.log(isSameScore(score('RBWY', 'RRRR') , {exact:1, near:0}) ? 'OK' : 'NOK');
    console.log(isSameScore(score('RRRR', 'RBWY') , {exact:1, near:0}) ? 'OK' : 'NOK');
    console.log(isSameScore(score('1111', '1122') , {exact:2, near:0}) ? 'OK' : 'NOK');
    console.log(isSameScore(score('1122', '1111') , {exact:2, near:0}) ? 'OK' : 'NOK');
    console.log(isSameScore(score('1124', '1234') , {exact:2, near:1}) ? 'OK' : 'NOK');
    console.log(isSameScore(score('1234', '1124') , {exact:2, near:1}) ? 'OK' : 'NOK');
    console.log(isSameScore(score('YYYR', 'RRRR') , {exact:1, near:0}) ? 'OK' : 'NOK');
    console.log(isSameScore(score('RRRR', 'YYYR') , {exact:1, near:0}) ? 'OK' : 'NOK');
    console.log(isSameScore(score('RRRR', 'YYYR') , {exact:1, near:0}) ? 'OK' : 'NOK');
    console.log(isSameScore(score('1111', '1111') , {exact:4, near:0}) ? 'OK' : 'NOK');
    console.log(isSameScore(score('1112', '1111') , {exact:3, near:0}) ? 'OK' : 'NOK');
    console.log(isSameScore(score('1122', '2211') , {exact:0, near:4}) ? 'OK' : 'NOK');
    console.log(isSameScore(score('1133', '2211') , {exact:0, near:2}) ? 'OK' : 'NOK');
    validateScores('OPGB', 'YYOG');
    validateScores('YYOG', 'OPGB');
}

function test8positions() {
    positions = 8;

    var solver = Solver.createSolver(chars, positions);
    solver.checkPopulationSample = true;

    validateScores('OPGBYYYY', 'YYOGYYYY');
    validateScores('YYOGYYYY', 'OPGBYYYY');
    console.log(isSameScore(solver.score('11112222', '22221111') , {exact:0, near:8}) ? 'OK' : 'NOK');
    console.log(isSameScore(solver.score('12112222', '22221111') , {exact:1, near:6}) ? 'OK' : 'NOK');
    console.log(isSameScore(solver.score('13426512', '22221234') , {exact:1, near:4}) ? 'OK' : 'NOK');
}

function timeValidateScores() {
    positions = 8;

    console.log('timing');
    console.time('time');

    for (var count = 0; count < 500000; count++) {
        var guess1 = randomCode();
        var guess2 = randomCode();
        validateScores(guess1, guess2);
    }

    console.timeEnd('time');
}



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

function validateScores(guess1, guess2) {
    var solver = Solver.createSolver(chars, positions);
    var isValid = solver.matchScore(guess1, guess2, solver.score(guess2, guess1));
    if (!isValid) {
        console.log('Score mismatch: ' + guess1 + '!=' + guess2);    
    }
}
