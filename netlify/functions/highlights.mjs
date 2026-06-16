// YouTube Data API v3 — search SBS Sport AU channel for match highlights
// Falls back to general YouTube search, then a search URL

async function getSBSChannelId(key) {
  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=SBSSportau&key=${key}`)
    const data = await res.json()
    return data.items?.[0]?.id || null
  } catch { return null }
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

    const key = (typeof Netlify !== 'undefined' && Netlify.env?.get('YOUTUBE_API_KEY'))
      || process.env.YOUTUBE_API_KEY

    const q = encodeURIComponent(`${home} ${away} highlights World Cup 2026`)
    const fallbackUrl = `https://www.youtube.com/results?search_query=${q}+SBS+Sport`

    if (!key) {
      return new Response(JSON.stringify({ searchUrl: fallbackUrl, fallback: true }), {
        status: 200, headers: { 'Content-Type': 'application/json' }
      })
    }

    // 1. Search SBS Sport AU channel by handle
    const sbsChannelId = await getSBSChannelId(key)
    if (sbsChannelId) {
      const sbsRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${sbsChannelId}&q=${q}&type=video&maxResults=5&order=date&key=${key}`)
      const sbsData = await sbsRes.json()
      const items = sbsData.items || []
      const match = items.find(i => /highlight/i.test(i.snippet?.title || '') || /world.?cup/i.test(i.snippet?.title || '')) || items[0]
      if (match?.id?.videoId) {
        return new Response(JSON.stringify({
          videoId: match.id.videoId,
          videoUrl: `https://www.youtube.com/watch?v=${match.id.videoId}`,
          title: match.snippet?.title,
          thumbnail: match.snippet?.thumbnails?.medium?.url || match.snippet?.thumbnails?.default?.url,
          channel: match.snippet?.channelTitle,
          source: 'sbs'
        }), { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } })
      }
    }

    // 2. General search prioritising SBS
    const genRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}+SBS+Sport&type=video&maxResults=5&order=relevance&key=${key}`)
    const genData = await genRes.json()
    const genItems = genData.items || []
    const genMatch = genItems.find(i =>
      /highlight/i.test(i.snippet?.title || '') && /sbs/i.test(i.snippet?.channelTitle || '')
    ) || genItems.find(i => /highlight/i.test(i.snippet?.title || '')) || genItems[0]

    if (genMatch?.id?.videoId) {
      return new Response(JSON.stringify({
        videoId: genMatch.id.videoId,
        videoUrl: `https://www.youtube.com/watch?v=${genMatch.id.videoId}`,
        title: genMatch.snippet?.title,
        thumbnail: genMatch.snippet?.thumbnails?.medium?.url || genMatch.snippet?.thumbnails?.default?.url,
        channel: genMatch.snippet?.channelTitle,
        source: 'general'
      }), { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } })
    }

    // 3. Final fallback — search URL
    return new Response(JSON.stringify({ searchUrl: fallbackUrl, fallback: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, videoId: null }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = { path: '/api/highlights' }
