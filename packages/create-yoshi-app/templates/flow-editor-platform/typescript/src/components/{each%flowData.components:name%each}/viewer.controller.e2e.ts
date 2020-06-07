import eventually from 'wix-eventually';
import { viewerUrl } from '../../../dev/sites';

describe('Viewer App', () => {
  it('should change text on button click', async () => {
    await page.goto(viewerUrl);
    await page.waitForSelector('h2');

    const widgetText = await page.$eval('h2', (node) =>
      node?.textContent?.toLowerCase(),
    );

    expect(widgetText).toEqual('click the button');

    await page.click('button');

    eventually(async () => {
      const widgetTextAfterClick = await page.$eval('h2', (node) =>
        node?.textContent?.toLowerCase(),
      );
      expect(widgetTextAfterClick).toEqual('you clicked the button');
    });
  });
});
