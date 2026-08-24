const TOKEN_KEY = 'admin_auth_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** `remember` controls persistence: localStorage survives browser restarts, sessionStorage clears on tab/browser close. */
export function setToken(token: string, remember: boolean): void {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}
