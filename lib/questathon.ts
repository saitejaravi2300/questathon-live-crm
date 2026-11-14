const BASE = process.env.QUESTATHON_API || "https://questathon.aihackerscollective.com/api/public/v1";

export async function questathonGet(path: string) {
  const token = process.env.AQ_TOKEN;
  if (!token) throw new Error("AQ_TOKEN is missing. Add it to the server environment.");
  const response = await fetch(`${BASE}${path}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store"
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Questathon API ${response.status}: ${body.slice(0, 500)}`);
  try { return JSON.parse(body); } catch { return body; }
}

export async function questathonPost(path: string, payload: unknown) {
  const token = process.env.AQ_TOKEN;
  if (!token) throw new Error("AQ_TOKEN is missing. Add it to the server environment.");
  const response = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Questathon API ${response.status}: ${body.slice(0, 500)}`);
  try { return JSON.parse(body); } catch { return body; }
}
