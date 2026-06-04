// Progress utilities
export * from './progress'

// Slug utilities (from types)
export { moduleSlug, lessonSlug, parseModuleSlug, parseLessonSlug } from '@/types'

// Supabase clients
export { createClient as createBrowserClient } from './supabase/client'
export { createClient, createServiceClient } from './supabase/server'
