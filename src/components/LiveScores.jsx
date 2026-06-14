import React, { useState, useEffect } from 'react'
import styles from './LiveScores.module.css'

export default function LiveScores() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetchScores = async () => {
      try {
        const res = await fetch('/api/live-scores', { cache: 'no-store' })
        const json = await res.json()
        if (mounted) setData(json)
      } catch (e) {
        if (mounted) setError(e.message)
      }
    }
    fetchScores()
    const interval = setInterval(fetchScores, 60000)
    const onVisible = () => { if (document.visibilityState === 'visible') fetchScores() }
    document.addEventListener('visibilitychange', onVisible)
    return () => { mounted = false; clearInterval(interval); document.removeEventListener('visibilitychange', onVisible) }
  }, [])

  if (error || !data) return null
  const liveMatches = (data.events || []).filter(ev => ev.status === 'in')
  if (liveMatches.length === 0) return null

  return (
    <div className={styles.wrap}>
      <button className={styles.header} onClick={() => setCollapsed(c => !c)}>
        <span className={styles.liveDot} />
        <span className={styles.title}>LIVE — {liveMatches.length} match{liveMatches.length !== 1 ? 'es' : ''} in progress</span>
        <span className={styles.chevron}>{collapsed ? '▼' : '▲'}</span>
      </button>
      {!collapsed && (
        <div className={styles.matches}>
          {liveMatches.map(ev => {
            const hasPossession = ev.home.possession != null && ev.away.possession != null
            const allEvents = [
              ...(ev.goals || []).map(g => ({ ...g, kind: 'goal' })),
              ...(ev.redCards || []).map(r => ({ ...r, kind: 'red' })),
            ].sort((a, b) => {
              const n = m => { const x = (m||'').match(/(\d+)/); return x ? parseInt(x[1],10) : 999 }
              return n(a.minute) - n(b.minute)
            })

            return (
              <div key={ev.id} className={styles.match}>
                <div className={styles.matchTop}>
                  <div className={styles.teams}>
                    <span className={`${styles.team} ${ev.home.winner ? styles.winning : ''}`}>
                      {ev.home.name} <span className={styles.score}>{ev.home.score}</span>
                    </span>
                    <span className={styles.sep}>–</span>
                    <span className={`${styles.team} ${ev.away.winner ? styles.winning : ''}`}>
                      <span className={styles.score}>{ev.away.score}</span> {ev.away.name}
                    </span>
                  </div>
                  <span className={styles.clock}>{ev.clock} {ev.statusDetail}</span>
                </div>

                {hasPossession && (
                  <div className={styles.possessionWrap}>
                    <div className={styles.possessionLabels}>
                      <span>{ev.home.possession}%</span>
                      <span className={styles.possessionTitle}>Possession</span>
                      <span>{ev.away.possession}%</span>
                    </div>
                    <div className={styles.possessionBar}>
                      <div className={styles.possessionHome} style={{ width: `${ev.home.possession}%` }} />
                      <div className={styles.possessionAway} style={{ width: `${ev.away.possession}%` }} />
                    </div>
                  </div>
                )}

                {allEvents.length > 0 && (
                  <div className={styles.events}>
                    {allEvents.map((e, i) => (
                      <div key={i} className={styles.eventItem}>
                        <span className={styles.eventIcon}>{e.kind === 'goal' ? '⚽' : '🟥'}</span>
                        <span className={styles.eventText}>
                          {e.name}{e.ownGoal ? ' (OG)' : ''}{e.minute ? ` ${e.minute}` : ''}
                        </span>
                        <span className={styles.eventTeam}>{e.team}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
