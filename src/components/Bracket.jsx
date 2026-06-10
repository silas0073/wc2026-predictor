import React, { useState, useEffect } from 'react'
import { TEAMS } from '../data.js'
import { groupStandings } from '../utils.js'
import { GROUP_LABELS } from '../data.js'
import styles from './Bracket.module.css'

const BRACKET_KEY = 'wc2026_bracket'

function deriveR32(predictions) {
  const w = {}, r = {}
  GROUP_LABELS.forEach(g => {
    const rows = groupStandings(g, predictions)
    w[g] = rows[0]?.code
    r[g] = rows[1]?.code
  })
  // 16 matches: 12 real + 4 best-third-place slots (shown as BYE)
  return [
    { id: 1,  home: w['A'], away: r['B'] },
    { id: 2,  home: w['C'], away: r['D'] },
    { id: 3,  home: w['E'], away: r['F'] },
    { id: 4,  home: w['G'], away: r['H'] },
    { id: 5,  home: w['I'], away: r['J'] },
    { id: 6,  home: w['K'], away: r['L'] },
    { id: 7,  home: w['B'], away: r['A'] },
    { id: 8,  home: w['D'], away: r['C'] },
    { id: 9,  home: w['F'], away: r['E'] },
    { id: 10, home: w['H'], away: r['G'] },
    { id: 11, home: w['J'], away: r['I'] },
    { id: 12, home: w['L'], away: r['K'] },
    { id: 13, home: null, away: null, bye: true, label: '3rd-place slot' },
    { id: 14, home: null, away: null, bye: true, label: '3rd-place slot' },
    { id: 15, home: null, away: null, bye: true, label: '3rd-place slot' },
    { id: 16, home: null, away: null, bye: true, label: '3rd-place slot' },
  ]
}

function TeamBtn({ code, isWinner, onClick, byeLabel }) {
  if (byeLabel) return (
    <div className={`${styles.teamBtn} ${styles.teamTbd}`}>
      {byeLabel}
    </div>
  )
  if (!code) return (
    <div className={`${styles.teamBtn} ${styles.teamTbd}`}>TBD</div>
  )
  const t = TEAMS[code]
  if (!t) return <div className={`${styles.teamBtn} ${styles.teamTbd}`}>{code}</div>
  return (
    <button className={`${styles.teamBtn} ${isWinner ? styles.teamWinner : ''}`} onClick={onClick}>
      <span className={styles.flag}>{t.flag}</span>
      <span className={styles.name}>{t.name}</span>
      {isWinner && <span className={styles.tick}>✓</span>}
    </button>
  )
}

function MatchCard({ match, winner, onPick, matchNum }) {
  const { home, away, bye, label } = match
  if (bye) return (
    <div className={`${styles.matchCard} ${styles.matchBye}`}>
      <div className={styles.matchNum}>M{matchNum}</div>
      <div className={`${styles.teamBtn} ${styles.teamTbd}`}>3rd-place qualifier — TBD</div>
      <div className={styles.matchVs}>vs</div>
      <div className={`${styles.teamBtn} ${styles.teamTbd}`}>3rd-place qualifier — TBD</div>
    </div>
  )
  const canPick = home && away
  return (
    <div className={`${styles.matchCard} ${winner ? styles.matchDone : ''}`}>
      <div className={styles.matchNum}>M{matchNum}</div>
      <TeamBtn code={home} isWinner={winner === home} onClick={() => canPick && onPick(home)} />
      <div className={styles.matchVs}>vs</div>
      <TeamBtn code={away} isWinner={winner === away} onClick={() => canPick && onPick(away)} />
    </div>
  )
}

