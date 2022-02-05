import fs from 'fs';
import { getNextGuess, getResults } from './utils/word';

const wordList: string[] = fs.readFileSync('src/words_long.txt')
    .toString()
    .split(/\r?\n|\r/);

const guessCounts = [];

for (const answer of wordList) {
    let guessCount = 0;

    const toInclude = new Set<string>();
    const toExclude = new Set<string>();
    const toIncludeAt = {};
    const toExcludeAt = {};

    for (let i = 0; i < 20; i++) {
        const guess = getNextGuess(
            toInclude,
            toExclude,
            toIncludeAt,
            toExcludeAt,
            i,
        );
        
        guessCount += 1;
        const results = getResults(guess, answer);
        if (results.every(r => r === 'correct')) break;

        const { correct, present, absent } = results
            .reduce((acc, r, i) => {
                const l = guess[i];
                acc[r].push([i, l]);
                return acc;
            }, { correct: [], present: [], absent: [] });

        correct.forEach(([i, l]) => {
            toInclude.add(l);
            toIncludeAt[i] = l;
        });

        present.forEach(([i, l]) => {
            toInclude.add(l);
            toExcludeAt[i] = [...(toExcludeAt[i] || []), l];
        });

        absent.forEach(([i, l]) => {
            if (!toInclude.has(l)) toExclude.add(l);
            else toExcludeAt[i] = [...(toExcludeAt[i] || []), l];
        });
    }

    console.log({ answer, guessCount });
    guessCounts.push(guessCount);
}

const sum = guessCounts.reduce((s, c) => s + c);
const avg = sum / guessCounts.length;
console.log({ avg });
