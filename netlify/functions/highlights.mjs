// YouTube Data API v3 search for match highlights
// API key stored in YOUTUBE_API_KEY env var (set in Netlify dashboard)

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

    // Try env var first, fall back to hardcoded (temporary)
    const key = (typeof Netlify !== 'undefined' && Netlify.env?.get('YOUTUBE_API_KEY'))
      || process.env.YOUTUBE_API_KEY
      || 'AIzaSyCUPKrUfI8JRAGxbntn5QwX5BxslbDFRo'

    const q = encodeURIComponent(`${home} ${away} highlights World Cup 2026`)

    // Search SBS Sport AU channel first
    const sbsUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${SBS_CHANNEL_ID}&q=${q}&type=video&maxResults=5&order=date&key=${key}`
    const sbsRes = await fetch(sbsUrl)
    const sbsData = await sbsRes.json()

    if (sbsData.error) {
      // API error — fall back to YouTube search URL
      const searchUrl = `https://www.youtube.com/results?search_query=${q}+SBS+Sport`
      return new Response(JSON.stringify({ searchUrl, fallback: true, apiError: sbsData.error.message }), {
        status: 200, headers: { 'Content-Type': 'application/json' }
      })
    }

    const sbsItems = sbsData.items || []
    const sbsMatch = sbsItems.find(item =>
      /highlight/i.test(item.snippet?.title || '') ||
      /match/i.test(item.snippet?.title || '')
    ) || sbsItems[0]

    if (sbsMatch) {
      const videoId = sbsMatch.id?.videoId
      return new Response(JSON.stringify({
        videoId,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        title: sbsMatch.snippet?.title,
        thumbnail: sbsMatch.snippet?.thumbnails?.medium?.url || sbsMatch.snippet?.thumbnails?.default?.url,
        channel: sbsMatch.snippet?.channelTitle,
        source: 'sbs'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' }
      })
    }

    // Fallback: general YouTube search
    const genUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}+highlights&type=video&maxResults=5&order=relevance&key=${key}`
    const genRes = await fetch(genUrl)
    const genData = await genRes.json()
    const genItems = genData.items || []
    const genMatch = genItems.find(item =>
      /highlight/i.test(item.snippet?.title || '') &&
      !/reaction|prediction|watchalong/i.test(item.snippet?.title || '')
    ) || genItems[0]

    if (genMatch) {
      const videoId = genMatch.id?.videoId
      return new Response(JSON.stringify({
        videoId,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        title: genMatch.snippet?.title,
        thumbnail: genMatch.snippet?.thumbnails?.medium?.url || genMatch.snippet?.thumbnails?.default?.url,
        channel: genMatch.snippet?.channelTitle,
        source: 'general'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' }
      })
    }

    return new Response(JSON.stringify({ videoId: null }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, videoId: null }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = { path: '/api/highlights' }
