const fs = require('fs');

const wordList = fs.readFileSync('assets/sgb-words.txt')
    .toString()
    .split('\n');

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

const excludes = (letters) => {
    return (word) => {
        return word
            .split('')
            .every(letter => !letters.includes(letter));
    };
};

const includesNotAt = (indicesWithLetters) => {
    return (word) => {
       return indicesWithLetters.every(([index, letter]) => {
           return word[index] !== letter && word.includes(letter);
        });
    };
};

const includesAt = (indicesWithLetters) => {
    return (word) => {
        return indicesWithLetters
            .every(([index, letter]) => word[index] === letter);
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

    const sortedOptions = wordList
        .reduce((acc, word) => {
            const shouldInclude = conditions.every(condition => condition(word));
            if (shouldInclude) acc.push({word, val: getWordValue(word)});
            return acc;
        }, [])
        .sort((a, b) => b.val - a.val);
    
    return sortedOptions[0]?.word;
};

module.exports = { getNextGuess };
