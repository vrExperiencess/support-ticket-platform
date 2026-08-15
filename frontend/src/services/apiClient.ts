const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000/api";

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    localStorage.getItem(
      "support_access_token",
    );

  const headers = new Headers(
    options.headers,
  );

  headers.set(
    "Content-Type",
    "application/json",
  );

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
    },
  );

  if (!response.ok) {
    let message =
      "An unexpected error occurred.";

    try {
      const body = await response.json();

      message =
        body.message ?? message;
    } catch {
      // Ignore invalid JSON
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}