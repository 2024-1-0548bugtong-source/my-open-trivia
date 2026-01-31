// src/utils/htmlDecode.ts
export function htmlDecode(input: string): string {
  const parser = new DOMParser();
  const decodedString = parser.parseFromString(input, "text/html").body.textContent;
  return decodedString || input;
}
