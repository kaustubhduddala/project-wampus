export function mergeRequestHeaders(requestHeaders) {
  const merged = new Headers({
    'Content-Type': 'application/json',
  });

  if (!requestHeaders) {
    return merged;
  }

  const provided = new Headers(requestHeaders);
  provided.forEach((value, key) => {
    merged.set(key, value);
  });

  return merged;
}
