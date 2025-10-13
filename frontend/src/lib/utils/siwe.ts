export function generateSiweMessage(nonce: string): string {
  return `Sign this message to authenticate with The Guild.\n\nNonce: ${nonce}`;
}