import fs from "fs";
import path from "path";

const wordList: string[] = fs
  .readFileSync("data/sgb-words.txt")
  .toString()
  .split(/\r?\n|\r/);

const positionToLetterCount: { [char: string]: number }[] = [];

wordList.forEach((word) => {
  word.split("").forEach((l, i) => {
    const letterToCount = positionToLetterCount[i] || {};
    letterToCount[l] = (letterToCount[l] || 0) + 1;
    positionToLetterCount[i] = letterToCount;
  });
});

const getWordValue = (word: string): number => {
  return word.split("").reduce((v, l, i) => {
    return v + positionToLetterCount[i][l];
  }, 0);
};

type Validator = (word: string) => boolean;
export type ToExclude = { [char: string]: boolean };
export type ToIncludeNotAt = { [index: string]: string[] };
export type ToIncludeAt = { [index: string]: string };

const isNotPlural: Validator = (word) => word[4] !== "s";

const hasAllUniqueLetters: Validator = (word) => {
  return new Set(word.split("")).size === 5;
};

const excludes = (isExcluded: ToExclude): Validator => {
  return (word: string) => word.split("").every((l) => !isExcluded[l]);
};

const includesNotAt = (indexToLetters: ToIncludeNotAt): Validator => {
  return (word: string) => {
    return Object.entries(indexToLetters).every(([i, letters]) => {
      return letters.every((l) => word.includes(l) && word[i] !== l);
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
  index: number
) => {
  const conditions: Validator[] = [
    ...(index < 2 ? [hasAllUniqueLetters, isNotPlural] : []),
    excludes(toExclude),
    includesNotAt(toIncludeNotAt),
    includesAt(toIncludeAt),
  ];

  const { word } = wordList.reduce((max: { word: string; val: number } | null, word) => {
    const shouldInclude = conditions.every((c) => c(word));
    if (!shouldInclude) return max;
    const val = getWordValue(word);
    return max?.val >= val ? max : { word, val };
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
  wordListFilename: string = "sgb-words.txt",
  outFilename: string = "sgb-word-scores.json",
  wordScore: (word: string) => number = getWordValue
): { [word: string]: number } => {
  // if caller only provided a filename without a path (i.e. output.json) then
  // default to looking up the input file in the 'data' directory of this project
  if (!wordListFilename.includes("/")) {
    wordListFilename = path.resolve(__dirname, `../../data/${wordListFilename}`);
  }
  const words = fs.readFileSync(wordListFilename).toString().split("\n");
  const result = {};
  words.forEach((word) => {
    result[word] = wordScore(word);
  });

  // if caller only provided a filename without a path (i.e. output.json) then
  // default to storing the resulting file in the 'data' directory of this project
  if (!outFilename.includes("/")) {
    outFilename = path.resolve(__dirname, `../../data/${outFilename}`);
  }
  const stringResult = JSON.stringify(result);
  fs.writeFileSync(outFilename, stringResult);

  return result;
};
