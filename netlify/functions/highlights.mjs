// Searches YouTube for WC2026 match highlight clips (no API key needed)
// Scrapes the initial data JSON that YouTube embeds in every search page.

async function searchYouTube(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIYAQ%3D%3D` // sp = Shorts filter removed, sorted by relevance
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

  // Walk the contents tree to find videoRenderer items
  const contents =
    data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
      ?.sectionListRenderer?.contents ?? []

  for (const section of contents) {
    const items = section?.itemSectionRenderer?.contents ?? []
    for (const item of items) {
      const vr = item?.videoRenderer
      if (!vr?.videoId) continue
      const title = vr.title?.runs?.[0]?.text ?? ''
      const duration = vr.lengthText?.simpleText ?? ''
      // Skip Shorts (under 1 min) and very long videos (over 15 min)
      const [min, sec] = duration.split(':').map(Number)
      const totalMin = (min || 0) + (sec || 0) / 60
      if (totalMin < 1 || totalMin > 15) continue
      return { videoId: vr.videoId, title, duration }
    }
  }
  return null
}

export default async function handler(req) {
  const url = new URL(req.url)
  const home = url.searchParams.get('home') || ''
  const away = url.searchParams.get('away') || ''
  const date = url.searchParams.get('date') || ''

  if (!home || !away) {
    return new Response(JSON.stringify({ error: 'Missing params' }), { status: 400 })
  }

  // Try a few query variants, pick first hit
  const queries = [
    `${home} vs ${away} FIFA World Cup 2026 goals highlights`,
    `${home} ${away} World Cup 2026 highlight`,
    `${home} vs ${away} WC2026 goals`,
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
      'Cache-Control': 'public, max-age=3600', // cache 1hr per match
    },
  })
}

export const config = { path: '/api/highlights' }
