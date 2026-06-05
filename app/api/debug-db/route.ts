import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: 'env vars missing', url: !!url, key: !!key });
  }

  const client = createClient(url, key);

  // Test insert
  const testUrl = `https://debug-test.com/${Date.now()}`;
  const { data: insertData, error: insertError } = await client
    .from('articles')
    .insert({ title: 'Debug test', url: testUrl, source: 'DEBUG' })
    .select('id');

  // Test select
  const { count, error: selectError } = await client
    .from('articles')
    .select('*', { count: 'exact', head: true });

  // Cleanup
  if (insertData?.[0]?.id) {
    await client.from('articles').delete().eq('id', insertData[0].id);
  }

  return NextResponse.json({
    envOk: true,
    insert: { data: insertData, error: insertError?.message, code: insertError?.code },
    select: { count, error: selectError?.message },
  });
}
