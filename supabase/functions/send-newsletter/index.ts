// Sends a published post to every confirmed subscriber.
//
// Invoked from the admin post editor (requires a logged-in user). Renders the
// post's markdown body to HTML, emails it to each subscriber with a personal
// unsubscribe link, then stamps posts.newsletter_sent_at so it can't be sent
// twice by accident.
//
// Deploy:  supabase functions deploy send-newsletter
// (JWT verification stays ON — only authenticated callers may send.)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { marked } from 'https://esm.sh/marked@12'
import { corsHeaders, sendEmail } from '../_shared/email.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
// Public site URL, e.g. https://vanesachetruscaportfolio.vercel.app
const SITE_URL = (Deno.env.get('SITE_URL') ?? '').replace(/\/$/, '')

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function emailTemplate({ title, contentHtml, postUrl, unsubscribeUrl }: {
  title: string; contentHtml: string; postUrl: string; unsubscribeUrl: string
}) {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f4f2ef;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ef;padding:32px 0;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <tr><td style="padding:40px 40px 8px;">
            <h1 style="margin:0 0 24px;font-size:26px;line-height:1.25;color:#1a1a1a;font-weight:600;">${escapeHtml(title)}</h1>
            <div style="font-size:16px;line-height:1.7;color:#333333;">${contentHtml}</div>
          </td></tr>
          <tr><td style="padding:24px 40px 40px;">
            <a href="${postUrl}" style="display:inline-block;background:#8b2252;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:4px;font-size:15px;">Read on the site →</a>
          </td></tr>
          <tr><td style="padding:24px 40px;border-top:1px solid #ececec;font-size:13px;color:#888888;line-height:1.6;">
            You're receiving this because you subscribed to Vanesa Chetrusca's writing.<br />
            <a href="${unsubscribeUrl}" style="color:#888888;text-decoration:underline;">Unsubscribe</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  // Require a real authenticated user (the admin), not just the anon key.
  const authHeader = req.headers.get('Authorization') ?? ''
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return json({ error: 'Unauthorized' }, 401)

  let postId: string | undefined
  let force = false
  try {
    const body = await req.json()
    postId = body.postId
    force = !!body.force
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }
  if (!postId) return json({ error: 'postId is required' }, 400)

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  const { data: post, error: postErr } = await admin
    .from('posts')
    .select('id, slug, title, body, published, newsletter_sent_at')
    .eq('id', postId)
    .single()

  if (postErr || !post) return json({ error: 'Post not found' }, 404)
  if (!post.published) return json({ error: 'Post is not published yet' }, 400)
  if (post.newsletter_sent_at && !force) {
    return json({ error: 'already_sent', sentAt: post.newsletter_sent_at }, 409)
  }

  const { data: subscribers, error: subErr } = await admin
    .from('subscribers')
    .select('email, token')
    .eq('confirmed', true)

  if (subErr) return json({ error: subErr.message }, 500)
  if (!subscribers || subscribers.length === 0) return json({ error: 'No subscribers yet', sent: 0 }, 200)

  const contentHtml = marked.parse(post.body) as string
  const postUrl = `${SITE_URL}/writing/${post.slug}`

  let sent = 0
  const failures: string[] = []
  for (const sub of subscribers) {
    const unsubscribeUrl = `${SUPABASE_URL}/functions/v1/unsubscribe?token=${sub.token}`
    try {
      await sendEmail({
        to: sub.email,
        subject: post.title,
        html: emailTemplate({ title: post.title, contentHtml, postUrl, unsubscribeUrl }),
      })
      sent++
    } catch (e) {
      failures.push(`${sub.email}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // Mark as sent so the admin button can guard against re-sends.
  await admin.from('posts').update({ newsletter_sent_at: new Date().toISOString() }).eq('id', post.id)

  return json({ sent, total: subscribers.length, failures })
})
