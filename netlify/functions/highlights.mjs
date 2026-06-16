// Searches YouTube for WC2026 match highlights — no API key needed.
// Scrapes the ytInitialData JSON embedded in YouTube search results pages,
// same approach proven on the endtrump.xyz project.
// Returns up to 5 candidate video IDs (frontend cycles through if one is blocked).

const BLOCKED_CHANNELS = ['fifatv', 'fifa tv', 'fifa']

async function searchYouTube(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  })
  const html = await res.text()

  // YouTube embeds all search data in var ytInitialData = {...};
  const match = html.match(/var ytInitialData\s*=\s*(\{.+?\});\s*<\/script>/)
  if (!match) return []

  let data
  try { data = JSON.parse(match[1]) } catch { return [] }

  const contents =
    data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
      ?.sectionListRenderer?.contents ?? []

  const videos = []
  for (const section of contents) {
    const items = section?.itemSectionRenderer?.contents ?? []
    for (const item of items) {
      const vr = item?.videoRenderer
      if (!vr?.videoId) continue
      const title = vr.title?.runs?.[0]?.text ?? ''
      const channel = (vr.ownerText?.runs?.[0]?.text ?? '').toLowerCase()
      const thumbnail = vr.thumbnail?.thumbnails?.slice(-1)[0]?.url ?? null

      // Skip FIFA's own channel (often blocked for embedding)
      if (BLOCKED_CHANNELS.some(b => channel.includes(b))) continue
      // Prefer highlight/recap videos
      if (!/highlight|recap|goal|result/i.test(title)) continue

      videos.push({ videoId: vr.videoId, title, channel: vr.ownerText?.runs?.[0]?.text, thumbnail })
      if (videos.length >= 5) break
    }
    if (videos.length >= 5) break
  }
  return videos
}

export default async (req) => {
  try {
    const url = new URL(req.url)
    const home = url.searchParams.get('home') || ''
    const away = url.searchParams.get('away') || ''

    if (!home || !away) {
      return new Response(JSON.stringify({ error: 'Missing home/away params' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      })
    }

    // Try SBS-specific search first
    const sbsQuery = `${home} ${away} highlights World Cup 2026 SBS Sport`
    let videos = await searchYouTube(sbsQuery)

    // Fall back to general search if nothing found
    if (videos.length === 0) {
      const genQuery = `${home} ${away} highlights World Cup 2026`
      videos = await searchYouTube(genQuery)
    }

    if (videos.length > 0) {
      return new Response(JSON.stringify({
        videoId: videos[0].videoId,
        videoUrl: `https://www.youtube.com/watch?v=${videos[0].videoId}`,
        title: videos[0].title,
        thumbnail: videos[0].thumbnail,
        channel: videos[0].channel,
        candidates: videos.map(v => v.videoId),
        source: 'scrape'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' }
      })
    }

    // Final fallback — search URL
    const fallbackQ = encodeURIComponent(`${home} ${away} highlights World Cup 2026 SBS Sport`)
    return new Response(JSON.stringify({
      searchUrl: `https://www.youtube.com/results?search_query=${fallbackQ}`,
      fallback: true
    }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, videoId: null }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = { path: '/api/highlights' }
