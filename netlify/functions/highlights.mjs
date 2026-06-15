// Searches YouTube for World Cup 2026 match highlights using the YouTube Data API v3.
// Searches SBS Sport AU channel first, falls back to general search.
// Returns video ID, title, thumbnail URL.

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

    const key = Netlify.env.get('YOUTUBE_API_KEY')
    if (!key) {
      return new Response(JSON.stringify({ error: 'No API key configured' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      })
    }

    const q = encodeURIComponent(`${home} ${away} highlights World Cup 2026`)

    // First: search SBS Sport AU channel
    const sbsUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${SBS_CHANNEL_ID}&q=${q}&type=video&maxResults=3&order=date&key=${key}`
    const sbsRes = await fetch(sbsUrl)
    const sbsData = await sbsRes.json()

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
        duration: null,
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

    return new Response(JSON.stringify({ videoId: null, title: null, thumbnail: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, videoId: null }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = { path: '/api/highlights' }
