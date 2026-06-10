import React, { useState, useEffect } from 'react'
import { TEAMS } from '../data.js'
import { groupStandings } from '../utils.js'
import { GROUP_LABELS } from '../data.js'
import styles from './Bracket.module.css'

const BRACKET_KEY = 'wc2026_bracket'

function deriveR32(predictions) {
  const winners = {}, runners = {}
  GROUP_LABELS.forEach(g => {
    const rows = groupStandings(g, predictions)
    winners[g] = rows[0]?.code
    runners[g] = rows[1]?.code
  })
  // Use simple numeric IDs — no round prefix, avoids double-prefix bug
  return [
    { id: 1,  home: winners['A'], away: runners['B'] },
    { id: 2,  home: winners['B'], away: runners['A'] },
    { id: 3,  home: winners['C'], away: runners['D'] },
    { id: 4,  home: winners['D'], away: runners['C'] },
    { id: 5,  home: winners['E'], away: runners['F'] },
    { id: 6,  home: winners['F'], away: runners['E'] },
    { id: 7,  home: winners['G'], away: runners['H'] },
    { id: 8,  home: winners['H'], away: runners['G'] },
    { id: 9,  home: winners['I'], away: runners['J'] },
    { id: 10, home: winners['J'], away: runners['I'] },
    { id: 11, home: winners['K'], away: runners['L'] },
    { id: 12, home: winners['L'], away: runners['K'] },
    { id: 13, home: null, away: null, tbd: true },
    { id: 14, home: null, away: null, tbd: true },
    { id: 15, home: null, away: null, tbd: true },
    { id: 16, home: null, away: null, tbd: true },
  ]
}

function TeamBtn({ code, isWinner, onClick }) {
  if (!code) return <div className={`${styles.teamBtn} ${styles.teamTbd}`}>TBD</div>
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
  const { home, away, tbd } = match
  const canPick = !tbd && home && away
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
  const total = matches.filter(m => !m.tbd && m.home && m.away).length
  return (
    <div className={`${styles.round} ${isActive ? styles.roundActive : ''}`}>
      <button className={styles.roundHeader} onClick={onActivate}>
        <div className={styles.roundLeft}>
          <span className={styles.roundTitle}>{title}</span>
          <span className={`${styles.roundProgress} ${completedCount === total && total > 0 ? styles.roundDone : ''}`}>
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

  // picks stored as { 'r32.1': 'MEX', 'r16.1': 'BRA', ... }
  const gp = (round, id) => picks[`${round}.${id}`]
  const sp = (round, id, team) => setPicks(prev => ({ ...prev, [`${round}.${id}`]: team }))

  const r16 = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    home: gp('r32', r32[i * 2]?.id),
    away: gp('r32', r32[i * 2 + 1]?.id),
  }))

  const qf = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1,
    home: gp('r16', r16[i * 2]?.id),
    away: gp('r16', r16[i * 2 + 1]?.id),
  }))

  const sf = [
    { id: 1, home: gp('qf', 1), away: gp('qf', 2) },
    { id: 2, home: gp('qf', 3), away: gp('qf', 4) },
  ]

  const final = [{ id: 1, home: gp('sf', 1), away: gp('sf', 2) }]
  const champion = gp('final', 1)

  const autoFill = (roundKey, matches) => {
    const next = { ...picks }
    matches.forEach(m => {
      if (!m.tbd && m.home && m.away && !next[`${roundKey}.${m.id}`]) {
        const sh = TEAMS[m.home]?.strength || 5
        const sa = TEAMS[m.away]?.strength || 5
        next[`${roundKey}.${m.id}`] = sh >= sa ? m.home : m.away
      }
    })
    setPicks(next)
  }

  const countDone = (roundKey, matches) =>
    matches.filter(m => !m.tbd && m.home && m.away && gp(roundKey, m.id)).length

  const rounds = [
    { key: 'r32',   label: 'Round of 32',            matches: r32   },
    { key: 'r16',   label: 'Round of 16',            matches: r16   },
    { key: 'qf',    label: 'Quarter-finals',          matches: qf    },
    { key: 'sf',    label: 'Semi-finals',             matches: sf    },
    { key: 'final', label: 'Final · Jul 19 · MetLife', matches: final },
  ]

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Knockout Bracket</h2>
          <p>Tap a team to advance — or auto-fill each round</p>
        </div>
        {Object.keys(picks).length > 0 && (
          <button className={styles.clearBtn} onClick={() => { setPicks({}); localStorage.removeItem(BRACKET_KEY) }}>
            Reset
          </button>
        )}
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
