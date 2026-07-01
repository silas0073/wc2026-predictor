// Fetches all WC2026 results from ESPN and returns a map keyed by team-pair
// so the frontend can merge real scores onto our fixture list without
// needing to maintain data.js manually. Also includes goal scorers (with
// minute) and red cards per match.

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
        goals.push({
          name: mainName,
          team: teamCode,
          minute: minute || '',
          ownGoal: false,
        })
      } else if (/own.?goal/i.test(typeText)) {
        if (!mainName) return
        seen.add(dedupeKey)
        goals.push({
          name: mainName,
          team: teamCode,
          minute: minute || '',
          ownGoal: true,
        })
      } else if (/red card/i.test(typeText)) {
        if (!mainName) return
        seen.add(dedupeKey)
        redCards.push({
          name: mainName,
          team: teamCode,
          minute: minute || '',
        })
      }
    })
  })

  // Sort by minute (numeric prefix) where possible
  const minuteNum = (m) => {
    const match = (m || '').match(/(\d+)/)
    return match ? parseInt(match[1], 10) : 999
  }
  goals.sort((a,b) => minuteNum(a.minute) - minuteNum(b.minute))
  redCards.sort((a,b) => minuteNum(a.minute) - minuteNum(b.minute))

  return { goals, redCards }
}

export default async (req) => {
  try {
    const allEvents = []
    const failedDates = []

    // Fetching all 40 tournament dates (+ a summary call per finished/live
    // match) on every 60s poll was almost certainly hitting Netlify's
    // function timeout / ESPN rate-limiting once the tournament reached the
    // knockout rounds (88+ matches = 40 scoreboard calls + 88 summary calls
    // = 128 concurrent outbound fetches per poll). Instead, only fetch a
    // rolling window around "now": far enough back to catch any match that
    // might still need live-merging (recent knockout rounds), and a few days
    // forward for upcoming fixtures. Completed matches outside this window
    // are assumed already patched into data.js.
    const dates = []
    const now = new Date()
    const start = new Date(now); start.setDate(start.getDate() - 10)
    const end = new Date(now); end.setDate(end.getDate() + 3)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().slice(0,10).replace(/-/g,''))
    }

    await Promise.all(dates.map(async (dateStr) => {
      try {
        const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}&limit=50`)
        const json = await res.json()
        if (json.events) allEvents.push(...json.events)
      } catch {
        failedDates.push(dateStr)
      }
    }))

    // Build results keyed by "HOMECODE-AWAYCODE"
    const results = {}

    await Promise.all(allEvents.map(async (ev) => {
      const comp = ev.competitions?.[0]
      const competitors = comp?.competitors || []
      const home = competitors.find(c => c.homeAway === 'home')
      const away = competitors.find(c => c.homeAway === 'away')
      const status = comp?.status?.type || {}

      const homeCode = normalizeCode(home?.team?.abbreviation)
      const awayCode = normalizeCode(away?.team?.abbreviation)
      if (!homeCode || !awayCode) return

      const key = `${homeCode}-${awayCode}`
      const entry = {
        homeScore: status.state === 'pre' ? null : Number(home?.score ?? 0),
        awayScore: status.state === 'pre' ? null : Number(away?.score ?? 0),
        status: status.state, // 'pre' | 'in' | 'post'
        statusDetail: status.shortDetail,
        clock: comp?.status?.displayClock,
        date: ev.date,
        goals: [],
        redCards: [],
        // Penalty shootout scores, if the match went to pens (knockout only)
        homeShootout: home?.shootoutScore != null ? Number(home.shootoutScore) : null,
        awayShootout: away?.shootoutScore != null ? Number(away.shootoutScore) : null,
      }

      // Fetch events (goals + red cards) for played/in-progress matches
      if (status.state === 'post' || status.state === 'in') {
        try {
          const sumRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${ev.id}`)
          const summary = await sumRes.json()

          const teamAbbrevById = {}
          competitors.forEach(c => {
            if (c.team?.id != null) teamAbbrevById[String(c.team.id)] = normalizeCode(c.team?.abbreviation)
          })

          const { goals, redCards } = extractEvents(summary, teamAbbrevById)
          entry.goals = goals
          entry.redCards = redCards
        } catch {}
      }

      results[key] = entry
    }))

    return new Response(JSON.stringify({ results, updated: new Date().toISOString(), count: Object.keys(results).length, datesFetched: dates.length, datesFailed: failedDates }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, results: {} }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const config = { path: '/api/results' }
