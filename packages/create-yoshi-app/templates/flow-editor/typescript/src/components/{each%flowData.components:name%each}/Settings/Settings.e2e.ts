describe('Settings Panel', () => {
  it('should display a section', async () => {
    await page.goto('https://localhost:3100/settings/{%name%}');

    expect(await page.$$eval('section', (sections) => sections.length)).toBe(1);
  });
});
