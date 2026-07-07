// Shared helpers for the edge functions.

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ─────────────────────────────────────────────────────────────────────────────
// Email provider seam.
//
// This is the ONLY provider-specific code in the project. It currently targets
// Resend (https://resend.com). To switch to SendGrid, Mailgun, Postmark, etc.,
// replace the body of sendEmail with that provider's API call — nothing else in
// the codebase needs to change. Set these as Supabase function secrets:
//   RESEND_API_KEY   your provider API key
//   FROM_EMAIL       a verified sender, e.g. "Vanesa <hello@yourdomain.com>"
// ─────────────────────────────────────────────────────────────────────────────
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('FROM_EMAIL')
  if (!apiKey || !from) throw new Error('RESEND_API_KEY and FROM_EMAIL must be set as function secrets')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  })

  if (!res.ok) {
    throw new Error(`Email send failed (${res.status}): ${await res.text()}`)
  }
  return res.json()
}
