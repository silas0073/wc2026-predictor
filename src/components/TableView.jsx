import React, { useState } from 'react'
import { GROUP_LABELS, FIXTURES, TEAMS } from '../data.js'
import { groupStandings, getQualifiedTeams, getThirdPlaceStandings } from '../utils.js'
import styles from './TableView.module.css'

function ThirdPlaceTracker({ fixtures }) {
  const thirds = getThirdPlaceStandings(fixtures)
  const GROUPS_ALL = ['A','B','C','D','E','F','G','H','I','J','K','L']
  const finishedGroups = GROUPS_ALL.filter(g => {
    const gf = fixtures.filter(f => f.group === g)
    return gf.length > 0 && gf.every(f => f.homeScore !== null && f.awayScore !== null)
  })
  const unfinished = 12 - finishedGroups.length

  if (thirds.length === 0) return null

  return (
    <div className={styles.thirdTracker}>
      <div className={styles.thirdHeader}>
        <span>Best 3rd-Place Teams</span>
        <span className={styles.thirdSub}>{finishedGroups.length}/12 groups complete · top 8 qualify</span>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th><th>Team</th><th>Grp</th><th>Pts</th><th>GD</th><th>GF</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {thirds.map((t, i) => {
            const team = TEAMS[t.code]
            return (
              <tr key={t.code} className={
                t.status === 'qualified' ? styles.qualify :
                t.status === 'eliminated' ? styles.eliminated :
                styles.maybe
              }>
                <td className={styles.pos}>{i + 1}</td>
                <td className={styles.teamCell}>
                  <span>{team?.flag || ''}</span>
                  <span className={styles.tname}>{team?.name || t.code}</span>
                  {t.status === 'qualified' && <span className={styles.qBadge} title="Confirmed qualified">✓</span>}
                </td>
                <td>{t.group}</td>
                <td className={styles.pts}>{t.pts}</td>
                <td className={t.gd > 0 ? styles.pos_gd : t.gd < 0 ? styles.neg_gd : ''}>{t.gd > 0 ? `+${t.gd}` : t.gd}</td>
                <td>{t.gf}</td>
                <td className={styles.t3status}>
                  {t.status === 'qualified' ? <span className={styles.statusQ}>Qualified</span> :
                   t.status === 'eliminated' ? <span className={styles.statusE}>Eliminated</span> :
                   <span className={styles.statusP}>Pending ({unfinished} left)</span>}
                </td>
              </tr>
            )
          })}
          {Array.from({ length: Math.max(0, 8 - thirds.length) }).map((_, i) => (
            <tr key={`tbd-${i}`} className={styles.tbd}>
              <td className={styles.pos}>{thirds.length + i + 1}</td>
              <td className={styles.teamCell}><span className={styles.tbdCell}>—</span></td>
              <td>—</td><td>—</td><td>—</td><td>—</td>
              <td className={styles.t3status}><span className={styles.statusP}>Pending</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function GroupTable({ group, predictions, fixtures, qualified }) {
  const rows = groupStandings(group, predictions, fixtures)

  return (
    <div className={styles.groupBlock}>
      <div className={styles.groupHeader}>
        <span className={styles.groupLabel}>Group {group}</span>

      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th>
            <th className={styles.hideSm}>GF</th><th className={styles.hideSm}>GA</th>
            <th>GD</th><th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.code} className={i < 2 ? styles.qualify : i === 2 ? styles.maybe : ''}>
              <td className={styles.pos}>{i+1}</td>
              <td className={styles.teamCell}>
                <span>{r.team.flag}</span>
                <span className={styles.tname}>{r.team.name}</span>
                <span className={styles.tcode}>{r.code}</span>
                {qualified.has(r.code) && <span className={styles.qBadge} title="Qualified for knockout stage">✓</span>}
              </td>
              <td>{r.P}</td><td>{r.W}</td><td>{r.D}</td><td>{r.L}</td>
              <td className={styles.hideSm}>{r.GF}</td>
              <td className={styles.hideSm}>{r.GA}</td>
              <td className={r.GD > 0 ? styles.pos_gd : r.GD < 0 ? styles.neg_gd : ''}>{r.GD > 0 ? `+${r.GD}` : r.GD}</td>
              <td className={styles.pts}>{r.Pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function TableView({ predictions, fixtures = FIXTURES }) {
  const [view, setView] = useState('all')

  const groups = view === 'all' ? GROUP_LABELS : [view]
  const qualified = getQualifiedTeams(fixtures)

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <h2>Group Standings</h2>
        <p>Live standings</p>
      </div>

      <div className={styles.filters}>
        <button className={`${styles.fBtn} ${view==='all' ? styles.fActive : ''}`} onClick={() => setView('all')}>All Groups</button>
        {GROUP_LABELS.map(g => (
          <button key={g} className={`${styles.fBtn} ${view===g ? styles.fActive : ''}`} onClick={() => setView(g)}>Group {g}</button>
        ))}
      </div>

      <div className={`${styles.grid} ${view !== 'all' ? styles.single : ''}`}>
        {groups.map(g => <GroupTable key={g} group={g} predictions={{}} fixtures={fixtures} qualified={qualified} />)}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}><span className={`${styles.pip} ${styles.pipGold}`}/> Automatic qualification (top 2)</div>
        <div className={styles.legendItem}><span className={`${styles.pip} ${styles.pipGreen}`}/> Possible 3rd-place qualification (best 8 of 12)</div>
        <div className={styles.legendItem}><span className={styles.qBadge}>✓</span> Confirmed qualified for knockout stage</div>
      </div>

      <ThirdPlaceTracker fixtures={fixtures} />
    </div>
  )
}
