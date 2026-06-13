// Proxies ESPN's public World Cup scoreboard for live scores, including
// possession % for matches currently in progress.
async function fetchPossession(eventId) {
  try {
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${eventId}`)
    const summary = await res.json()
    const teams = summary.boxscore?.teams || []
    const possession = {}
    teams.forEach(t => {
      const stat = (t.statistics || []).find(s => /possession/i.test(s.name || s.displayName || ''))
      if (stat) {
        const teamId = String(t.team?.id)
        possession[teamId] = parseFloat(stat.displayValue?.replace('%','')) || null
      }
    })
    return possession
  } catch {
    return {}
  }
}

export default async (req) => {
  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard')
    const data = await res.json()

    const events = await Promise.all((data.events || []).map(async ev => {
      const comp = ev.competitions?.[0]
      const competitors = comp?.competitors || []
      const home = competitors.find(c => c.homeAway === 'home')
      const away = competitors.find(c => c.homeAway === 'away')
      const status = comp?.status?.type || {}

      let possession = {}
      if (status.state === 'in') {
        possession = await fetchPossession(ev.id)
      }

      const homeId = String(home?.team?.id)
      const awayId = String(away?.team?.id)

      return {
        id: ev.id,
        date: ev.date,
        status: status.state,        // 'pre', 'in', 'post'
        statusDetail: status.shortDetail || status.detail,
        clock: comp?.status?.displayClock,
        period: comp?.status?.period,
        home: {
          code: home?.team?.abbreviation,
          name: home?.team?.displayName,
          score: home?.score,
          winner: home?.winner || false,
          possession: possession[homeId] ?? null,
        },
        away: {
          code: away?.team?.abbreviation,
          name: away?.team?.displayName,
          score: away?.score,
          winner: away?.winner || false,
          possession: possession[awayId] ?? null,
        },
      }
    }))

    return new Response(JSON.stringify({ events, updated: new Date().toISOString() }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, events: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const config = { path: '/api/live-scores' }
