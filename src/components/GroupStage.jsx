import React, { useState } from 'react'
import SavedPredictions from './SavedPredictions.jsx'
import { FIXTURES, GROUP_LABELS } from '../data.js'
import { TEAMS } from '../data.js'
import { groupStandings, autoFillGroup, teamObj, formatDate } from '../utils.js'
import { matchOdds, formLabel, toDecimalOdds } from '../odds.js'
import styles from './GroupStage.module.css'

function ScoreInput({ value, onChange, color }) {
  return (
    <div className={styles.scoreInput}>
      <button onClick={() => onChange(Math.max(0, (value ?? 0) - 1))} aria-label="decrease">−</button>
      <span className={styles.scoreVal} style={{ color: value != null ? color : undefined }}>
        {value != null ? value : '·'}
      </span>
      <button onClick={() => onChange((value ?? 0) + 1)} aria-label="increase">+</button>
    </div>
  )
}

function StandingsTable({ group, predictions, fixtures }) {
  const rows = groupStandings(group, predictions, fixtures)
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.code} className={i < 2 ? styles.qualify : ''}>
            <td className={styles.pos}>{i+1}</td>
            <td className={styles.teamCell}>
              <span>{r.team.flag}</span>
              <span className={styles.tname}>{r.team.name}</span>
              <span className={styles.tcode}>{r.code}</span>
            </td>
            <td>{r.P}</td><td>{r.W}</td><td>{r.D}</td><td>{r.L}</td>
            <td className={r.GD > 0 ? styles.pos_gd : r.GD < 0 ? styles.neg_gd : ''}>
              {r.GD > 0 ? `+${r.GD}` : r.GD}
            </td>
            <td className={styles.pts}>{r.Pts}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function OddsBar({ homeCode, awayCode }) {
  const { homeWin, draw, awayWin, fav, favLabel } = matchOdds(homeCode, awayCode)
  const ht = TEAMS[homeCode], at = TEAMS[awayCode]
  return (
    <div className={styles.oddsWrap}>
      <div className={styles.oddsTeams}>
        <span className={styles.oddsTeamLabel} style={{ color: fav==='home' ? 'var(--green)' : 'var(--muted)' }}>
          {ht?.name} {fav==='home' && '★'}
        </span>
        <span className={styles.oddsDraw2}>{draw}% draw</span>
        <span className={styles.oddsTeamLabel} style={{ color: fav==='away' ? 'var(--green)' : 'var(--muted)', textAlign:'right' }}>
          {fav==='away' && '★ '}{at?.name}
        </span>
      </div>
      <div className={styles.oddsBar}>
        <div className={styles.oddsHome} style={{ width: homeWin + '%' }} />
        <div className={styles.oddsDraw} style={{ width: draw + '%' }} />
        <div className={styles.oddsAway} style={{ width: awayWin + '%' }} />
      </div>
      <div className={styles.oddsLabels}>
        <span className={styles.oddsNum} style={{ color: fav==='home' ? 'var(--green)' : 'var(--muted)' }}>{homeWin}%</span>
        <span className={`${styles.oddsFav} ${fav==='even' ? styles.oddsFavEven : ''}`}>{fav==='even' ? 'Even' : 'Favourite ★'}</span>
        <span className={styles.oddsNum} style={{ color: fav==='away' ? 'var(--green)' : 'var(--muted)' }}>{awayWin}%</span>
      </div>
      <div className={styles.formRow}>
        <span className={styles.formDots} title="Form">{formLabel(homeCode)}</span>
        <span className={styles.formLabel}>last 5</span>
        <span className={styles.formDots} title="Form">{formLabel(awayCode)}</span>
      </div>
    </div>
  )
}


