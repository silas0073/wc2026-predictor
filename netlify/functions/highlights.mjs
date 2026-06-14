// Searches YouTube for WC2026 match highlight clips (no API key needed)
// Returns multiple candidates so frontend can try each until one embeds successfully.

// Known channels that disallow embedding
const BLOCKED_CHANNELS = [
  'fifa', 'fifatv', 'fifa tv',
  'fox sports', 'foxsports',
  'telemundo', 'telemundo deportes',
  'tnt sports', 'sky sports',
  'bein sports', 'beinsports',
  'sbs', 'sbs australia',
  'optus sport',
  'espn', 'espnfc',
  'cbs sports', 'cbssports',
  'univision', 'univisión',
  'dazn',
]

function isBlocked(channel) {
  const c = (channel || '').toLowerCase().replace(/\s+/g, '')
  return BLOCKED_CHANNELS.some(b => c === b.replace(/\s+/g,'') || c.startsWith(b.replace(/\s+/g,'')))
}

async function searchYouTube(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  })
  const html = await res.text()

  const match = html.match(/var ytInitialData\s*=\s*(\{.+?\});\s*<\/script>/)
  if (!match) return []

  let data
  try { data = JSON.parse(match[1]) } catch { return [] }

  const contents =
    data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
      ?.sectionListRenderer?.contents ?? []

  const results = []
  for (const section of contents) {
    const items = section?.itemSectionRenderer?.contents ?? []
    for (const item of items) {
      const vr = item?.videoRenderer
      if (!vr?.videoId) continue
      const title = vr.title?.runs?.[0]?.text ?? ''
      const channel = vr.ownerText?.runs?.[0]?.text ?? vr.longBylineText?.runs?.[0]?.text ?? ''
      const duration = vr.lengthText?.simpleText ?? ''
      if (isBlocked(channel)) continue
      const parts = duration.split(':').map(Number)
      const totalMin = parts.length === 3
        ? parts[0] * 60 + parts[1] + parts[2] / 60
        : (parts[0] || 0) + (parts[1] || 0) / 60
      if (totalMin < 1 || totalMin > 15) continue
      results.push({ videoId: vr.videoId, title, duration, channel })
      if (results.length >= 5) return results  // return up to 5 candidates
    }
  }
  return results
}

export default async function handler(req) {
  const url = new URL(req.url)
  const home = url.searchParams.get('home') || ''
  const away = url.searchParams.get('away') || ''

  if (!home || !away) {
    return new Response(JSON.stringify({ error: 'Missing params' }), { status: 400 })
  }

  const queries = [
    `${home} vs ${away} World Cup 2026 goals highlights`,
    `${home} ${away} WC 2026 highlight`,
  ]

  const seen = new Set()
  const candidates = []
  for (const q of queries) {
    const results = await searchYouTube(q)
    for (const r of results) {
      if (!seen.has(r.videoId)) {
        seen.add(r.videoId)
        candidates.push(r)
      }
    }
    if (candidates.length >= 5) break
  }

  return new Response(JSON.stringify({ candidates }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
  })
}

export const config = { path: '/api/highlights' }
