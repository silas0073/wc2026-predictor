// Proxies ESPN's public World Cup scoreboard for live scores, including
// possession % and red cards for matches currently in progress.

function extractRedCards(summary, teamAbbrevById) {
  const redCards = []
  const seen = new Set()

  const candidates = [
    summary.keyEvents,
    summary.commentary,
    summary.header?.competitions?.[0]?.details,
    summary.plays,
  ].filter(Array.isArray)

  candidates.forEach(list => {
    list.forEach(k => {
      const typeText = (k.type?.text || k.type?.id || k.text || '').toString()
      if (!/red card/i.test(typeText)) return

      const teamId = k.team?.id != null ? String(k.team.id) : null
      const teamCode = teamId ? teamAbbrevById[teamId] : null
      if (!teamCode) return

      const minute = k.clock?.displayValue || (k.clock?.value != null ? `${Math.floor(k.clock.value / 60)}'` : '')
      const athletes = k.athletesInvolved || k.participants?.map(p => p.athlete).filter(Boolean) || []
      const name = athletes[0]?.displayName || athletes[0]?.shortName || athletes[0]?.name
      if (!name) return

      const dedupeKey = `${typeText}-${teamId}-${name}-${k.clock?.value ?? k.time ?? ''}`
      if (seen.has(dedupeKey)) return
      seen.add(dedupeKey)

      redCards.push({ name, team: teamCode, minute })
    })
  })

  return redCards
}

// Fetch extra match detail (possession + red cards) for in-progress matches
async function fetchMatchDetail(eventId, teamAbbrevById) {
  try {
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${eventId}`)
    const summary = await res.json()

    const possession = {}
    const teams = summary.boxscore?.teams || []
    teams.forEach(t => {
      const stat = (t.statistics || []).find(s => /possession/i.test(s.name || s.displayName || ''))
      if (stat) {
        const teamId = String(t.team?.id)
        possession[teamId] = parseFloat(stat.displayValue?.replace('%','')) || null
      }
    })

    const redCards = extractRedCards(summary, teamAbbrevById)

    return { possession, redCards }
  } catch {
    return { possession: {}, redCards: [] }
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

      const homeId = String(home?.team?.id)
      const awayId = String(away?.team?.id)
      const teamAbbrevById = {
        [homeId]: home?.team?.abbreviation,
        [awayId]: away?.team?.abbreviation,
      }

      let possession = {}
      let redCards = []
      if (status.state === 'in') {
        const detail = await fetchMatchDetail(ev.id, teamAbbrevById)
        possession = detail.possession
        redCards = detail.redCards
      }

      // Avoid duplicating the minute: shortDetail often already includes
      // the clock (e.g. "12' - 1st Half"), so just use the half/period label.
      let periodLabel = status.shortDetail || status.detail || ''
      const clock = comp?.status?.displayClock || ''
      if (clock && periodLabel.includes(clock)) {
        periodLabel = periodLabel.replace(clock, '').replace(/^[\s-]+/, '').trim()
      }

      return {
        id: ev.id,
        date: ev.date,
        status: status.state,        // 'pre', 'in', 'post'
        statusDetail: periodLabel,
        clock,
        period: comp?.status?.period,
        redCards,
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
