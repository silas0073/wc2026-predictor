// Fetches goal scorers from all completed/in-progress WC2026 matches via ESPN
export default async (req) => {
  try {
    // 1. Get scoreboard to find all event IDs
    const sbRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?limit=100')
    const sb = await sbRes.json()

    const relevantEvents = (sb.events || []).filter(ev => {
      const status = ev.competitions?.[0]?.status?.type?.state
      return status === 'post' || status === 'in'
    })

    // 2. Fetch summary for each event to get goal scorer details
    const scorerMap = {} // key: "Name|TEAM" -> {name, team, goals, assists}

    await Promise.all(relevantEvents.map(async (ev) => {
      try {
        const sumRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${ev.id}`)
        const summary = await sumRes.json()

        const competitors = ev.competitions?.[0]?.competitors || []
        const teamAbbrevById = {}
        competitors.forEach(c => { teamAbbrevById[c.team?.id] = c.team?.abbreviation })

        // Key events contain goals
        const keyEvents = summary.keyEvents || summary.commentary || []
        keyEvents.forEach(k => {
          const type = k.type?.text || k.type?.id || ''
          if (!/goal/i.test(type) || /own.?goal/i.test(type)) return // skip non-goals; could refine

          const athlete = k.athletesInvolved?.[0] || k.participants?.find(p=>p.athlete)?.athlete
          const name = athlete?.displayName || athlete?.shortName
          const teamId = k.team?.id
          const teamCode = teamAbbrevById[teamId]
          if (!name || !teamCode) return

          const key = `${name}|${teamCode}`
          if (!scorerMap[key]) scorerMap[key] = { name, team: teamCode, goals: 0, assists: 0 }
          scorerMap[key].goals += 1
        })
      } catch {}
    }))

    const scorers = Object.values(scorerMap).sort((a,b) => b.goals - a.goals)

    return new Response(JSON.stringify({ scorers, updated: new Date().toISOString() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=120' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, scorers: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const config = { path: '/api/scorers' }
