// Searches SBS Sport AU YouTube channel for World Cup 2026 highlight videos.
// Uses YouTube's public search without an API key by scraping the search
// results page (no embed, just returns a YouTube watch URL).
//
// Query pattern: "{HomeTeam} v {AwayTeam} Highlights FIFA World Cup 2026"
// on channel: @SBSSportau (channel ID: UCzb3nMkj5hkHbbSsidOUAjQ)

const SBS_CHANNEL_ID = 'UCzb3nMkj5hkHbbSsidOUAjQ'

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

    // YouTube search URL — returns HTML we parse for video IDs
    const query = encodeURIComponent(`${home} v ${away} Highlights FIFA World Cup 2026`)
    const searchUrl = `https://www.youtube.com/results?search_query=${query}+channel%3A${SBS_CHANNEL_ID}`

    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)',
        'Accept-Language': 'en-AU,en;q=0.9',
      }
    })
    const html = await res.text()

    // Extract video IDs from the JSON embedded in the page
    // YouTube embeds initial data as: var ytInitialData = {...};
    const match = html.match(/var ytInitialData\s*=\s*(\{.+?\});\s*<\/script>/s)
    if (!match) {
      // Fallback: try regex on raw videoIds
      const idMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/)
      if (idMatch) {
        return respond(idMatch[1], home, away)
      }
      return Response.json({ videoUrl: null, message: 'No video found' })
    }

    // Parse and find first videoRenderer
    const data = JSON.parse(match[1])
    const items = data?.contents?.twoColumnSearchResultsRenderer
      ?.primaryContents?.sectionListRenderer?.contents?.[0]
      ?.itemSectionRenderer?.contents || []

    for (const item of items) {
      const vr = item.videoRenderer
      if (!vr) continue
      const videoId = vr.videoId
      const title = vr.title?.runs?.[0]?.text || ''
      const channelId = vr.ownerText?.runs?.[0]?.navigationEndpoint
        ?.browseEndpoint?.browseId || ''

      // Prefer SBS channel but accept any close match
      if (videoId && /highlights/i.test(title) && /world cup/i.test(title)) {
        return respond(videoId, home, away, title)
      }
    }

    // No perfect match — return first video result
    for (const item of items) {
      const vr = item.videoRenderer
      if (vr?.videoId) return respond(vr.videoId, home, away, vr.title?.runs?.[0]?.text)
    }

    return Response.json({ videoUrl: null, message: 'No video found' })
  } catch (e) {
    return Response.json({ error: e.message, videoUrl: null })
  }
}

function respond(videoId, home, away, title = '') {
  return Response.json({
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    videoId,
    title,
    home,
    away,
  })
}

export const config = { path: '/api/highlights' }
