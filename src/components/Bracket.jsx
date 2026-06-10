import React, { useState, useEffect } from 'react'
import { TEAMS } from '../data.js'
import { groupStandings, simulateScore } from '../utils.js'
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
  return [
    { id:'r32_1',  home: winners['A'], away: runners['B'] },
    { id:'r32_2',  home: winners['B'], away: runners['A'] },
    { id:'r32_3',  home: winners['C'], away: runners['D'] },
    { id:'r32_4',  home: winners['D'], away: runners['C'] },
    { id:'r32_5',  home: winners['E'], away: runners['F'] },
    { id:'r32_6',  home: winners['F'], away: runners['E'] },
    { id:'r32_7',  home: winners['G'], away: runners['H'] },
    { id:'r32_8',  home: winners['H'], away: runners['G'] },
    { id:'r32_9',  home: winners['I'], away: runners['J'] },
    { id:'r32_10', home: winners['J'], away: runners['I'] },
    { id:'r32_11', home: winners['K'], away: runners['L'] },
    { id:'r32_12', home: winners['L'], away: runners['K'] },
    // 3rd place slots - TBD
    { id:'r32_13', home: null, away: null, tbd: true },
    { id:'r32_14', home: null, away: null, tbd: true },
    { id:'r32_15', home: null, away: null, tbd: true },
    { id:'r32_16', home: null, away: null, tbd: true },
  ]
}

function TeamBtn({ code, isWinner, onClick }) {
  if (!code) return (
    <div className={`${styles.teamBtn} ${styles.teamTbd}`}>TBD</div>
  )
  const t = TEAMS[code]
  if (!t) return <div className={`${styles.teamBtn} ${styles.teamTbd}`}>{code}</div>
  return (
    <button
      className={`${styles.teamBtn} ${isWinner ? styles.teamWinner : ''}`}
      onClick={onClick}
    >
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
  const done = completedCount

  return (
    <div className={`${styles.round} ${isActive ? styles.roundActive : ''}`}>
      <button className={styles.roundHeader} onClick={onActivate}>
        <div className={styles.roundLeft}>
          <span className={styles.roundTitle}>{title}</span>
          <span className={`${styles.roundProgress} ${done === total ? styles.roundDone : ''}`}>
            {done}/{total} picked
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
  const r32matches = deriveR32(predictions)

  // Load bracket picks from localStorage
  const [picks, setPicks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(BRACKET_KEY) || '{}') } catch { return {} }
  })
  const [activeRound, setActiveRound] = useState('r32')

  useEffect(() => {
    try { localStorage.setItem(BRACKET_KEY, JSON.stringify(picks)) } catch {}
  }, [picks])

  const pick = (round, id, team) => {
    setPicks(prev => ({ ...prev, [`${round}_${id}`]: team }))
  }

  const getPick = (round, id) => picks[`${round}_${id}`]

  // Build each round's matches from previous winners
  const r16matches = Array.from({ length: 8 }, (_, i) => ({
    id: `r16_${i+1}`,
    home: getPick('r32', r32matches[i*2]?.id),
    away: getPick('r32', r32matches[i*2+1]?.id),
  }))

  const qfmatches = Array.from({ length: 4 }, (_, i) => ({
    id: `qf_${i+1}`,
    home: getPick('r16', r16matches[i*2]?.id),
    away: getPick('r16', r16matches[i*2+1]?.id),
  }))

  const sfmatches = [
    { id:'sf_1', home: getPick('qf','qf_1'), away: getPick('qf','qf_2') },
    { id:'sf_2', home: getPick('qf','qf_3'), away: getPick('qf','qf_4') },
  ]

  const finalMatch = {
    id: 'final_1',
    home: getPick('sf','sf_1'),
    away: getPick('sf','sf_2'),
  }

  const champion = getPick('final', 'final_1')

  const autoFill = (roundKey, matches) => {
    const newPicks = { ...picks }
    matches.forEach(m => {
      if (!m.tbd && m.home && m.away && !newPicks[`${roundKey}_${m.id}`]) {
        const str_h = TEAMS[m.home]?.strength || 5
        const str_a = TEAMS[m.away]?.strength || 5
        newPicks[`${roundKey}_${m.id}`] = str_h >= str_a ? m.home : m.away
      }
    })
    setPicks(newPicks)
  }

  const countDone = (roundKey, matches) =>
    matches.filter(m => !m.tbd && m.home && m.away && getPick(roundKey, m.id)).length

  const clearBracket = () => {
    setPicks({})
    localStorage.removeItem(BRACKET_KEY)
  }

  const rounds = [
    { key: 'r32',   label: 'Round of 32',   matches: r32matches },
    { key: 'r16',   label: 'Round of 16',   matches: r16matches },
    { key: 'qf',    label: 'Quarter-finals', matches: qfmatches },
    { key: 'sf',    label: 'Semi-finals',    matches: sfmatches },
    { key: 'final', label: 'Final · Jul 19 · MetLife', matches: [finalMatch] },
  ]

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Knockout Bracket</h2>
          <p>Tap a team to advance them round by round</p>
        </div>
        {Object.keys(picks).length > 0 && (
          <button className={styles.clearBtn} onClick={clearBracket}>Reset bracket</button>
        )}
      </div>

      {champion && TEAMS[champion] && (
        <div className={styles.champion}>
          <span className={styles.champFlag}>{TEAMS[champion].flag}</span>
          <span className={styles.champName}>{TEAMS[champion].name}</span>
          <span className={styles.champLabel}>🏆 Champion</span>
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
                .filter(([k]) => k.startsWith(r.key + '_'))
                .map(([k, v]) => [k.replace(r.key + '_', ''), v])
            )}
            onPick={(id, team) => pick(r.key, id, team)}
            onAutoFill={() => autoFill(r.key, r.matches)}
            isActive={activeRound === r.key}
            onActivate={() => setActiveRound(activeRound === r.key ? null : r.key)}
            completedCount={countDone(r.key, r.matches)}
          />
        ))}
      </div>
    </div>
  )
}
