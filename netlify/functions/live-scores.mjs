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

function getDateStrings() {
  // Return today + yesterday + tomorrow in YYYYMMDD to catch UTC edge cases
  const dates = []
  const now = new Date()
  for (let d = -1; d <= 1; d++) {
    const dt = new Date(now)
    dt.setDate(dt.getDate() + d)
    dates.push(dt.toISOString().slice(0,10).replace(/-/g,''))
  }
  return dates
}

async function fetchEventsForDate(dateStr) {
  try {
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}&limit=20`)
    const data = await res.json()
    return data.events || []
  } catch {
    return []
  }
}

export default async (req) => {
  try {
    // Fetch yesterday/today/tomorrow to handle UTC timezone edge cases
    const dates = getDateStrings()
    const allEventArrays = await Promise.all(dates.map(fetchEventsForDate))

    // Deduplicate by event id
    const seen = new Set()
    const allEvents = []
    for (const evArr of allEventArrays) {
      for (const ev of evArr) {
        if (!seen.has(ev.id)) {
          seen.add(ev.id)
          allEvents.push(ev)
        }
      }
    }

    const events = await Promise.all(allEvents.map(async ev => {
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

      const periodNum = comp?.status?.period
      const periodNames = { 1: '1st Half', 2: '2nd Half', 3: 'ET 1', 4: 'ET 2', 5: 'Pens' }
      const periodLabel = periodNames[periodNum] || ''
      const clock = comp?.status?.displayClock || ''

      return {
        id: ev.id,
        date: ev.date,
        status: status.state,
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
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, events: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const config = { path: '/api/live-scores' }
