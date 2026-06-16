// Searches YouTube for WC2026 match highlights — no API key needed.
// Scrapes ytInitialData JSON from YouTube search results.
// Prefers SBS Sport AU channel, falls back to any highlight video.

const BLOCKED_CHANNELS = ['fifatv', 'fifa tv', 'fox sports', 'foxsports']
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

      if (BLOCKED_CHANNELS.some(b => channel.includes(b))) continue
      if (!/highlight|recap|goal|result/i.test(title)) continue

      videos.push({
        videoId: vr.videoId,
        title,
        channel: channelRaw,
        thumbnail,
        isSBS: SBS_NAMES.some(s => channel.includes(s))
      })
      if (videos.length >= 8) break
    }
    if (videos.length >= 8) break
  }
  return videos
}

function pickBest(videos) {
  // Prefer SBS first
  const sbs = videos.find(v => v.isSBS)
  if (sbs) return sbs
  return videos[0] || null
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

    // Search SBS-specific first
    const sbsQuery = `${home} ${away} highlights World Cup 2026 SBS Sport`
    let videos = await searchYouTube(sbsQuery)
    let best = pickBest(videos)

    // If no SBS result, try general search
    if (!best || !best.isSBS) {
      const genQuery = `${home} ${away} World Cup 2026 highlights`
      const genVideos = await searchYouTube(genQuery)
      const genSBS = genVideos.find(v => v.isSBS)
      if (genSBS) best = genSBS
      else if (!best) best = genVideos[0] || null
    }

    if (best) {
      return new Response(JSON.stringify({
        videoId: best.videoId,
        videoUrl: `https://www.youtube.com/watch?v=${best.videoId}`,
        title: best.title,
        thumbnail: best.thumbnail,
        channel: best.channel,
        isSBS: best.isSBS,
        source: 'scrape'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' }
      })
    }

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
