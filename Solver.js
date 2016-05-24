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
            console.log('!!!!!!!! Should not be here !!!!!!!!');
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
        console.log('set is of size: ' + self.s.length)
        
        var new_s = _.filter(self.s, function(item) {
                        return self.matchScore(item, testSecret, testScore);
                    });
                    
        return new_s;
    }
    
    self.score = function(test, hidden) {
    
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
            var index = self.baseIndexOf(hidden, test[i])
            if (index >= 0) {
                near++;
                hidden[index] = null;
                test[i] = null;
            }
        }
        
        return { exact: exact, near: near };
    }
    
    self.baseIndexOf = function(array, value) {
        var index = -1;
        
        while (++index < positions) {
            if (array[index] === value) {
                return index;
            }
        }
        return -1;
    }
        
    self.matchScore = function(test, hidden, targetScore) {
        var exact = 0;
        var near = 0;
        
        test = test.split('');
        hidden = hidden.split('');
        
        for (var i = 0; i < positions; i++) {
            if (hidden[i] == test[i]) {
                exact++;
                if (exact > targetScore.exact)
                    return false;
                hidden[i] = null;
                test[i] = null;
            }
        }
        
        if (exact != targetScore.exact)
            return false;
        
        for (var i = 0; i < positions; i++) {
            if (test[i] == null) continue;
            var index = self.baseIndexOf(hidden, test[i])
            if (index >= 0) {
                near++;
                if (near > targetScore.near)
                    return false;
                hidden[index] = null;
                test[i] = null;
            }
        }
        
        return near == targetScore.near;
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
