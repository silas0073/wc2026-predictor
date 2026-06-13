import React, { useState } from 'react'
import { TEAMS, GROUPS, GROUP_LABELS } from '../data.js'
import { TEAM_REVIEWS, predictOutcome } from '../teamReviews.js'
import { formLabel } from '../odds.js'
import styles from './Teams.module.css'

export default function Teams() {
  const [filterGroup, setFilterGroup] = useState('ALL')
  const [search, setSearch] = useState('')

  const allCodes = GROUP_LABELS.flatMap(g => GROUPS[g])

  const filtered = allCodes.filter(code => {
    const t = TEAMS[code]
    if (filterGroup !== 'ALL' && t.group !== filterGroup) return false
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      if (!t.name.toLowerCase().includes(q) && !code.toLowerCase().includes(q)) return false
    }
    return true
  })

  // Sort by strength descending within filtered list when searching/all,
  // otherwise keep group order
  const sorted = filterGroup === 'ALL' && !search.trim()
    ? [...filtered].sort((a,b) => (TEAMS[b].strength + (TEAMS[b].host?0.4:0)) - (TEAMS[a].strength + (TEAMS[a].host?0.4:0)))
    : filtered

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <h2>Teams</h2>
        <p>Scouting reports & likely outcomes for all 48 nations</p>
      </div>

      <div className={styles.controls}>
        <input
          className={styles.search}
          placeholder="Search team or code…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={styles.groupTabsOuter}>
          <div className={styles.groupTabsInner}>
            <button className={`${styles.gTab} ${filterGroup==='ALL' ? styles.gTabActive : ''}`} onClick={() => setFilterGroup('ALL')}>All</button>
            {GROUP_LABELS.map(g => (
              <button key={g} className={`${styles.gTab} ${filterGroup===g ? styles.gTabActive : ''}`} onClick={() => setFilterGroup(g)}>Grp {g}</button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.list}>
        {sorted.map(code => {
          const t = TEAMS[code]
          const outcome = predictOutcome(code)
          const review = TEAM_REVIEWS[code]
          return (
            <div key={code} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.flag}>{t.flag}</span>
                <div className={styles.headerInfo}>
                  <div className={styles.nameRow}>
                    <span className={styles.name}>{t.name}</span>
                    {t.host && <span className={styles.hostBadge}>HOST</span>}
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.group}>Group {t.group}</span>
                    <span className={styles.strength}>Strength {t.strength.toFixed(1)}</span>
                    <span className={styles.form} title="Recent form (last 5)">{formLabel(code)}</span>
                  </div>
                </div>
              </div>
              <p className={styles.review}>{review}</p>
              <div className={`${styles.outcome} ${styles['tier_' + outcome.tier]}`}>
                <span className={styles.outcomeLabel}>{outcome.label}</span>
                <span className={styles.outcomeDetail}>{outcome.detail}</span>
              </div>
            </div>
          )
        })}
      </div>

      {sorted.length === 0 && (
        <div className={styles.empty}>No teams match your search</div>
      )}
    </div>
  )
}
