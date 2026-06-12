import React, { useState } from 'react'
import { GROUP_LABELS, FIXTURES } from '../data.js'
import { groupStandings } from '../utils.js'
import styles from './TableView.module.css'

function GroupTable({ group, predictions, fixtures }) {
  const rows = groupStandings(group, predictions, fixtures)
  const hasPred = rows.some(r => r.P > 0)

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
        {groups.map(g => <GroupTable key={g} group={g} predictions={{}} fixtures={fixtures} />)}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}><span className={`${styles.pip} ${styles.pipGold}`}/> Automatic qualification (top 2)</div>
        <div className={styles.legendItem}><span className={`${styles.pip} ${styles.pipGreen}`}/> Possible 3rd-place qualification (best 8)</div>
      </div>
    </div>
  )
}
