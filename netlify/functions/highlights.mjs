// Searches YouTube for WC2026 match highlight clips (no API key needed)
// Scrapes the initial data JSON that YouTube embeds in every search page.

// Channels known to block embeds
const BLOCKED_CHANNELS = [
  'fifa', 'fifatv', 'fifa tv',
  'fox sports', 'foxsports',
  'telemundo deportes', 'telemundo',
  'tnt sports', 'sky sports',
  'bein sports', 'beinsports',
  'sbs', 'sbs australia',
  'optus sport',
]

function isBlocked(channel) {
  const c = (channel || '').toLowerCase()
  return BLOCKED_CHANNELS.some(b => c.includes(b))
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

  // YouTube embeds all search results in a var ytInitialData = {...}; block
  const match = html.match(/var ytInitialData\s*=\s*(\{.+?\});\s*<\/script>/)
  if (!match) return null

  let data
  try { data = JSON.parse(match[1]) } catch { return null }

  const contents =
    data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
      ?.sectionListRenderer?.contents ?? []

  for (const section of contents) {
    const items = section?.itemSectionRenderer?.contents ?? []
    for (const item of items) {
      const vr = item?.videoRenderer
      if (!vr?.videoId) continue
      const title = vr.title?.runs?.[0]?.text ?? ''
      const channel = vr.ownerText?.runs?.[0]?.text ?? vr.longBylineText?.runs?.[0]?.text ?? ''
      const duration = vr.lengthText?.simpleText ?? ''
      // Skip blocked channels (FIFA, broadcasters)
      if (isBlocked(channel)) continue
      // Skip Shorts (under 1 min) and very long videos (over 15 min)
      const parts = duration.split(':').map(Number)
      const totalMin = parts.length === 3
        ? parts[0] * 60 + parts[1] + parts[2] / 60  // h:mm:ss
        : (parts[0] || 0) + (parts[1] || 0) / 60    // mm:ss
      if (totalMin < 1 || totalMin > 15) continue
      return { videoId: vr.videoId, title, duration, channel }
    }
  }
  return null
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
    `${home} vs ${away} 2026 goals`,
  ]

  let result = null
  for (const q of queries) {
    result = await searchYouTube(q)
    if (result) break
  }

  return new Response(JSON.stringify(result ?? { videoId: null }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

export const config = { path: '/api/highlights' }
