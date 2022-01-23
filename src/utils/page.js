const playwright = require('playwright');
const WORDLE_URL = 'https://www.powerlanguage.co.uk/wordle/';

const startGame = async () => {
    const browser = await playwright.chromium.launch({ headless: false });
    const context = await browser.newContext();
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    const page = await context.newPage();
    await page.goto(WORDLE_URL);
    await page.click('.close-icon');
    return { page, browser };
};

const enterGuess = async (page, guess) => {
    await page.type('#game', guess);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
};

const getResults = async (page, i) => {
    const rows = await page.$$('game-row');
    const tiles = await rows[i].$$('game-tile');
    return Promise.all(tiles.map(t => t.getAttribute('evaluation')));
};

const copySquares = async (page) => {
    await page.click('#share-button');
    return page.evaluate(() => navigator.clipboard.readText());
};

module.exports = {
    startGame,
    enterGuess,
    getResults,
    copySquares,
};
