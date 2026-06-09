// Cookie-aware fetch for Flask session auth.
// React Native's fetch does not maintain a cookie jar, so we manually
// extract Set-Cookie on login and inject Cookie on every request.
import * as SecureStore from 'expo-secure-store';
import { BASE_URL, COOKIE_KEY } from './config';

export async function getStoredCookie(): Promise<string | null> {
  return SecureStore.getItemAsync(COOKIE_KEY);
}

export async function storeSessionCookie(setCookieHeader: string): Promise<void> {
  // Flask sends: session=<value>; HttpOnly; Path=/; SameSite=Lax
  const match = setCookieHeader.match(/session=([^;]+)/);
  if (match?.[1]) {
    await SecureStore.setItemAsync(COOKIE_KEY, match[1]);
  }
}

export async function clearSessionCookie(): Promise<void> {
  await SecureStore.deleteItemAsync(COOKIE_KEY);
}

export type ApiResponse<T = unknown> = {
  ok: boolean;
  status: number;
  data: T;
};

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const cookie = await getStoredCookie();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (cookie) headers['Cookie'] = `session=${cookie}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Capture new session cookie if server rotates it
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) await storeSessionCookie(setCookie);

  let data: T;
  try {
    data = (await res.json()) as T;
  } catch {
    data = {} as T;
  }

  return { ok: res.ok, status: res.status, data };
}
