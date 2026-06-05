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

  // Handle reorder
  if (body.reorder) {
    const { data: current } = (await supabase.from('modules').select('order_index').eq('id', id).single()) as { data: { order_index: number } | null }
    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const newIndex = body.reorder === 'up' ? current.order_index - 1 : current.order_index + 1
    const { data: swap } = (await supabase.from('modules').select('id').eq('order_index', newIndex).single()) as { data: { id: string } | null }
    if (swap) {
      await supabase.from('modules').update({ order_index: current.order_index }).eq('id', swap.id)
    }
    await supabase.from('modules').update({ order_index: newIndex }).eq('id', id)
    return NextResponse.json({ ok: true })
  }

  const updates: Record<string, unknown> = {}
  if (body.title !== undefined) updates.title = body.title
  if (body.description !== undefined) updates.description = body.description
  if (body.is_published !== undefined) updates.is_published = body.is_published

  const { error } = await supabase.from('modules').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await assertAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const supabase = createServiceClient() as unknown as SupabaseClient

  // Delete lessons first
  await supabase.from('lessons').delete().eq('module_id', id)
  const { error } = await supabase.from('modules').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
