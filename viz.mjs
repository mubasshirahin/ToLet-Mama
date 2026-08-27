export default async function run(page) {
  await page.evaluate(() => window.scrollTo(0,0));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'C:/ToLet Mama/shot-hero.png' });
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'C:/ToLet Mama/shot-showcase.png' });
  return { done: true };
}
