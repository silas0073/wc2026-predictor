import React, { useState, useEffect } from 'react'
import { TEAMS, FIXTURES } from '../data.js'
import styles from './GoldenBoot.module.css'

// Live scorer data is fetched from /api/scorers (ESPN proxy)

// Pre-tournament star players to watch
export const ONES_TO_WATCH = [
  { name: 'Kylian Mbappé',      team: 'FRA', age: 27, goals2022: 8,  info: 'Golden Boot favourite, PSG' },
  { name: 'Erling Haaland',     team: 'NOR', age: 25, goals2022: null, info: 'First World Cup, Man City' },
  { name: 'Lionel Messi',       team: 'ARG', age: 38, goals2022: 7,  info: 'Defending champion, Inter Miami' },
  { name: 'Vinicius Jr.',       team: 'BRA', age: 25, goals2022: 0,  info: 'Ballon d\'Or winner, Real Madrid' },
  { name: 'Lamine Yamal',       team: 'ESP', age: 18, goals2022: null, info: 'Teen sensation, Barcelona' },
  { name: 'Bukayo Saka',        team: 'ENG', age: 24, goals2022: null, info: 'Arsenal captain, England key man' },
  { name: 'Pedri',              team: 'ESP', age: 23, goals2022: null, info: 'Barcelona midfield maestro' },
  { name: 'Rodri',              team: 'ESP', age: 28, goals2022: null, info: 'Ballon d\'Or 2024, Man City' },
  { name: 'Jude Bellingham',    team: 'ENG', age: 22, goals2022: null, info: 'Real Madrid, England captain' },
  { name: 'Raphinha',           team: 'BRA', age: 27, goals2022: null, info: 'Barcelona, Brazil\'s creator' },
  { name: 'Julian Alvarez',     team: 'ARG', age: 24, goals2022: 4,  info: 'Man City, Argentina striker' },
  { name: 'Ruben Neves',        team: 'POR', age: 28, goals2022: null, info: 'Al-Hilal, Portugal engine' },
  { name: 'Gavi',               team: 'ESP', age: 24, goals2022: null, info: 'Barcelona, Spain\'s heartbeat' },
  { name: 'Florian Wirtz',      team: 'GER', age: 21, goals2022: null, info: 'Leverkusen, Germany\'s star' },
  { name: 'Rasmus Hojlund',     team: 'DEN', age: 22, goals2022: null, info: 'Man United striker — wait he\'s not in WC' },
  { name: 'Donyell Malen',      team: 'NED', age: 26, goals2022: null, info: 'Netherlands attacker' },
  { name: 'Cody Gakpo',         team: 'NED', age: 25, goals2022: 3,  info: 'Liverpool, Netherlands danger man' },
  { name: 'Memphis Depay',      team: 'NED', age: 30, goals2022: null, info: 'Netherlands veteran' },
  { name: 'Richarlison',        team: 'BRA', age: 27, goals2022: 3,  info: 'Tottenham, Brazil striker' },
  { name: 'Achraf Hakimi',      team: 'MAR', age: 27, goals2022: null, info: 'PSG, Morocco captain' },
]
  .filter(p => TEAMS[p.team]) // only teams in tournament

export default function GoldenBoot() {
  const [tab, setTab] = useState('top')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const fetchResults = async () => {
      try {
        const res = await fetch('/api/results', { cache: 'no-store' })
        const data = await res.json()
        if (mounted) {
          setResults(data.results || {})
          setLoading(false)
        }
      } catch (e) {
        if (mounted) { setError(e.message); setLoading(false) }
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

  // Aggregate goals across every match played so far in the tournament
  // (own goals don't count toward the Golden Boot)
  const scorerMap = {}
  if (results) {
    Object.values(results).forEach(match => {
      if (match.status !== 'post' && match.status !== 'in') return
      ;(match.goals || []).forEach(g => {
        if (g.ownGoal) return
        const key = `${g.name}|${g.team}`
        if (!scorerMap[key]) scorerMap[key] = { name: g.name, team: g.team, goals: 0 }
        scorerMap[key].goals += 1
      })
    })
  }

  const hasLiveData = Object.keys(scorerMap).length > 0
  const topScorers = Object.values(scorerMap).sort((a,b) => b.goals - a.goals)

  // Group ones to watch by group
  const byGroup = ONES_TO_WATCH.reduce((acc, p) => {
    const g = TEAMS[p.team]?.group
    if (!g) return acc
    if (!acc[g]) acc[g] = []
    acc[g].push(p)
    return acc
  }, {})

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <h2>🥾 Golden Boot</h2>
        <p>Top scorers & players to watch</p>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab==='top' ? styles.tabActive : ''}`} onClick={() => setTab('top')}>
          Top Scorers
        </button>
        <button className={`${styles.tab} ${tab==='watch' ? styles.tabActive : ''}`} onClick={() => setTab('watch')}>
          Ones to Watch
        </button>
      </div>

      {tab === 'top' && (
        <>
          {loading ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>⏳</div>
              <div className={styles.emptyTitle}>Loading scorers…</div>
            </div>
          ) : !hasLiveData ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>⚽</div>
              <div className={styles.emptyTitle}>No goals yet</div>
              <div className={styles.emptySub}>Goal totals accumulate automatically as matches are completed across the tournament.</div>
            </div>
          ) : (
            <div className={styles.scorerList}>
              {topScorers.map((p, i) => {
                const team = TEAMS[p.team]
                return (
                  <div key={i} className={`${styles.scorerRow} ${i === 0 ? styles.scorerTop : ''}`}>
                    <div className={styles.scorerRank}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}`}
                    </div>
                    <div className={styles.scorerInfo}>
                      <span className={styles.scorerName}>{p.name}</span>
                      <span className={styles.scorerTeam}>{team?.flag} {team?.name}</span>
                    </div>
                    <div className={styles.scorerStats}>
                      <div className={styles.statBig}>
                        <span className={styles.statNum}>{p.goals}</span>
                        <span className={styles.statLabel}>goals</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {tab === 'watch' && (
        <div className={styles.watchList}>
          {['A','B','C','D','E','F','G','H','I','J','K','L'].map(g => {
            const players = byGroup[g]
            if (!players?.length) return null
            return (
              <div key={g} className={styles.watchGroup}>
                <div className={styles.watchGroupLabel}>Group {g}</div>
                {players.map((p, i) => {
                  const team = TEAMS[p.team]
                  return (
                    <div key={i} className={styles.watchRow}>
                      <span className={styles.watchFlag}>{team?.flag}</span>
                      <div className={styles.watchInfo}>
                        <span className={styles.watchName}>{p.name}</span>
                        <span className={styles.watchDetail}>{p.info}{p.goals2022 != null ? ` · ${p.goals2022} goals in 2022` : ''}</span>
                      </div>
                      <span className={styles.watchAge}>{p.age}</span>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
