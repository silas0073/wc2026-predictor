// Searches YouTube for SBS Sport AU WC2026 highlights — no API key needed.
// Scrapes ytInitialData JSON from YouTube search results.
// Only returns SBS videos — no fallback to other channels.

const SBS_NAMES = ['sbs sport', 'sbs']

async function searchYouTube(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'en-AU,en;q=0.9',
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

  const videos = []
  for (const section of contents) {
    const items = section?.itemSectionRenderer?.contents ?? []
    for (const item of items) {
      const vr = item?.videoRenderer
      if (!vr?.videoId) continue
      const title = vr.title?.runs?.[0]?.text ?? ''
      const channelRaw = vr.ownerText?.runs?.[0]?.text ?? ''
      const channel = channelRaw.toLowerCase()
      const thumbnail = vr.thumbnail?.thumbnails?.slice(-1)[0]?.url ?? null

      // Only SBS videos
      const isSBS = SBS_NAMES.some(s => channel.includes(s))
      if (!isSBS) continue
      if (!/highlight|recap|world.?cup|match/i.test(title)) continue

      videos.push({ videoId: vr.videoId, title, channel: channelRaw, thumbnail })
      if (videos.length >= 3) break
    }
    if (videos.length >= 3) break
  }
  return videos
}

export default async (req) => {
  try {
    const url = new URL(req.url)
    const home = url.searchParams.get('home') || ''
    const away = url.searchParams.get('away') || ''

    if (!home || !away) {
      return new Response(JSON.stringify({ error: 'Missing home/away' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      })
    }

    // Try SBS-targeted searches
    const queries = [
      `${home} ${away} highlights World Cup 2026 SBS Sport`,
      `${home} ${away} World Cup 2026 SBS`,
      `${home} v ${away} SBS Sport 2026`,
    ]

    for (const query of queries) {
      const videos = await searchYouTube(query)
      if (videos.length > 0) {
        const v = videos[0]
        return new Response(JSON.stringify({
          videoId: v.videoId,
          videoUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
          title: v.title,
          thumbnail: v.thumbnail,
          channel: v.channel,
          source: 'sbs'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' }
        })
      }
    }

    // No SBS video found — return search URL instead of wrong channel
    const fallbackQ = encodeURIComponent(`${home} ${away} highlights World Cup 2026 SBS Sport`)
    return new Response(JSON.stringify({
      searchUrl: `https://www.youtube.com/results?search_query=${fallbackQ}`,
      fallback: true
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, videoId: null }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = { path: '/api/highlights' }
