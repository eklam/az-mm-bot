'use strict'

var _ = require('lodash');

module.exports.createSolver = function (chars, positions) {
    var self = this;
    
    var maxPopSize = 100000;
    
    var min = 100;
    var max = 500;
    
    self.useRandomPopulation = false;
    self.checkPopulationSample = false;
    
    self.guesses = [];
    
    self.resetWithPopulation = function(pop) {
        self.guesses = [];
        self.s = pop;
    };
    
    self.receiveFeedback = function(guess, gscore) {
        
        console.log('receiving feedback');
        console.log('..guess: ' + guess);
        console.log('..score: ' + JSON.stringify(gscore));
        
        self.guesses.push({guess: guess, score: gscore});
        
        // Remove from S any code that would not give the same response if it (the guess) were the code.
        var new_s = self.onlySameScore(guess, gscore);
        if (new_s.length > 0) {
            self.s = new_s;
        } else {
            // TODO: regenate population only from guys that would not be filtered by previous guesses
            console.log('Should not be here');
            self.s = self.generateRandomPopulation();
        }
    };
    
    self.getFirstGuess = function() {
        if (self.s == null || self.s.length == 0)
            self.generatePopulation();
        
        // first guess
        return _.sample(self.s);
    };
    
    self.generatePopulation = function () {
        self.s = self.useRandomPopulation ? self.generateRandomPopulation() : self.generatePermutations();
    };
    
    self.generateRandomPopulation = function() {
        var perms = [];
        for (var i = 0; i < maxPopSize; i++) {
            perms.push(self.randomCode());
        }
        return perms;
    };
    
    self.generatePermutations = function() {
        var perms = [];
        (function recurse(arr, index) { 
            if (index < positions) {
                for (var i = 0; i < chars.length; i++) {
                    var char = chars[i];
                    arr[index] = char;
                    recurse(arr, index+1);
                }
            } else {
                arr = arr.slice(); // cloning the array
                perms.push(arr.join(''));
            }
        })([], 0);
        return perms;
    }
    
    self.randomCode = function() {
        var secret = '';
        for (var i = 0; i < positions; i++) {
            var j = _.random(0, chars.length-1);
            secret += chars[j];
        }
        return secret;
    }
    
    self.getLastGuess = function() {
        return self.guesses[self.guesses.length-1];
    }
    
    self.onlySameScore = function(testSecret, testScore) {
        var new_s = _.filter(self.s, function(item){
                        var item_score = self.score(testSecret, item);
                        return self.isSameScore(testScore, item_score);
                    });
                    
        return new_s;
    }
    
    self.score = function(test, hidden) {
            
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
    
    self.isSameScore = function(score1, score2) {
        return score1.exact == score2.exact && score1.near == score2.near;
    }
    
    self.getNextBestGuess = function(testScore) {
    
        if (self.s.length == 0)
            throw new Error('Array [s] cannot be empty');
        if (self.s.length == 1)
            return self.s[0];
        
        var min_len = Number.POSITIVE_INFINITY;
        var best_index = -1;

        // Analyze only subset for performance reasons
        var sampleGuesses = self.checkPopulationSample ?
                                  _.sampleSize(self.s, _.clamp(self.s.length, min, max))
                                : self.s;
        
        for (var j = 0; j < sampleGuesses.length; j++) {
            var testSecret = sampleGuesses[j];
            
            // calculate how many possibilities in S would be eliminated for each possible colored/white peg score.
            var howManyEliminated = self.howManyEliminated_(sampleGuesses, testSecret, testScore);
            
            // The score of a guess is the minimum number of possibilities it might eliminate from S
            if (howManyEliminated < min_len) {
                min_len = howManyEliminated;
                best_index = j;
            }
        }
        return sampleGuesses[best_index];
    }
    
    self.howManyEliminated_ = function (sampleGuesses, testSecret, testScore) {
        var countEliminate = 0;
        for (var i = 0, len = sampleGuesses.length; i < len; i++) {
            if (!self.isSameScore(testScore, self.score(testSecret, sampleGuesses[i]))) {
                countEliminate++;
            }
        }
            
        return countEliminate;
    }
   
    return self;
};
