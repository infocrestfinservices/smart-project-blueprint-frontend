/**
 * LLM Service
 *
 * Calls the local backend proxy to keep the API key server-side.
 */

// If your frontend and backend run on different ports, set the base URL.
// In dev, the backend runs on port 8000.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
const BACKEND_API_URL = `${BACKEND_URL}/ai/invoke`;

/**
 * Invoke an LLM with a prompt and return the text response.
 * The /ai/invoke endpoint requires authentication, so we attach the JWT.
 * @param {{ prompt: string, model?: string }} params
 * @returns {Promise<string>} The text response from the LLM
 */
export async function invokeLLM({ prompt, model = "claude_sonnet_4_6" }) {
  const token = localStorage.getItem("rc_auth_token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(BACKEND_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      prompt: prompt,
      model: model,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.detail ||
      `Backend API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  
  // The backend responds with { "text": "..." }
  return data.text;
}
