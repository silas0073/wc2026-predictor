// Fetches goal scorers from all completed/in-progress WC2026 matches via ESPN
export default async (req) => {
  try {
    // 1. Get scoreboard to find all relevant event IDs
    const sbRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?limit=100')
    const sb = await sbRes.json()

    const relevantEvents = (sb.events || []).filter(ev => {
      const status = ev.competitions?.[0]?.status?.type?.state
      return status === 'post' || status === 'in'
    })

    const scorerMap = {} // key: "Name|TEAM" -> {name, team, goals, assists}

    const addGoal = (name, teamCode) => {
      if (!name || !teamCode) return
      const key = `${name}|${teamCode}`
      if (!scorerMap[key]) scorerMap[key] = { name, team: teamCode, goals: 0, assists: 0 }
      scorerMap[key].goals += 1
    }
    const addAssist = (name, teamCode) => {
      if (!name || !teamCode) return
      const key = `${name}|${teamCode}`
      if (!scorerMap[key]) scorerMap[key] = { name, team: teamCode, goals: 0, assists: 0 }
      scorerMap[key].assists += 1
    }

    await Promise.all(relevantEvents.map(async (ev) => {
      try {
        const sumRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${ev.id}`)
        const summary = await sumRes.json()

        const competitors = ev.competitions?.[0]?.competitors || []
        const teamAbbrevById = {}
        competitors.forEach(c => {
          if (c.team?.id != null) teamAbbrevById[String(c.team.id)] = c.team?.abbreviation
        })

        // ESPN exposes goal events in different places depending on sport/version.
        // Try all known locations and merge.
        const candidates = [
          summary.keyEvents,
          summary.commentary,
          summary.header?.competitions?.[0]?.details,
          summary.plays,
        ].filter(Array.isArray)

        const seen = new Set()

        candidates.forEach(list => {
          list.forEach(k => {
            const typeText = (k.type?.text || k.type?.id || k.text || '').toString()
            if (!/goal/i.test(typeText)) return
            if (/own.?goal|disallowed|var/i.test(typeText)) return

            const teamId = k.team?.id != null ? String(k.team.id) : null
            const teamCode = teamId ? teamAbbrevById[teamId] : null
            if (!teamCode) return

            // Try multiple shapes for athlete info
            const athletes = k.athletesInvolved || k.participants?.map(p => p.athlete).filter(Boolean) || []
            const scorer = athletes[0]
            const assister = athletes[1]
            const scorerName = scorer?.displayName || scorer?.shortName || scorer?.name
            const assisterName = assister?.displayName || assister?.shortName || assister?.name

            if (!scorerName) return

            // Dedupe identical events appearing in multiple arrays (keyEvents + details)
            const dedupeKey = `${ev.id}-${typeText}-${teamId}-${scorerName}-${k.clock?.value ?? k.time ?? ''}`
            if (seen.has(dedupeKey)) return
            seen.add(dedupeKey)

            addGoal(scorerName, teamCode)
            if (assisterName) addAssist(assisterName, teamCode)
          })
        })
      } catch {}
    }))

    const scorers = Object.values(scorerMap).sort((a,b) => b.goals - a.goals || b.assists - a.assists)

    return new Response(JSON.stringify({ scorers, updated: new Date().toISOString(), eventsChecked: relevantEvents.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, scorers: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const config = { path: '/api/scorers' }
