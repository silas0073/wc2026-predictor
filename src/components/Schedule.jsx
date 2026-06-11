import React, { useState } from 'react'
import { FIXTURES, GROUP_LABELS } from '../data.js'
import { teamObj, formatAESTDate, formatAEST } from '../utils.js'
import styles from './Schedule.module.css'

export default function Schedule({ predictions }) {
  const [filterGroup, setFilterGroup] = useState('ALL')
  const [showPlayed, setShowPlayed] = useState(true)

  const filtered = FIXTURES.filter(f =>
    (filterGroup === 'ALL' || f.group === filterGroup) &&
    (showPlayed || f.homeScore === null)
  )

  // Group by AEST date (derived from kickoff UTC)
  const byDate = filtered.reduce((acc, f) => {
    const aestDate = f.kickoff
      ? new Date(new Date(f.kickoff).getTime() + 10*60*60*1000).toISOString().slice(0,10)
      : f.date
    if (!acc[aestDate]) acc[aestDate] = []
    acc[aestDate].push(f)
    return acc
  }, {})
  const dates = Object.keys(byDate).sort()

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <h2>Schedule</h2>
        <p>All fixtures · times in AEST</p>
      </div>

      <div className={styles.filterRow}>
        <div className={styles.filters}>
          <button className={`${styles.fBtn} ${filterGroup==='ALL' ? styles.fActive : ''}`} onClick={() => setFilterGroup('ALL')}>All</button>
          {GROUP_LABELS.map(g => (
            <button key={g} className={`${styles.fBtn} ${filterGroup===g ? styles.fActive : ''}`} onClick={() => setFilterGroup(g)}>Grp {g}</button>
          ))}
        </div>
        <button
          className={`${styles.toggleBtn} ${showPlayed ? styles.toggleOn : ''}`}
          onClick={() => setShowPlayed(p => !p)}
        >
          {showPlayed ? '✓ Showing results' : 'Show results'}
        </button>
      </div>

      {dates.map(date => (
        <div key={date} className={styles.dateBlock}>
          <div className={styles.dateHeader}>
            {new Date(date + 'T12:00:00').toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' })}
          </div>
          {byDate[date].map(f => {
            const home = teamObj(f.home)
            const away = teamObj(f.away)
            const isPlayed = f.homeScore !== null
            const pred = predictions[f.id]
            const hasPred = pred?.h != null

            return (
              <div key={f.id} className={`${styles.row} ${isPlayed ? styles.rowPlayed : hasPred ? styles.rowPred : ''}`}>
                <div className={styles.rowMeta}>
                  <span className={styles.grpBadge}>Grp {f.group}</span>
                  <span className={styles.time}>
                    {isPlayed
                      ? <span className={styles.ftBadge}>FT</span>
                      : formatAEST(f.kickoff)
                    }
                  </span>
                </div>

                <div className={styles.matchRow}>
                  <div className={styles.team}>
                    <span className={styles.flag}>{home.flag}</span>
                    <span className={styles.name}>{home.name}</span>
                  </div>

                  <div className={styles.scoreArea}>
                    {isPlayed ? (
                      <div className={styles.scoreStack}>
                        <span className={styles.liveScore}>
                          <span className={f.homeScore > f.awayScore ? styles.win : ''}>{f.homeScore}</span>
                          <span className={styles.sdash}>–</span>
                          <span className={f.awayScore > f.homeScore ? styles.win : ''}>{f.awayScore}</span>
                        </span>
                        {hasPred && (
                          <span className={styles.predBelow}>
                            pred: {pred.h}–{pred.a}
                            {pred.h === f.homeScore && pred.a === f.awayScore
                              ? <span className={styles.predExact}> ✓</span>
                              : pred.h - pred.a === f.homeScore - f.awayScore ||
                                (pred.h > pred.a) === (f.homeScore > f.awayScore) ||
                                (pred.h === pred.a) === (f.homeScore === f.awayScore)
                                ? <span className={styles.predResult}> ✓result</span>
                                : <span className={styles.predWrong}> ✗</span>
                            }
                          </span>
                        )}
                      </div>
                    ) : hasPred ? (
                      <span className={styles.predScore}>{pred.h} – {pred.a}</span>
                    ) : (
                      <span className={styles.vsText}>vs</span>
                    )}
                  </div>

                  <div className={`${styles.team} ${styles.teamR}`}>
                    <span className={styles.name}>{away.name}</span>
                    <span className={styles.flag}>{away.flag}</span>
                  </div>
                </div>

                <div className={styles.venue}>{f.venue}</div>
              </div>
            )
          })}
        </div>
      ))}

      {dates.length === 0 && (
        <div className={styles.empty}>No fixtures match your filter</div>
      )}
    </div>
  )
}