function RoundPanel({ title, matches, picks, onPick, onAutoFill, isActive, onActivate, completedCount }) {
  const total = matches.filter(m => !m.bye && m.home && m.away).length
  const isDone = total > 0 && completedCount === total
  return (
    <div className={`${styles.round} ${isActive ? styles.roundActive : ''}`}>
      <button className={styles.roundHeader} onClick={onActivate}>
        <div className={styles.roundLeft}>
          <span className={styles.roundTitle}>{title}</span>
          <span className={`${styles.roundProgress} ${isDone ? styles.roundDone : ''}`}>
            {completedCount}/{total} picked
          </span>
        </div>
        <span className={styles.roundChevron}>{isActive ? '▲' : '▼'}</span>
      </button>
      {isActive && (
        <div className={styles.roundBody}>
          <div className={styles.roundActions}>
            <button className={styles.autoBtn} onClick={onAutoFill}>⚡ Auto-fill round</button>
          </div>
          <div className={styles.matchList}>
            {matches.map((m, i) => (
              <MatchCard
                key={m.id}
                match={m}
                winner={picks[m.id]}
                onPick={t => onPick(m.id, t)}
                matchNum={i + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Bracket({ predictions }) {
  const r32 = deriveR32(predictions)

  const [picks, setPicks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(BRACKET_KEY) || '{}') } catch { return {} }
  })
  const [activeRound, setActiveRound] = useState('r32')

  useEffect(() => {
    try { localStorage.setItem(BRACKET_KEY, JSON.stringify(picks)) } catch {}
  }, [picks])

  const gp = (round, id) => picks[`${round}.${id}`]
  const sp = (round, id, team) => setPicks(prev => ({ ...prev, [`${round}.${id}`]: team }))

  // R16: 8 matches from 16 R32 winners (pairs: 1v2, 3v4, 5v6, 7v8, 9v10, 11v12, 13v14, 15v16)
  const r16 = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    home: gp('r32', r32[i * 2]?.id),
    away: gp('r32', r32[i * 2 + 1]?.id),
  }))

  // QF: 4 matches from 8 R16 winners
  const qf = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1,
    home: gp('r16', r16[i * 2]?.id),
    away: gp('r16', r16[i * 2 + 1]?.id),
  }))

  // SF: 2 matches from 4 QF winners
  const sf = [
    { id: 1, home: gp('qf', 1), away: gp('qf', 2) },
    { id: 2, home: gp('qf', 3), away: gp('qf', 4) },
  ]

  // Final
  const final = [{ id: 1, home: gp('sf', 1), away: gp('sf', 2) }]
  const champion = gp('final', 1)

  const autoFill = (roundKey, matches) => {
    const next = { ...picks }
    matches.forEach(m => {
      if (m.bye) return
      if (m.home && m.away && !next[`${roundKey}.${m.id}`]) {
        const sh = TEAMS[m.home]?.strength || 5
        const sa = TEAMS[m.away]?.strength || 5
        next[`${roundKey}.${m.id}`] = sh >= sa ? m.home : m.away
      }
    })
    setPicks(next)
  }

  const autoFillAll = () => {
    let next = { ...picks }
    const allRounds = [
      { key: 'r32', matches: r32 },
      { key: 'r16', matches: r16 },
      { key: 'qf',  matches: qf  },
      { key: 'sf',  matches: sf  },
      { key: 'final', matches: final },
    ]
    // Need to run multiple passes so each round feeds the next
    for (let pass = 0; pass < 5; pass++) {
      allRounds.forEach(({ key, matches }) => {
        matches.forEach(m => {
          if (m.bye) return
          if (m.home && m.away && !next[`${key}.${m.id}`]) {
            const sh = TEAMS[m.home]?.strength || 5
            const sa = TEAMS[m.away]?.strength || 5
            next[`${key}.${m.id}`] = sh >= sa ? m.home : m.away
          }
        })
      })
      // Recompute derived matches with new picks
      const newR16 = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        home: next[`r32.${r32[i*2]?.id}`],
        away: next[`r32.${r32[i*2+1]?.id}`],
      }))
      const newQF = Array.from({ length: 4 }, (_, i) => ({
        id: i + 1,
        home: next[`r16.${newR16[i*2]?.id}`],
        away: next[`r16.${newR16[i*2+1]?.id}`],
      }))
      const newSF = [
        { id: 1, home: next['qf.1'], away: next['qf.2'] },
        { id: 2, home: next['qf.3'], away: next['qf.4'] },
      ]
      const newFinal = [{ id: 1, home: next['sf.1'], away: next['sf.2'] }]
      allRounds[1].matches = newR16
      allRounds[2].matches = newQF
      allRounds[3].matches = newSF
      allRounds[4].matches = newFinal
    }
    setPicks(next)
  }

  const countDone = (roundKey, matches) =>
    matches.filter(m => !m.bye && m.home && m.away && gp(roundKey, m.id)).length

  const rounds = [
    { key: 'r32',   label: 'Round of 32',             matches: r32   },
    { key: 'r16',   label: 'Round of 16',             matches: r16   },
    { key: 'qf',    label: 'Quarter-finals',           matches: qf    },
    { key: 'sf',    label: 'Semi-finals',              matches: sf    },
    { key: 'final', label: 'Final · Jul 19 · MetLife', matches: final },
  ]

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Knockout Bracket</h2>
          <p>Tap a team to advance — or use auto-fill</p>
        </div>
        <div className={styles.headerBtns}>
          <button className={styles.autoAllBtn} onClick={autoFillAll}>⚡ Auto-fill all</button>
          {Object.keys(picks).length > 0 && (
            <button className={styles.clearBtn} onClick={() => { setPicks({}); localStorage.removeItem(BRACKET_KEY) }}>
              Reset
            </button>
          )}
        </div>
      </div>

      {champion && TEAMS[champion] && (
        <div className={styles.champion}>
          <span className={styles.champFlag}>{TEAMS[champion].flag}</span>
          <span className={styles.champName}>{TEAMS[champion].name}</span>
          <span className={styles.champLabel}>🏆 Your Champion</span>
        </div>
      )}

      <div className={styles.rounds}>
        {rounds.map(r => (
          <RoundPanel
            key={r.key}
            title={r.label}
            matches={r.matches}
            picks={Object.fromEntries(
              Object.entries(picks)
                .filter(([k]) => k.startsWith(r.key + '.'))
                .map(([k, v]) => [Number(k.split('.')[1]), v])
            )}
            onPick={(id, team) => sp(r.key, id, team)}
            onAutoFill={() => autoFill(r.key, r.matches)}
            isActive={activeRound === r.key}
            onActivate={() => setActiveRound(prev => prev === r.key ? null : r.key)}
            completedCount={countDone(r.key, r.matches)}
          />
        ))}
      </div>
    </div>
  )
}
