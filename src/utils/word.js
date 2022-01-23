const fs = require('fs');

const wordList = fs.readFileSync('assets/sgb-words.txt').toString().split('\n');

const positionToLetterCount = [];

wordList.forEach(word => {    
    word.split('').forEach((l, i) => {
        const letterToCount = positionToLetterCount[i] || {};
        const count = letterToCount[l];
        if (count) letterToCount[l]++;
        else letterToCount[l] = 1;
        positionToLetterCount[i] = letterToCount;
    });
});

const getWordValue = (word) => {
    return word.split('').reduce((v, l, i) => {
        return v + positionToLetterCount[i][l];
    }, 0); 
};

const hasAllUniqueLetters = (word) => {
    return new Set(word.split('')).size === 5;
};

const excludes = (isExcluded) => {
    return (word) => word.split('').every(l => !isExcluded[l]);
};

const includesNotAt = (indexToLetters) => {
    return (word) => {
        return Object.entries(indexToLetters)
            .every(([i, letters]) => {
                return letters.every(l => word.includes(l) && word[i] !== l);
            });
    };
};

const includesAt = (indexToLetter) => {
    return (word) => {
        return Object.entries(indexToLetter)
            .every(([i, l]) => word[i] === l);
    };
};

const getNextGuess = ({
    unique,
    toExclude,
    toIncludeNotAt,
    toIncludeAt,
}) => {    
    const conditions = [
        unique && hasAllUniqueLetters,
        excludes(toExclude),
        includesNotAt(toIncludeNotAt),
        includesAt(toIncludeAt),
    ].filter(Boolean);

    const { word } = wordList
        .reduce((max, word) => {
            const shouldInclude = conditions.every(c => c(word));
            if (!shouldInclude) return max;
            const val = getWordValue(word);
            return max?.val >= val ? max : { word, val };
        });
    
    return word;
};

module.exports = getNextGuess;
