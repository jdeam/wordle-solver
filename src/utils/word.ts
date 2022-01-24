import fs from 'fs';

const wordList: string[] = fs.readFileSync('src/sgb-words.txt')
    .toString()
    .split(/\r?\n|\r/);

const positionToLetterCount: { [char: string]: number }[] = [];

wordList.forEach(word => {    
    word.split('').forEach((l, i) => {
        const letterToCount = positionToLetterCount[i] || {};
        letterToCount[l] = (letterToCount[l] || 0) + 1;
        positionToLetterCount[i] = letterToCount;
    });
});

const getWordValue = (word: string): number => {
    return word.split('').reduce((v, l, i) => {
        return v + positionToLetterCount[i][l];
    }, 0); 
};

type Validator = (word: string) => boolean;
export type ToExclude = { [char: string]: boolean };
export type ToIncludeNotAt = { [index: string]: string[] };
export type ToIncludeAt = { [index: string]: string };

const hasAllUniqueLetters: Validator = (word) => {
    return new Set(word.split('')).size === 5;
};

const excludes = (isExcluded: ToExclude): Validator => {
    return (word: string) => word.split('').every(l => !isExcluded[l]);
};

const includesNotAt = (indexToLetters: ToIncludeNotAt): Validator => {
    return (word: string) => {
        return Object.entries(indexToLetters).every(([i, letters]) => {
            return letters.every(l => word.includes(l) && word[i] !== l);
        });
    };
};

const includesAt = (indexToLetter: ToIncludeAt): Validator => {
    return (word) => {
        return Object.entries(indexToLetter).every(([i, l]) => word[i] === l);
    };
};

export const getNextGuess = (
    toExclude: ToExclude,
    toIncludeNotAt: ToIncludeNotAt,
    toIncludeAt: ToIncludeAt,
    index: number,
) => {    
    const conditions: Validator[] = [
        ...(index < 2 ? [hasAllUniqueLetters] : []),
        excludes(toExclude),
        includesNotAt(toIncludeNotAt),
        includesAt(toIncludeAt),
    ];

    const { word } = wordList
        .reduce((max: { word: string, val: number } | null, word) => {
            const shouldInclude = conditions.every(c => c(word));
            if (!shouldInclude) return max;
            const val = getWordValue(word);
            return max?.val >= val ? max : { word, val };
        }, null);
    
    return word;
};
