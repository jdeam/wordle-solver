import { 
    startGame, 
    enterGuess, 
    getResults,
    copySquares,
} from './utils/page';
import { 
    ToExclude,
    ToIncludeNotAt,
    ToIncludeAt,
    getNextGuess,
} from './utils/word';

const main = async () => {
    const { page, browser } = await startGame();

    const hits = new Set<string>();
    const toExclude: ToExclude = {};
    const toIncludeNotAt: ToIncludeNotAt = {};
    const toIncludeAt: ToIncludeAt = {};

    for (let i = 0; i < 6; i++) {
        const guess = getNextGuess(
            toExclude,
            toIncludeNotAt,
            toIncludeAt,
            i,
        );

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
    console.log(squares);

    await browser.close();
};

main();
