// ============================
// Zid Webhook: Receives purchase events from Zid Store
// Generates HOST activation codes upon successful purchase.
// REQUIRES HMAC-SHA256 signature verification via ZID_WEBHOOK_SECRET.
// ============================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-zid-signature, webhook-signature',
};

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ZID-';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function verifySignature(rawBody: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
  const expected = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  // Accept either raw hex or "sha256=<hex>" forms
  const provided = signature.replace(/^sha256=/, '').toLowerCase().trim();
  return timingSafeEqual(expected, provided);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get('ZID_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('ZID_WEBHOOK_SECRET is not configured');
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Read raw body for signature verification (must match exactly what Zid signed)
    const rawBody = await req.text();

    const signature =
      req.headers.get('x-zid-signature') ||
      req.headers.get('webhook-signature') ||
      req.headers.get('x-signature');

    const ok = await verifySignature(rawBody, signature, webhookSecret);
    if (!ok) {
      console.warn('Rejected webhook: invalid or missing signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { event, order } = body;

    if (event !== 'order.completed' && event !== 'order.paid') {
      return new Response(JSON.stringify({ message: 'Event ignored' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const buyerEmail = order?.customer?.email;
    const code = generateCode();

    // Insert HOST code with 3 uses
    const { error } = await supabase.from('activation_codes').insert({
      code,
      uses_remaining: 3,
      code_type: 'HOST',
      linked_email: buyerEmail || null,
    });

    if (error) {
      console.error('Failed to create activation code:', error);
      return new Response(JSON.stringify({ error: 'Failed to create code' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Created HOST code for ${buyerEmail ?? 'unknown buyer'}`);

    return new Response(JSON.stringify({ success: true, code }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
