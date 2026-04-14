const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY

const SUBJECT_KEYWORDS: Record<string, string> = {
  math: 'mathematics numbers',
  hebrew: 'books reading israel',
  finance: 'coins money savings',
  torah: 'jerusalem synagogue',
  english: 'books language learning',
  ai_tech: 'technology robot artificial intelligence',
  spatial: 'geometry shapes architecture',
}

const FALLBACKS: Record<string, string> = {
  math: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600',
  hebrew: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600',
  finance: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600',
  torah: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=600',
  english: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600',
  ai_tech: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600',
  spatial: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
}

function getFallbackImage(subject: string): string {
  return FALLBACKS[subject] || FALLBACKS.math
}

export async function getImageForLesson(
  imageKeyword: string,
  subject: string
): Promise<string | null> {
  if (!UNSPLASH_KEY) return getFallbackImage(subject)

  try {
    const query = imageKeyword.trim() || SUBJECT_KEYWORDS[subject] || subject
    const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${UNSPLASH_KEY}`

    const res = await fetch(url)
    if (!res.ok) return getFallbackImage(subject)

    const data = await res.json() as { urls?: { regular?: string } }
    return data.urls?.regular || getFallbackImage(subject)
  } catch {
    return getFallbackImage(subject)
  }
}
