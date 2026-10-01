export function parseJwtPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
    const value: unknown = JSON.parse(atob(padded));
    if (!value || typeof value !== 'object' || !('exp' in value)) return null;
    return typeof value.exp === 'number' ? { exp: value.exp } : null;
  } catch {
    return null;
  }
}