export default function GroupStage({ predictions, onPredict, onBulkPredict, onLoad, onReplace, fixtures: liveFixtures = FIXTURES, bracketPicks = {} }) {
  const [activeGroup, setActiveGroup] = useState('A')

  const fixtures = liveFixtures.filter(f => f.group === activeGroup)
  const upcoming = fixtures.filter(f => f.homeScore === null)

  const handleAutoFill = () => {
    const filled = autoFillGroup(activeGroup, predictions)
    onBulkPredict(filled)
  }

  const clearGroup = () => {
    const cleared = { ...predictions }
    upcoming.forEach(f => delete cleared[f.id])
    onReplace(cleared)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <h2>Group Stage Predictor</h2>
        <p>Pick scores for each match — standings update live</p>
      </div>

      <SavedPredictions predictions={predictions} bracketPicks={bracketPicks} onLoad={onLoad} />

      <div className={styles.groupTabs}><div className={styles.groupTabsInner}>
        {GROUP_LABELS.map(g => {
          const done = liveFixtures.filter(f => f.group===g && f.homeScore===null)
            .filter(f => predictions[f.id] !== undefined).length
          const total = liveFixtures.filter(f => f.group===g && f.homeScore===null).length
          return (
            <button
              key={g}
              className={`${styles.gTab} ${activeGroup===g ? styles.gTabActive : ''}`}
              onClick={() => setActiveGroup(g)}
            >
              <span>Grp {g}</span>
              {done > 0 && <span className={styles.gBadge}>{done}/{total}</span>}
            </button>
          )
        })}
      </div></div>

      <div className={styles.layout}>
        <div className={styles.fixturesCol}>
          <div className={styles.colHeader}>
            <span>Matchday Fixtures</span>
            <div className={styles.colActions}>
              <button className={styles.actionBtn} onClick={handleAutoFill}>Auto-fill</button>
              <button className={styles.actionBtn} onClick={clearGroup}>Clear</button>
            </div>
          </div>

          {[1,2,3].map(md => {
            const mdFixtures = fixtures.filter(f => f.md === md)
            return (
              <div key={md} className={styles.mdBlock}>
                <div className={styles.mdLabel}>Matchday {md}</div>
                {mdFixtures.map(f => {
                  const home = teamObj(f.home)
                  const away = teamObj(f.away)
                  const pred = predictions[f.id] || {}
                  const isPlayed = f.homeScore !== null

                  return (
                    <div key={f.id} className={`${styles.card} ${pred.h != null && !isPlayed ? styles.cardDone : ''} ${isPlayed ? styles.cardPlayed : ''}`}>
                      <div className={styles.cardDate}>{formatDate(f.date)} · {f.venue.split(',')[0]}</div>
                      <div className={styles.cardRow}>
                        <div className={styles.teamSide}>
                          <span className={styles.flag}>{home.flag}</span>
                          <span className={styles.teamName}>{home.name}</span>
                        </div>
                        <div className={styles.scoreZone}>
                          <ScoreInput value={pred.h} onChange={v => onPredict(f.id, v, pred.a ?? null)} color="#f5c518" />
                          <span className={styles.vs}>vs</span>
                          <ScoreInput value={pred.a} onChange={v => onPredict(f.id, pred.h ?? null, v)} color="#f5c518" />
                        </div>
                        <div className={`${styles.teamSide} ${styles.teamRight}`}>
                          <span className={styles.teamName}>{away.name}</span>
                          <span className={styles.flag}>{away.flag}</span>
                        </div>
                      </div>
                      {!isPlayed && <OddsBar homeCode={f.home} awayCode={f.away} />}
                      {isPlayed && (
                        <div className={styles.playedNote}>
                          ✓ Played — final result: {f.homeScore}-{f.awayScore}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        <div className={styles.standingsCol}>
          <div className={styles.colHeader}><span>Group {activeGroup} Standings</span></div>
          <StandingsTable group={activeGroup} predictions={predictions} fixtures={liveFixtures} />
          <div className={styles.standingsNote}>
            <span className={styles.qualifyDot} /> Top 2 qualify automatically · 8 best 3rd-place teams also advance
          </div>
        </div>
      </div>
    </div>
  )
}
