import https from 'https';

export function isTruthy<T>(x: T | undefined | null): x is T {
  return x !== undefined && x !== null;
}

export function requestHttps(url: string, params: Record<string, any>) {
  const queryParams = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(`${value}`)}`)
    .join('&');

  return new Promise((resolve, reject) => {
    const req = https.request(`${url}?${queryParams}`, (res) => {
      if (
        (res.statusCode && res.statusCode < 200) ||
        (res.statusCode && res.statusCode >= 300)
      ) {
        return reject(`Status code: ${res.statusCode}`);
      }

      res.on('end', resolve);
    });

    req.on('error', reject);

    req.end();
  });
}
