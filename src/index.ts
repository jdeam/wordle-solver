import { startGame, enterGuess, copySquares } from './utils/page';
import { getNextGuess } from './utils/word';

const getSolution = async () => {
    const { page, browser } = await startGame();

    const toInclude = new Set<string>();
    const toExclude = new Set<string>();
    const toIncludeAt = {};
    const toExcludeAt = {};

    for (let i = 0; i < 6; i++) {
        const guess = getNextGuess(
            toInclude,
            toExclude,
            toIncludeAt,
            toExcludeAt,
            i,
        );

        const results = await enterGuess(page, guess, i);
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

    const squares = await copySquares(page);
    await browser.close();
    return squares;
};

getSolution().then(console.log);
