const DAKINIS_TOKEN_KEY = "token";

function dakinisSetAuthToken(token) {
  localStorage.setItem(DAKINIS_TOKEN_KEY, String(token || "").trim());
}

function dakinisGetAuthToken() {
  return localStorage.getItem(DAKINIS_TOKEN_KEY) || "";
}

export function dakinisClearAuthToken() {
  localStorage.removeItem(DAKINIS_TOKEN_KEY);
}
