import { generateSprint } from './api'
import type { ChildProfile } from '../types'

interface SprintResult {
  sprint: any
  sprint_id: string | null
}

let prefetchedSprint: SprintResult | null = null
let isPrefetching = false
let prefetchPromise: Promise<SprintResult | null> | null = null

export const PrefetchService = {
  // Start fetching next sprint in background — call on LessonScreen mount
  async start(child: ChildProfile) {
    if (isPrefetching || prefetchedSprint) return
    isPrefetching = true
    console.log('🔄 Prefetching next sprint...')

    prefetchPromise = generateSprint(child)
      .then(result => {
        prefetchedSprint = result
        isPrefetching = false
        console.log('✅ Next sprint ready!')
        return result
      })
      .catch(err => {
        isPrefetching = false
        prefetchPromise = null
        console.warn('⚠️ Prefetch failed silently:', err)
        return null
      })
  },

  // Get the prefetched sprint — instant if ready, waits if still loading, fetches fresh as fallback
  async get(child: ChildProfile): Promise<SprintResult> {
    if (prefetchedSprint) {
      const sprint = prefetchedSprint
      prefetchedSprint = null
      isPrefetching = false
      console.log('⚡ Instant sprint from cache!')
      return sprint
    }
    if (prefetchPromise) {
      console.log('⏳ Waiting for prefetch to complete...')
      const result = await prefetchPromise
      prefetchedSprint = null
      prefetchPromise = null
      if (result) return result
    }
    console.log('🔃 Prefetch missed — fetching now...')
    return generateSprint(child)
  },

  // Clear state — call when navigating home
  clear() {
    prefetchedSprint = null
    isPrefetching = false
    prefetchPromise = null
    console.log('🧹 Prefetch cleared')
  },

  isReady(): boolean {
    return prefetchedSprint !== null
  },

  isLoading(): boolean {
    return isPrefetching
  },
}
