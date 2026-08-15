const API_URL = (
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000/api"
).replace(/\/$/, "");

/**
 * Extrae un mensaje entendible de los errores enviados por NestJS.
 *
 * class-validator puede devolver message como:
 *
 * message: "Unauthorized"
 *
 * o:
 *
 * message: [
 *   "title must be longer than...",
 *   "clientId must be a UUID"
 * ]
 */
function getApiErrorMessage(
  body: unknown,
): string {
  if (
    typeof body !== "object" ||
    body === null
  ) {
    return "An unexpected error occurred.";
  }

  const apiBody = body as {
    message?: string | string[];
    error?: string;
  };

  if (
    Array.isArray(
      apiBody.message,
    )
  ) {
    return apiBody.message.join(
      " ",
    );
  }

  if (
    typeof apiBody.message ===
    "string"
  ) {
    return apiBody.message;
  }

  if (
    typeof apiBody.error ===
    "string"
  ) {
    return apiBody.error;
  }

  return "An unexpected error occurred.";
}

/**
 * Cliente HTTP central de la aplicación.
 *
 * Se encarga de:
 * - agregar JWT automáticamente;
 * - serializar headers;
 * - interpretar errores del backend;
 * - manejar respuestas 204;
 * - devolver JSON tipado.
 */
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

  if (
    options.body &&
    !headers.has(
      "Content-Type",
    )
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

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

  /**
   * DELETE exitoso:
   *
   * HTTP 204
   *
   * No existe JSON que interpretar.
   */
  if (
    response.status === 204
  ) {
    return undefined as T;
  }

  const contentType =
    response.headers.get(
      "content-type",
    );

  let body: unknown = null;

  if (
    contentType?.includes(
      "application/json",
    )
  ) {
    body =
      await response.json();
  } else {
    const text =
      await response.text();

    body =
      text || null;
  }

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        body,
      ),
    );
  }

  return body as T;
}