import { useState, useEffect } from 'react'
import { KNOCKOUT_FIXTURES } from './data.js'
import { resolveKnockoutFixtures } from './utils.js'

// Fetches live results from /api/results (same endpoint as group stage) and
// returns a fully-resolved knockout bracket: slot descriptors swapped for
// real team codes (once their groups/earlier rounds are final), with live
// scores/scorers/red cards/shootouts overlaid onto matches that have kicked off.
//
// `groupFixtures` = the live-merged group-stage FIXTURES (from useLiveResults),
// passed in so knockout slots resolve from the same real data, not predictions.
export function useLiveKnockout(groupFixtures) {
  const [liveResults, setLiveResults] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetchResults = async () => {
      try {
        const res = await fetch('/api/results', { cache: 'no-store' })
        const data = await res.json()
        if (mounted) {
          setLiveResults(data.results || {})
          setLoading(false)
        }
      } catch {
        if (mounted) { setLiveResults({}); setLoading(false) }
      }
    }
    fetchResults()
    const interval = setInterval(fetchResults, 60000)

    const onVisible = () => { if (document.visibilityState === 'visible') fetchResults() }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      mounted = false
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  // Step 1: resolve slot descriptors -> real team codes using REAL group
  // results and any already-resolved earlier knockout rounds. We need to do
  // this iteratively-ish: resolveKnockoutFixtures already walks in bracket
  // order using results overlaid so far, but to let *live* (in-progress)
  // knockout scores feed forward into later-round slot resolution we run it
  // twice — once on static data.js scores, then merge live scores in and
  // resolve again so winners flow through immediately when ESPN reports them.
  const staticResolved = resolveKnockoutFixtures(groupFixtures, KNOCKOUT_FIXTURES)

  const liveMerged = staticResolved.map(m => {
    if (!liveResults || !m.home || !m.away) return m
    const live = liveResults[`${m.home}-${m.away}`]
    if (!live) return m

    // data.js goals already set manually -> treat as authoritative, skip ESPN scorers
    if (m.goals?.length) return { ...m, liveStatus: live.status }

    if (live.status === 'post') {
      return {
        ...m,
        homeScore: live.homeScore, awayScore: live.awayScore,
        homeShootout: live.homeShootout, awayShootout: live.awayShootout,
        liveStatus: 'post', goals: live.goals || [], redCards: live.redCards || [],
      }
    }
    if (live.status === 'in') {
      return {
        ...m,
        liveStatus: 'in', liveHomeScore: live.homeScore, liveAwayScore: live.awayScore,
        liveClock: live.clock, liveDetail: live.statusDetail,
        goals: live.goals || [], redCards: live.redCards || [],
      }
    }
    return m
  })

  // Step 2: resolve again now that live scores are merged, so e.g. an R32
  // match that just finished immediately populates the R16 slot that depends
  // on it, without waiting for the next data.js patch.
  const fixtures = resolveKnockoutFixtures(groupFixtures, liveMerged)

  return { fixtures, loading, liveResults }
}
