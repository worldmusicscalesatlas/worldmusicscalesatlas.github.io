const { test, expect } = require('@playwright/test');
for (const viewport of [{width:1440,height:900},{width:390,height:844},{width:844,height:390}]) {
  test('Atlas browser smoke test '+viewport.width+'x'+viewport.height, async ({page}) => {
    await page.setViewportSize(viewport);
    const errors=[];
    page.on('pageerror', error => errors.push(error.message));
    const response=await page.goto('http://127.0.0.1:4173/');
    expect(response.status()).toBe(200);
    await expect(page.locator('#earth')).toBeVisible();
    await expect(page.locator('#region option').nth(1)).toBeAttached();
    await page.goto('http://127.0.0.1:4173/?model=CN-01');
    await expect(page.locator('#detail')).toBeVisible();
    await expect(page.locator('#title')).toContainText('Gong');
    await expect(page.locator('#panels')).toBeVisible();
    await page.locator('#info').click();
    await expect(page.locator('#explanation')).toBeVisible();
    await page.locator('#explanation .close').click();
    await expect(page.locator('#explanation')).toBeHidden();
    await page.locator('#compare').click();
    await expect(page.locator('#compare-panel')).toBeVisible();
    await expect(page.locator('#comparison option').nth(1)).toBeAttached();
    expect(errors).toEqual([]);
  });
}
