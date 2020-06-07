it('should pass', async () => {
  await page.goto('http://localhost:3100');
  const result = await page.$eval('#e2e', (elm) => elm.textContent);

  expect(result).toEqual('E2E tests are working!');
});
