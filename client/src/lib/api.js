const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "");

const normalizePath = (path) => {
  if (!path) {
    return "";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

export const getApiUrl = (path) => normalizePath(path);

export const getImageUrl = (path) => normalizePath(path);

export const getAuthHeaders = (token, extraHeaders = {}) => ({
  ...extraHeaders,
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});
