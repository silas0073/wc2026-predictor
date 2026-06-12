import React, { useState } from 'react'
import { FIXTURES, GROUP_LABELS } from '../data.js'
import { teamObj, formatDate } from '../utils.js'
import styles from './Results.module.css'

export default function Results({ predictions = {}, fixtures = FIXTURES }) {
  const [filterGroup, setFilterGroup] = useState('ALL')

  const played = fixtures.filter(f => f.homeScore !== null)
  const filtered = filterGroup === 'ALL' ? played : played.filter(f => f.group === filterGroup)

  if (played.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.pageHeader}>
          <h2>Results</h2>
          <p>Completed matches will appear here</p>
        </div>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⏳</div>
          <div className={styles.emptyTitle}>Tournament hasn't started yet</div>
          <div className={styles.emptySub}>The opening match (Mexico vs South Africa) kicks off June 11, 2026. Check back once matches are played.</div>
        </div>
      </div>
    )
  }

  const byDate = filtered.reduce((acc, f) => {
    if (!acc[f.date]) acc[f.date] = []
    acc[f.date].push(f)
    return acc
  }, {})
  const dates = Object.keys(byDate).sort((a,b) => b.localeCompare(a))

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <h2>Results</h2>
        <p>{played.length} of 48 group stage matches played</p>
      </div>

      <div className={styles.filters}>
        <button className={`${styles.fBtn} ${filterGroup==='ALL' ? styles.fActive : ''}`} onClick={() => setFilterGroup('ALL')}>All</button>
        {GROUP_LABELS.map(g => (
          <button key={g} className={`${styles.fBtn} ${filterGroup===g ? styles.fActive : ''}`} onClick={() => setFilterGroup(g)}>Grp {g}</button>
        ))}
      </div>

      {dates.map(date => (
        <div key={date} className={styles.dateBlock}>
          <div className={styles.dateHeader}>{formatDate(date)}</div>
          {byDate[date].map(f => {
            const home = teamObj(f.home)
            const away = teamObj(f.away)
            const hw = f.homeScore > f.awayScore
            const aw = f.awayScore > f.homeScore
            const pred = predictions[f.id]
            const hasPred = pred?.h != null

            return (
              <div key={f.id} className={styles.row}>
                <span className={styles.grp}>Grp {f.group}</span>
                <div className={styles.teams}>
                  <div className={`${styles.team} ${styles.teamL}`}>
                    <span className={styles.flag}>{home.flag}</span>
                    <span className={`${styles.name} ${hw ? styles.winner : ''}`}>{home.name}</span>
                  </div>
                  <div className={styles.scoreBox}>
                    <span className={`${styles.s} ${hw ? styles.sWin : ''}`}>{f.homeScore}</span>
                    <span className={styles.sdash}>–</span>
                    <span className={`${styles.s} ${aw ? styles.sWin : ''}`}>{f.awayScore}</span>
                    {hasPred && (
                      <span className={styles.predBelow}>
                        {pred.h}–{pred.a}
                        {pred.h === f.homeScore && pred.a === f.awayScore
                          ? <span className={styles.predExact}> ✓</span>
                          : (pred.h > pred.a) === hw || (pred.h === pred.a && !hw && !aw)
                            ? <span className={styles.predResult}> ~</span>
                            : <span className={styles.predWrong}> ✗</span>
                        }
                      </span>
                    )}
                  </div>
                  <div className={`${styles.team} ${styles.teamR}`}>
                    <span className={`${styles.name} ${aw ? styles.winner : ''}`}>{away.name}</span>
                    <span className={styles.flag}>{away.flag}</span>
                  </div>
                </div>

                {(f.goals?.length > 0 || f.redCards?.length > 0) && (
                  <div className={styles.events}>
                    {f.goals?.length > 0 && (
                      <div className={styles.eventLine}>
                        <span className={styles.eventIcon}>⚽</span>
                        <span className={styles.eventList}>
                          {f.goals.map((g, i) => (
                            <span key={i} className={styles.eventItem}>
                              {g.name}{g.ownGoal ? ' (OG)' : ''}{g.minute ? ` ${g.minute}` : ''}
                              {g.assist ? <span className={styles.assistNote}> (ast. {g.assist})</span> : null}
                              {i < f.goals.length - 1 ? ',' : ''}
                            </span>
                          ))}
                        </span>
                      </div>
                    )}
                    {f.redCards?.length > 0 && (
                      <div className={styles.eventLine}>
                        <span className={styles.eventIcon}>🟥</span>
                        <span className={styles.eventList}>
                          {f.redCards.map((r, i) => (
                            <span key={i} className={styles.eventItem}>
                              {r.name}{r.minute ? ` ${r.minute}` : ''}
                              {i < f.redCards.length - 1 ? ',' : ''}
                            </span>
                          ))}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
