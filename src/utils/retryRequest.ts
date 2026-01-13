// src/utils/retryRequest.ts
export async function retryRequest<T>(
  fn: () => Promise<T>,
  retries = 1
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    return retryRequest(fn, retries - 1);
  }
}
