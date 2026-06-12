import React, { useState, useEffect } from 'react'
import styles from './LiveScores.module.css'

// Map ESPN abbreviations to our team codes where they differ
const CODE_MAP = {
  'RSA': 'RSA', 'MEX': 'MEX', 'KOR': 'KOR', 'CZE': 'CZE',
  'CAN': 'CAN', 'BIH': 'BIH', 'SUI': 'SUI', 'QAT': 'QAT',
  'BRA': 'BRA', 'MAR': 'MAR', 'SCO': 'SCO', 'HAI': 'HAI',
  'USA': 'USA', 'AUS': 'AUS', 'PAR': 'PAR', 'TUR': 'TUR',
  'GER': 'GER', 'ECU': 'ECU', 'CIV': 'CIV', 'CUW': 'CUW',
  'NED': 'NED', 'JPN': 'JPN', 'SWE': 'SWE', 'TUN': 'TUN',
  'BEL': 'BEL', 'EGY': 'EGY', 'IRN': 'IRN', 'NZL': 'NZL',
  'ESP': 'ESP', 'URU': 'URU', 'KSA': 'SAU', 'CPV': 'CPV',
  'FRA': 'FRA', 'SEN': 'SEN', 'NOR': 'NOR', 'IRQ': 'IRQ',
  'ARG': 'ARG', 'AUT': 'AUT', 'ALG': 'ALG', 'JOR': 'JOR',
  'POR': 'POR', 'COL': 'COL', 'UZB': 'UZB', 'COD': 'COD',
  'ENG': 'ENG', 'CRO': 'CRO', 'PAN': 'PAN', 'GHA': 'GHA',
}

export default function LiveScores() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetchScores = async () => {
      try {
        const res = await fetch('/api/live-scores')
        const json = await res.json()
        if (mounted) setData(json)
      } catch (e) {
        if (mounted) setError(e.message)
      }
    }
    fetchScores()
    const interval = setInterval(fetchScores, 60000) // poll every 60s
    return () => { mounted = false; clearInterval(interval) }
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
          {liveMatches.map(ev => (
            <div key={ev.id} className={styles.match}>
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
          ))}
        </div>
      )}
    </div>
  )
}
