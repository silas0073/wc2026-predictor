// Proxies ESPN's public World Cup scoreboard for live scores, including
// possession %, goal scorers and red cards for matches in progress.

function extractEvents(summary, teamAbbrevById) {
  const goals = []
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
      const teamId = k.team?.id != null ? String(k.team.id) : null
      const teamCode = teamId ? teamAbbrevById[teamId] : null
      if (!teamCode) return

      const minute = k.clock?.displayValue || (k.clock?.value != null ? `${Math.floor(k.clock.value / 60)}'` : null)
      const athletes = k.athletesInvolved || k.participants?.map(p => p.athlete).filter(Boolean) || []
      const main = athletes[0]
      const mainName = main?.displayName || main?.shortName || main?.name

      const dedupeKey = `${typeText}-${teamId}-${mainName}-${k.clock?.value ?? k.time ?? ''}`
      if (seen.has(dedupeKey)) return

      if (/goal/i.test(typeText) && !/own.?goal|disallowed|var/i.test(typeText)) {
        if (!mainName) return
        seen.add(dedupeKey)
        goals.push({ name: mainName, team: teamCode, minute: minute || '', ownGoal: false })
      } else if (/own.?goal/i.test(typeText)) {
        if (!mainName) return
        seen.add(dedupeKey)
        goals.push({ name: mainName, team: teamCode, minute: minute || '', ownGoal: true })
      } else if (/red card/i.test(typeText)) {
        if (!mainName) return
        seen.add(dedupeKey)
        redCards.push({ name: mainName, team: teamCode, minute: minute || '' })
      }
    })
  })

  const minuteNum = (m) => { const match = (m || '').match(/(\d+)/); return match ? parseInt(match[1], 10) : 999 }
  goals.sort((a,b) => minuteNum(a.minute) - minuteNum(b.minute))
  redCards.sort((a,b) => minuteNum(a.minute) - minuteNum(b.minute))
  return { goals, redCards }
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

    const { goals, redCards } = extractEvents(summary, teamAbbrevById)
    return { possession, goals, redCards }
  } catch {
    return { possession: {}, goals: [], redCards: [] }
  }
}

function getDateStrings() {
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
    const dates = getDateStrings()
    const allEventArrays = await Promise.all(dates.map(fetchEventsForDate))

    const seen = new Set()
    const allEvents = []
    for (const evArr of allEventArrays) {
      for (const ev of evArr) {
        if (!seen.has(ev.id)) { seen.add(ev.id); allEvents.push(ev) }
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
      let goals = []
      let redCards = []
      if (status.state === 'in') {
        const detail = await fetchMatchDetail(ev.id, teamAbbrevById)
        possession = detail.possession
        goals = detail.goals
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
        goals,
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
