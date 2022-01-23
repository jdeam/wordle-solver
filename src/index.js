const { 
    startGame, 
    enterGuess, 
    getResults,
    copySquares,
} = require('./utils/page');
const getNextGuess = require('./utils/word');

const main = async () => {
    const { page, browser } = await startGame();

    const guesses = new Set();
    const hits = new Set();

    const toExclude = {};
    const toIncludeNotAt = {};
    const toIncludeAt = {};

    for (let i = 0; i < 6; i++) {
        const guess = getNextGuess({
            unique: !i,
            toExclude,
            toIncludeNotAt,
            toIncludeAt,
        });

        guesses.add(guess);
        await enterGuess(page, guess);
        const results = await getResults(page, i);
        
        if (results.every(r => r === 'correct')) break;

        results.forEach((result, i) => {
            const l = guess[i];
            
            switch (result) {
                case 'correct':
                    toIncludeAt[i] = l;
                    hits.add(l);
                    break;
                case 'present': 
                    toIncludeNotAt[i] = [...(toIncludeNotAt[i] || []), l];
                    hits.add(l);
                    break;
                case 'absent': 
                    if (!hits.has(l)) toExclude[l] = true;
                    break;
            }
        });
    }

    const squares = await copySquares(page);
    const guessList = [...guesses].map(g => g.toUpperCase()).join('\n');
    console.log(`${squares}\n\n${guessList}`);

    await browser.close();
};

main();
