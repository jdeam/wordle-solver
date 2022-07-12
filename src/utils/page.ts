import playwright, { Page, Browser } from 'playwright';

const WORDLE_URL = 'https://www.nytimes.com/games/wordle/index.html';

export const startGame = async (): Promise<{ page: Page, browser: Browser }> => {
    const browser = await playwright.chromium.launch({ headless: false });
    const context = await browser.newContext();
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    const page = await context.newPage();
    await page.goto(WORDLE_URL);
    await page.click('[data-testid="icon-close"]');
    return { page, browser };
};

type Result = 'correct' | 'present' | 'absent';

export const enterGuess = async (
    page: Page, 
    guess: string, 
    i: number,
):  Promise<Result[]> => {
    await page.type('[class^="Board-module_board__"]', guess);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    const rows = await page.$$('[class^="Row-module_row__"]');
    const tiles = await rows[i].$$('[class^="Tile-module_tile__"]');
    return Promise.all(tiles.map(t => t.getAttribute('data-state') as Promise<Result>));
};

export const copySquares = async (page: Page): Promise<string> => {
    await page.click('#share-button');
    return page.evaluate(() => navigator.clipboard.readText());
};
