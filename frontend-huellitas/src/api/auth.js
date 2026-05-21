const TOKEN_KEY = 'token';

export function getToken() {
  const t = localStorage.getItem(TOKEN_KEY);
  return t?.trim() || null;
}

export function saveToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token.trim());
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/** Si la API responde 401, limpia sesión y devuelve true */
export function esSesionInvalida(respuesta, data) {
  if (respuesta.status !== 401) return false;
  const msg = (data?.mensaje || '').toLowerCase();
  return msg.includes('token') || msg.includes('sesión') || msg.includes('sesion');
}
