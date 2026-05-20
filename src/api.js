// TODO: switch between dev/prod via env or a config toggle
// In dev, point to your machine's LAN IP (phone can't reach localhost)
// e.g. http://192.168.x.x:5000
// In prod, point to the deployed server URL
const BASE_URL = "http://localhost:5000";

// TODO: React Native doesn't send cookies automatically — Flask session cookies
// won't persist between requests. Options:
//   a) Use expo-secure-store to manually persist and send the session cookie
//   b) Switch the backend to token-based auth (JWT) for the mobile client
//   c) Use a shared cookie jar library (react-native-cookies)
// Pick an approach before implementing auth.

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    credentials: "include", // works on web, limited on native — see TODO above
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}
