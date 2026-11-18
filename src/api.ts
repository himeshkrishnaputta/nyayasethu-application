export const API_BASE_URL = "http://192.168.1.4:3000";

export const API_WS_URL = "ws://192.168.1.4:3000";

export const apiFetch = (path: string, options?: RequestInit) => {
  return fetch(`${API_BASE_URL}${path}`, options);
};