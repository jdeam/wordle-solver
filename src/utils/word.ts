import fs from "fs";
import path from "path";

const wordList: string[] = fs
    .readFileSync('data/words_long.txt')
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
    // Then mark present/absent letters
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
  return new Set(word.split("")).size === 5;
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

/**
 * Given a filename with a newline separated list of words, calculate each word's 'score' and return the resulting
 * Object with each word as a key and its score as the value.
 * @param wordListFilename string name of the file that contains words we want to score.
 * @param outFilename string name of the file where the output should be saved
 * @param wordScore (x: string) => number the function to use to score each word
 * @returns Object<string, number> that maps a word to its score
 */
 export const saveWordScores = (
    wordListFilename: string = 'words_long.txt',
    outFilename: string = 'words_long_scores.json',
    wordScore: (word: string) => number = getWordVal,
  ): { [word: string]: number } => {
    // if caller only provided a filename without a path (i.e. output.json) then
    // default to looking up the input file in the 'data' directory of this project
    if (!wordListFilename.includes('/')) {
      wordListFilename = path.resolve(__dirname, `../../data/${wordListFilename}`);
    }
    const words = fs.readFileSync(wordListFilename).toString().split(/\r?\n|\r/);
    const result = {};
    words.forEach((word) => {
      result[word] = wordScore(word);
    });
  
    // if caller only provided a filename without a path (i.e. output.json) then
    // default to storing the resulting file in the 'data' directory of this project
    if (!outFilename.includes('/')) {
      outFilename = path.resolve(__dirname, `../../data/${outFilename}`);
    }
    const stringResult = JSON.stringify(result, null, 4);
    fs.writeFileSync(outFilename, stringResult);
  
    return result;
};
