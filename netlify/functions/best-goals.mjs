// Searches YouTube for best goals of WC2026 by view count (no API key needed)

async function searchYouTube(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=CAM%253D` // sp=CAM%3D sorts by view count
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
      const channel = vr.ownerText?.runs?.[0]?.text ?? ''
      const thumbnail = vr.thumbnail?.thumbnails?.slice(-1)[0]?.url ?? null

      // Exclude music videos and songs
      if (/waka|song|official music|vevo|lyrics|anthem/i.test(title)) continue
      // Must be football/goal related
      if (!/goal|goals|highlight|world.?cup|fifa/i.test(title)) continue
      videos.push({ videoId: vr.videoId, title, channel, thumbnail })
      if (videos.length >= 5) break
    }
    if (videos.length >= 5) break
  }
  return videos
}

export default async (req) => {
  try {
    const queries = [
      'best goals FIFA World Cup 2026',
      'top goals World Cup 2026 highlights',
      'greatest goals 2026 World Cup',
    ]

    for (const query of queries) {
      const videos = await searchYouTube(query)
      if (videos.length > 0) {
        return new Response(JSON.stringify({ candidates: videos }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=1800' }
        })
      }
    }

    return new Response(JSON.stringify({ candidates: [] }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ candidates: [], error: e.message }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = { path: '/api/best-goals' }
