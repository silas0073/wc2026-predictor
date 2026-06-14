import { useState, useEffect } from 'react'
import { FIXTURES } from './data.js'

// Fetches live results from /api/results and returns a merged fixture list
// where played/in-progress matches have real scores overlaid onto the
// static FIXTURES data. Falls back to static data.js scores if the API
// fails or hasn't covered a fixture yet.
export function useLiveResults() {
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
    const interval = setInterval(fetchResults, 60000) // refresh every 60s

    const onVisible = () => { if (document.visibilityState === 'visible') fetchResults() }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      mounted = false
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  // Merge live results onto FIXTURES
  const fixtures = FIXTURES.map(f => {
    if (!liveResults) return f
    const live = liveResults[`${f.home}-${f.away}`]
    if (!live) return f // no live data yet, keep static (data.js) values

    // If live match is finished, use live score
    if (live.status === 'post') {
      return { ...f, homeScore: live.homeScore, awayScore: live.awayScore, liveStatus: 'post', goals: f.goals?.length ? f.goals : (live.goals || []), redCards: f.redCards?.length ? f.redCards : (live.redCards || []) }
    }
    // If in progress, expose live status but don't set final score
    if (live.status === 'in') {
      return { ...f, liveStatus: 'in', liveHomeScore: live.homeScore, liveAwayScore: live.awayScore, liveClock: live.clock, liveDetail: live.statusDetail, goals: f.goals?.length ? f.goals : (live.goals || []), redCards: f.redCards?.length ? f.redCards : (live.redCards || []) }
    }
    return f
  })

  return { fixtures, loading, liveResults }
}
