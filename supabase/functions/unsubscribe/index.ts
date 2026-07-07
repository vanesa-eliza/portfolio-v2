// One-click unsubscribe. The link in every newsletter email points straight
// here with the subscriber's token, so it works without any login or frontend
// page. Removes the row using the service-role key and returns a small HTML page.
//
// Deploy:  supabase functions deploy unsubscribe --no-verify-jwt
// (Must be public — recipients are not logged in.)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SITE_URL = (Deno.env.get('SITE_URL') ?? '').replace(/\/$/, '')

function page(message: string) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Unsubscribe</title>
  </head>
  <body style="margin:0;background:#0a0a0a;color:#f0ede8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;">
    <div style="text-align:center;max-width:420px;padding:2rem;">
      <p style="font-size:1.125rem;line-height:1.6;">${message}</p>
      ${SITE_URL ? `<a href="${SITE_URL}" style="color:#8b2252;text-decoration:none;font-size:0.95rem;">← Back to the site</a>` : ''}
    </div>
  </body>
</html>`
}

function html(body: string, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

Deno.serve(async (req) => {
  const token = new URL(req.url).searchParams.get('token')
  if (!token) return html(page('Invalid unsubscribe link.'), 400)

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const { error } = await admin.from('subscribers').delete().eq('token', token)

  if (error) return html(page('Something went wrong. Please try again later.'), 500)
  return html(page("You've been unsubscribed. You won't receive any more emails."))
})
