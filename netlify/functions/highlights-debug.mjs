// Temporary debug endpoint - returns raw API responses
export default async (req) => {
  try {
    const key = (typeof Netlify !== 'undefined' && Netlify.env?.get('YOUTUBE_API_KEY'))
      || process.env.YOUTUBE_API_KEY

    const debug = { key_found: !!key, key_prefix: key?.slice(0,8) }

    // Test 1: forHandle lookup
    const r1 = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id,snippet&forHandle=SBSSportau&key=${key}`)
    const d1 = await r1.json()
    debug.forHandle = { status: r1.status, error: d1.error?.message, channelId: d1.items?.[0]?.id, channelName: d1.items?.[0]?.snippet?.title, itemCount: d1.items?.length }

    // Test 2: channel search (if we got a channel ID)
    if (d1.items?.[0]?.id) {
      const channelId = d1.items[0].id
      const q = encodeURIComponent('Spain Cape Verde highlights World Cup 2026')
      const r2 = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&q=${q}&type=video&maxResults=3&order=date&key=${key}`)
      const d2 = await r2.json()
      debug.channelSearch = { status: r2.status, error: d2.error?.message, itemCount: d2.items?.length, items: (d2.items||[]).map(i => ({ title: i.snippet?.title, videoId: i.id?.videoId, channel: i.snippet?.channelTitle })) }
    }

    // Test 3: general search
    const q = encodeURIComponent('Spain Cape Verde highlights World Cup 2026 SBS Sport')
    const r3 = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&maxResults=3&order=relevance&key=${key}`)
    const d3 = await r3.json()
    debug.generalSearch = { status: r3.status, error: d3.error?.message, itemCount: d3.items?.length, items: (d3.items||[]).map(i => ({ title: i.snippet?.title, videoId: i.id?.videoId, channel: i.snippet?.channelTitle })) }

    return new Response(JSON.stringify(debug, null, 2), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = { path: '/api/highlights-debug' }
