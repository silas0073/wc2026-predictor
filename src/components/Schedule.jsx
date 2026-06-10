import React, { useState } from 'react'
import { FIXTURES, GROUP_LABELS } from '../data.js'
import { teamObj, formatDate } from '../utils.js'
import styles from './Schedule.module.css'

export default function Schedule({ predictions }) {
  const [filterGroup, setFilterGroup] = useState('ALL')

  const upcoming = FIXTURES.filter(f => f.homeScore === null)
  const filtered = filterGroup === 'ALL' ? upcoming : upcoming.filter(f => f.group === filterGroup)

  // Group by date
  const byDate = filtered.reduce((acc, f) => {
    if (!acc[f.date]) acc[f.date] = []
    acc[f.date].push(f)
    return acc
  }, {})
  const dates = Object.keys(byDate).sort()

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <h2>Schedule</h2>
        <p>All upcoming group stage fixtures</p>
      </div>

      <div className={styles.filters}>
        <button
          className={`${styles.fBtn} ${filterGroup==='ALL' ? styles.fActive : ''}`}
          onClick={() => setFilterGroup('ALL')}
        >All Groups</button>
        {GROUP_LABELS.map(g => (
          <button
            key={g}
            className={`${styles.fBtn} ${filterGroup===g ? styles.fActive : ''}`}
            onClick={() => setFilterGroup(g)}
          >Grp {g}</button>
        ))}
      </div>

      {dates.map(date => (
        <div key={date} className={styles.dateBlock}>
          <div className={styles.dateHeader}>{formatDate(date)}</div>
          {byDate[date].map(f => {
            const home = teamObj(f.home)
            const away = teamObj(f.away)
            const pred = predictions[f.id]
            const hasPred = pred?.h != null

            return (
              <div key={f.id} className={`${styles.row} ${hasPred ? styles.rowPred : ''}`}>
                <div className={styles.groupBadge}>Grp {f.group}</div>
                <div className={styles.teams}>
                  <div className={styles.team}>
                    <span className={styles.flag}>{home.flag}</span>
                    <span className={styles.name}>{home.name}</span>
                    <span className={styles.code}>{f.home}</span>
                  </div>
                  <span className={styles.sep}>vs</span>
                  <div className={`${styles.team} ${styles.teamR}`}>
                    <span className={styles.name}>{away.name}</span>
                    <span className={styles.code}>{f.away}</span>
                    <span className={styles.flag}>{away.flag}</span>
                  </div>
                </div>
                <div className={styles.right}>
                  {hasPred ? (
                    <span className={styles.predBadge}>{pred.h} – {pred.a}</span>
                  ) : (
                    <span className={styles.tbd}>TBD</span>
                  )}
                </div>
                <div className={styles.venue}>{f.venue}</div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
