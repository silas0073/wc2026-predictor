import { TEAMS, GROUPS, FIXTURES, KNOCKOUT_FIXTURES } from './data.js'

export function formatDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short'
  })
}

// Format UTC kickoff as AEST (UTC+10, no DST in June)
export function formatAEST(utcStr) {
  if (!utcStr) return ''
  const d = new Date(utcStr)
  // AEST = UTC+10
  const aest = new Date(d.getTime() + 10 * 60 * 60 * 1000)
  const h = aest.getUTCHours()
  const m = aest.getUTCMinutes()
  const ampm = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 || 12
  return `${h12}${m ? ':' + String(m).padStart(2,'0') : ''}${ampm} AEST`
}

// Format UTC kickoff as local date label for AEST
export function formatAESTDate(utcStr) {
  if (!utcStr) return ''
  const d = new Date(utcStr)
  const aest = new Date(d.getTime() + 10 * 60 * 60 * 1000)
  return aest.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
}

export function teamObj(code) { return { code, ...TEAMS[code] } }

export function groupStandings(groupLetter, predictions = {}, allFixtures = FIXTURES) {
  const teamCodes = GROUPS[groupLetter]
  const rows = Object.fromEntries(teamCodes.map(c => [c, { P:0,W:0,D:0,L:0,GF:0,GA:0,Pts:0 }]))

  const fixtures = allFixtures.filter(f => f.group === groupLetter)
  fixtures.forEach(f => {
    // Use real score if available, else prediction
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

// Determines which teams in a group have MATHEMATICALLY clinched a top-2
// (knockout) spot, even if the group isn't finished yet. Does this properly
// — by brute-force enumerating every possible win/draw/loss outcome for the
// group's remaining fixtures (max 6 remaining in a 4-team group, so at most
// 3^6 = 729 combinations, trivial to check) — rather than evaluating each
// team's best/worst case independently. That matters because independent
// ceilings overcount danger: if two chasing teams still have to play each
// other, they can't BOTH win that match, so checking them independently
// produces false "still in danger" results. Brute force respects that.
//
// Only points are used to rank within each hypothetical outcome (not GD/GF),
// so this deliberately stays conservative around exact points-ties — a team
// isn't called "clinched" if some combination of remaining results could
// leave it level on points with 2+ others, even if its current goal
// difference makes that practically certain to resolve in its favour. That
// asymmetry is intentional: a confirmed-qualified badge should never be
// wrong, even if it occasionally lags an early "team X is through" headline
// by a day in a rare three-way-tie edge case.
function clinchedGroupQualifiers(groupLetter, allFixtures) {
  const rows = groupStandings(groupLetter, {}, allFixtures)
  const teamCodes = rows.map(r => r.code)
  const currentPts = Object.fromEntries(rows.map(r => [r.code, r.Pts]))

  const gFixtures = allFixtures.filter(f => f.group === groupLetter)
  const remaining = gFixtures.filter(f => f.homeScore === null || f.awayScore === null)

  if (remaining.length === 0) return new Set(teamCodes.slice(0, 2))
  if (remaining.length > 6) return new Set() // safety guard, shouldn't happen for a 4-team group

  const safe = Object.fromEntries(teamCodes.map(c => [c, true]))
  const totalCombos = Math.pow(3, remaining.length)

  for (let combo = 0; combo < totalCombos; combo++) {
    const pts = { ...currentPts }
    let c = combo
    for (let i = 0; i < remaining.length; i++) {
      const outcome = c % 3; c = Math.floor(c / 3)
      const f = remaining[i]
      if (outcome === 0) pts[f.home] += 3                          // home win
      else if (outcome === 1) { pts[f.home] += 1; pts[f.away] += 1 } // draw
      else pts[f.away] += 3                                         // away win
    }
    teamCodes.forEach(code => {
      const threats = teamCodes.filter(o => o !== code && pts[o] >= pts[code]).length
      if (threats >= 2) safe[code] = false
    })
  }

  return new Set(teamCodes.filter(c => safe[c]))
}

// Returns the set of team codes that have ACTUALLY qualified for the
// knockout stage. Top-2 spots use mathematical clinch detection so a team
// shows as qualified the moment it's locked in (often before its group
// finishes). Best-8 third-place qualification can only be confirmed once
// every group has fully played out, since it depends on final standings
// across all 12 groups. Distinct from "currently sitting in a qualifying
// position" — a team in 2nd place isn't shown as qualified just because
// it's provisionally there if it could still be caught.
export function getQualifiedTeams(allFixtures = FIXTURES) {
  const groupDone = {}
  GROUP_LABELS_LOCAL().forEach(g => {
    const gFixtures = allFixtures.filter(f => f.group === g)
    groupDone[g] = gFixtures.length > 0 && gFixtures.every(f => f.homeScore !== null && f.awayScore !== null)
  })

  const qualified = new Set()
  const thirds = []
  GROUP_LABELS_LOCAL().forEach(g => {
    const gFixtures = allFixtures.filter(f => f.group === g)
    if (gFixtures.length === 0) return
    clinchedGroupQualifiers(g, allFixtures).forEach(code => qualified.add(code))
    if (groupDone[g]) {
      const rows = groupStandings(g, {}, allFixtures)
      if (rows[2]) thirds.push({ group: g, code: rows[2].code, pts: rows[2].Pts, gd: rows[2].GD, gf: rows[2].GF })
    }
  })

  const allDone = GROUP_LABELS_LOCAL().every(g => groupDone[g])
  if (allDone) {
    thirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
      .slice(0, 8)
      .forEach(b => qualified.add(b.code))
  }

  return qualified
}

// Resolves knockout slot descriptors ({g,p} / {t3} / {w} / {l}) into real
// team codes using REAL group results only (no predictions). A group's
// standings are only considered "final" once all 6 of its fixtures have a
// real score — otherwise its winner/runner-up/3rd slots stay TBD, since an
// incomplete table can't be trusted to rank teams correctly yet.
// `fixtures` should be the live-merged FIXTURES (group stage).
// `knockoutFixtures` should be the live-merged KNOCKOUT_FIXTURES (so winners
// of earlier rounds are already known when resolving later rounds).
export function resolveKnockoutFixtures(fixtures = FIXTURES, knockoutFixtures = KNOCKOUT_FIXTURES) {
  // Only treat a group as finished once every fixture in it has a real score
  const groupDone = {}
  GROUP_LABELS_LOCAL().forEach(g => {
    const gFixtures = fixtures.filter(f => f.group === g)
    groupDone[g] = gFixtures.length > 0 && gFixtures.every(f => f.homeScore !== null && f.awayScore !== null)
  })

  const standingsCache = {}
  const getStandings = (g) => {
    if (!standingsCache[g]) standingsCache[g] = groupStandings(g, {}, fixtures)
    return standingsCache[g]
  }

  // Best-8 third place teams — only computable once ALL 12 groups are done
  const allGroupsDone = GROUP_LABELS_LOCAL().every(g => groupDone[g])
  let best8 = null
  if (allGroupsDone) {
    const thirds = GROUP_LABELS_LOCAL().map(g => {
      const rows = getStandings(g)
      const r = rows[2]
      return r ? { group: g, code: r.code, pts: r.Pts, gd: r.GD, gf: r.GF } : null
    }).filter(Boolean)
    best8 = thirds.sort((a,b) => b.pts-a.pts || b.gd-a.gd || b.gf-a.gf).slice(0,8)
  }

  const resolveSlot = (slot, byId) => {
    if (typeof slot === 'string') return slot // already resolved
    if (!slot) return null
    if (slot.g) {
      if (!groupDone[slot.g]) return null
      const rows = getStandings(slot.g)
      return rows[slot.p - 1]?.code || null
    }
    if (slot.t3) {
      if (!best8) return null
      const match = best8.find(b => slot.t3.includes(b.group))
      return match?.code || null
    }
    if (slot.w != null) {
      const m = byId[`M${slot.w}`]
      if (!m || m.homeScore === null || m.awayScore === null) return null
      if (m.homeScore === m.awayScore) return null // shouldn't happen in knockout (extra time/pens resolve it)
      return m.homeScore > m.awayScore ? m.home : m.away
    }
    if (slot.l != null) {
      const m = byId[`M${slot.l}`]
      if (!m || m.homeScore === null || m.awayScore === null) return null
      if (m.homeScore === m.awayScore) return null
      return m.homeScore > m.awayScore ? m.away : m.home
    }
    return null
  }

  // Resolve in bracket order so later rounds can reference earlier winners.
  // homeSlot/awaySlot preserve the ORIGINAL slot descriptor ({g,p}/{t3}/{w}/{l})
  // separately from the resolved team code, so callers can a) re-resolve on a
  // later pass once more results are in (live cascade), and b) render a
  // human-readable placeholder like "Winner Group A" while still TBD.
  const byId = {}
  const resolved = knockoutFixtures.map(m => {
    const homeSlot = m.homeSlot !== undefined ? m.homeSlot : m.home
    const awaySlot = m.awaySlot !== undefined ? m.awaySlot : m.away
    const home = resolveSlot(homeSlot, byId)
    const away = resolveSlot(awaySlot, byId)
    const out = { ...m, home, away, homeSlot, awaySlot }
    byId[m.id] = out
    return out
  })
  return resolved
}

// Local copy to avoid circular import churn — kept in sync with data.js
function GROUP_LABELS_LOCAL() {
  return ['A','B','C','D','E','F','G','H','I','J','K','L']
}
