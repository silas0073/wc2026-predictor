// Fetches all WC2026 results from ESPN and returns a map keyed by team-pair
// so the frontend can merge real scores onto our fixture list without
// needing to maintain data.js manually.

const TEAM_CODE_MAP = {
  // ESPN abbreviation -> our code (only where they differ)
  KSA: 'SAU',
  CIV: 'CIV',
  USA: 'USA',
  // most match already; add more here if mismatches are found
}

function normalizeCode(espnCode) {
  return TEAM_CODE_MAP[espnCode] || espnCode
}

export default async (req) => {
  try {
    const allEvents = []

    // ESPN scoreboard defaults to "today" — we need a date range covering the
    // whole group stage (11 Jun - 27 Jun 2026). Fetch day-by-day in parallel.
    const dates = []
    const start = new Date('2026-06-11')
    const end = new Date('2026-06-28')
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().slice(0,10).replace(/-/g,''))
    }

    await Promise.all(dates.map(async (dateStr) => {
      try {
        const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}&limit=50`)
        const json = await res.json()
        if (json.events) allEvents.push(...json.events)
      } catch {}
    }))

    // Build results keyed by "HOMECODE-AWAYCODE" (and reverse for safety)
    const results = {}

    allEvents.forEach(ev => {
      const comp = ev.competitions?.[0]
      const competitors = comp?.competitors || []
      const home = competitors.find(c => c.homeAway === 'home')
      const away = competitors.find(c => c.homeAway === 'away')
      const status = comp?.status?.type || {}

      const homeCode = normalizeCode(home?.team?.abbreviation)
      const awayCode = normalizeCode(away?.team?.abbreviation)
      if (!homeCode || !awayCode) return

      const key = `${homeCode}-${awayCode}`
      results[key] = {
        homeScore: status.state === 'pre' ? null : Number(home?.score ?? 0),
        awayScore: status.state === 'pre' ? null : Number(away?.score ?? 0),
        status: status.state, // 'pre' | 'in' | 'post'
        statusDetail: status.shortDetail,
        clock: comp?.status?.displayClock,
        date: ev.date,
      }
    })

    return new Response(JSON.stringify({ results, updated: new Date().toISOString(), count: Object.keys(results).length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, results: {} }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const config = { path: '/api/results' }
