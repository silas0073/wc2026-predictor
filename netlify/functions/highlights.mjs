// Returns a YouTube search URL pointing at SBS Sport AU for a given match.
// No scraping, no API key — just builds the search URL directly.
// The user taps the link and lands on a pre-filtered YouTube search
// for that match's highlights on the SBS Sport channel.

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

    // Search YouTube for this match on the SBS Sport AU channel
    const query = encodeURIComponent(`${home} ${away} highlights World Cup 2026 SBS Sport`)
    const searchUrl = `https://www.youtube.com/results?search_query=${query}`

    return new Response(JSON.stringify({ searchUrl, home, away }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const config = { path: '/api/highlights' }
