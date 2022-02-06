import fs from 'fs';

const wordList: string[] = fs.readFileSync('src/words_long.txt')
    .toString()
    .split(/\r?\n|\r/);

type Result = 'correct' | 'present' | 'absent';

export const getResults = (
    guess: string, 
    answer: string,
): Result[] => {
    const copy = answer.split('');
    const results = Array(5);
    // Mark correct letters first ...
    guess.split('').forEach((l, i) => {
        if (copy[i] === l) {
            results[i] = 'correct';
            copy[i] = null;
        }
    });
    // Then mark present/absent letters ...
    guess.split('').forEach((l, i) => {
        if (results[i]) return;
        if (copy.includes(l)) {
            results[i] = 'present';
            copy[copy.indexOf(l)] = null;
            return;
        }
        results[i] = 'absent';
    });

    return results;
};

const getWordVal = (word: string): number => {
    return wordList.reduce((val, answer) => {
        const results = getResults(word, answer);
        const score = results.reduce((s, r) => {
            if (r === 'correct') return s + 2;
            if (r === 'present') return s + 1;
            return s;
        }, 0);
        return val + score;
    }, 0);
};

type WordWithVal = { word: string, val: number };

const wordListWithVals: WordWithVal[] = wordList
    .map(word=> ({ word, val: getWordVal(word) }));

type Validator = (word: string) => boolean;

const hasAllUniqueLetters: Validator = (word) => {
    return new Set(word.split('')).size === 5;
};

const includes = (toInclude: Set<string>): Validator => {
    return (word: string) => [...toInclude].every(l => word.includes(l));
};

const excludes = (toExclude: Set<string>): Validator => {
    return (word: string) => [...toExclude].every(l => !word.includes(l));
};

const includesAt = (toIncludeAt: { [index: string]: string }): Validator => {
    return (word) => {
        return Object.entries(toIncludeAt)
            .every(([i, l]) => word[i] === l);
    };
};

const excludesAt = (toExcludeAt: { [index: string]: string[] }): Validator => {
    return (word: string) => {
        return Object.entries(toExcludeAt)
            .every(([i, letters]) => letters.every(l => word[i] !== l));
    };
};

export const getNextGuess = (
    toInclude: Set<string>,
    toExclude: Set<string>,
    toIncludeAt: { [index: string]: string },
    toExcludeAt: { [index: string]: string[] },
    i: number,
) => {    
    const conditions: Validator[] = i < 2 ? [
        hasAllUniqueLetters,
        excludes(new Set([...toInclude, ...toExclude])),
    ] : [
        includes(toInclude),
        excludes(toExclude),
        includesAt(toIncludeAt),
        excludesAt(toExcludeAt),
    ];

    const { word } = wordListWithVals
        .reduce((max: WordWithVal | null, { word, val }) => {
            const shouldInclude = conditions.every(c => c(word));
            if (!shouldInclude || max?.val >= val) return max;
            return { word, val };
        }, null);

    return word;
};
