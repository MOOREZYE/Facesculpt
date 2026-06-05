import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase.from('users').select('role').eq('id', user.id).single() as { data: { role: string } | null }
  return data?.role === 'admin'
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await assertAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const supabase = createServiceClient() as unknown as SupabaseClient

  // Handle reorder within module
  if (body.reorder) {
    const { data: current } = (await supabase
      .from('lessons')
      .select('order_index, module_id')
      .eq('id', id)
      .single()) as { data: { order_index: number; module_id: string } | null }
    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const newIndex = body.reorder === 'up' ? current.order_index - 1 : current.order_index + 1
    const { data: swap } = (await supabase
      .from('lessons')
      .select('id')
      .eq('module_id', current.module_id)
      .eq('order_index', newIndex)
      .single()) as { data: { id: string } | null }

    if (swap) {
      await supabase.from('lessons').update({ order_index: current.order_index }).eq('id', swap.id)
    }
    await supabase.from('lessons').update({ order_index: newIndex }).eq('id', id)
    return NextResponse.json({ ok: true })
  }

  const updates: Record<string, unknown> = {}
  if (body.title !== undefined) updates.title = body.title
  if (body.type !== undefined) updates.type = body.type
  if (body.video_url !== undefined) updates.video_url = body.video_url
  if (body.content_html !== undefined) updates.content_html = body.content_html
  if (body.is_published !== undefined) updates.is_published = body.is_published

  const { error } = await supabase.from('lessons').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await assertAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const supabase = createServiceClient() as unknown as SupabaseClient
  const { error } = await supabase.from('lessons').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
