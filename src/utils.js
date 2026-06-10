import { TEAMS, GROUPS, FIXTURES } from './data.js'

export function formatDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short'
  })
}

export function teamObj(code) { return { code, ...TEAMS[code] } }

// Build standings for a single group given a predictions map {fixtureId: {h,a}}
export function groupStandings(groupLetter, predictions = {}) {
  const teamCodes = GROUPS[groupLetter]
  const rows = Object.fromEntries(teamCodes.map(c => [c, { P:0,W:0,D:0,L:0,GF:0,GA:0,Pts:0 }]))

  const fixtures = FIXTURES.filter(f => f.group === groupLetter)
  fixtures.forEach(f => {
    const hs = f.homeScore !== null ? f.homeScore : predictions[f.id]?.h
    const as = f.awayScore !== null ? f.awayScore : predictions[f.id]?.a
    if (hs === undefined || hs === null || as === undefined || as === null) return
    const h = rows[f.home], a = rows[f.away]
    h.P++; a.P++
    h.GF += hs; h.GA += as
    a.GF += as; a.GA += hs
    if (hs > as)      { h.W++; h.Pts+=3; a.L++ }
    else if (hs < as) { a.W++; a.Pts+=3; h.L++ }
    else              { h.D++; h.Pts++; a.D++; a.Pts++ }
  })

  return teamCodes
    .map(c => ({ code: c, team: TEAMS[c], ...rows[c], GD: rows[c].GF - rows[c].GA }))
    .sort((a,b) => b.Pts-a.Pts || b.GD-a.GD || b.GF-a.GF || a.team.name.localeCompare(b.team.name))
}

// Simulate a single match result based on strength ratings (for auto-fill)
export function simulateScore(homeCode, awayCode) {
  const h = TEAMS[homeCode].strength + (TEAMS[homeCode].host ? 0.4 : 0)
  const a = TEAMS[awayCode].strength
  const avg = (h + a) / 2
  const homeGoals = Math.max(0, Math.round(h / avg * 1.3 + (Math.random() * 2.5 - 1.2)))
  const awayGoals = Math.max(0, Math.round(a / avg * 1.1 + (Math.random() * 2.5 - 1.4)))
  return { h: homeGoals, a: awayGoals }
}

export function autoFillGroup(groupLetter, existing = {}) {
  const result = { ...existing }
  FIXTURES.filter(f => f.group === groupLetter && f.homeScore === null).forEach(f => {
    if (!result[f.id]) result[f.id] = simulateScore(f.home, f.away)
  })
  return result
}

export function allGroupsComplete(predictions) {
  return FIXTURES.filter(f => f.homeScore === null).every(f => {
    const p = predictions[f.id]
    return p && p.h !== undefined && p.a !== undefined
  })
}
