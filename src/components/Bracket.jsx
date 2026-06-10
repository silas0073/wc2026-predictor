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
  // 16 matches, 4 slots use the best 3rd-place teams
  // We'll show the known 12 with real teams, and fill 4 with top 3rd-place from predictions
  const thirds = GROUP_LABELS
    .map(g => {
      const rows = groupStandings(g, predictions)
      return rows[2] ? { code: rows[2].code, pts: rows[2].Pts, gd: rows[2].GD } : null
    })
    .filter(Boolean)
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd)
    .slice(0, 4)
    .map(t => t.code)

  while (thirds.length < 4) thirds.push(null)

  return [
    { id: 1,  home: w['A'],      away: r['B']      },
    { id: 2,  home: w['C'],      away: r['D']      },
    { id: 3,  home: w['E'],      away: r['F']      },
    { id: 4,  home: w['G'],      away: r['H']      },
    { id: 5,  home: w['I'],      away: r['J']      },
    { id: 6,  home: w['K'],      away: r['L']      },
    { id: 7,  home: w['B'],      away: r['A']      },
    { id: 8,  home: w['D'],      away: r['C']      },
    { id: 9,  home: w['F'],      away: r['E']      },
    { id: 10, home: w['H'],      away: r['G']      },
    { id: 11, home: w['J'],      away: r['I']      },
    { id: 12, home: w['L'],      away: r['K']      },
    { id: 13, home: thirds[0],   away: thirds[1]   },
    { id: 14, home: thirds[2],   away: thirds[3]   },
    { id: 15, home: thirds[0] ? w['A'] : null, away: thirds[0] },  // best 3rd vs group winner
    { id: 16, home: thirds[2] ? w['B'] : null, away: thirds[2] },
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
  const { home, away } = match
  const canPick = home && away
  return (
    <div className={`${styles.matchCard} ${winner ? styles.matchDone : ''} ${!canPick ? styles.matchTbd : ''}`}>
      <div className={styles.matchNum}>M{matchNum}</div>
      <TeamBtn code={home} isWinner={winner === home} onClick={() => canPick && onPick(home)} />
      <div className={styles.matchVs}>vs</div>
      <TeamBtn code={away} isWinner={winner === away} onClick={() => canPick && onPick(away)} />
    </div>
  )
}

function RoundPanel({ title, matches, picks, onPick, onAutoFill, isActive, onActivate, completedCount }) {
  const pickable = matches.filter(m => m.home && m.away)
  const total = pickable.length
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
              <MatchCard key={m.id} match={m} winner={picks[m.id]}
                onPick={t => onPick(m.id, t)} matchNum={i + 1} />
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

  const bestPick = (a, b) => {
    if (!a && !b) return null
    if (!b) return a
    if (!a) return b
    return (TEAMS[a]?.strength || 5) >= (TEAMS[b]?.strength || 5) ? a : b
  }

  const autoFillAll = () => {
    const next = { ...picks }
    // Pass 1: R32
    r32.forEach(m => {
      if (m.home && m.away && !next[`r32.${m.id}`])
        next[`r32.${m.id}`] = bestPick(m.home, m.away)
    })
    // Pass 2: R16
    const nr16 = Array.from({ length: 8 }, (_, i) => ({
      id: i+1, home: next[`r32.${r32[i*2]?.id}`], away: next[`r32.${r32[i*2+1]?.id}`]
    }))
    nr16.forEach(m => {
      if (m.home && m.away && !next[`r16.${m.id}`])
        next[`r16.${m.id}`] = bestPick(m.home, m.away)
    })
    // Pass 3: QF
    const nqf = Array.from({ length: 4 }, (_, i) => ({
      id: i+1, home: next[`r16.${nr16[i*2]?.id}`], away: next[`r16.${nr16[i*2+1]?.id}`]
    }))
    nqf.forEach(m => {
      if (m.home && m.away && !next[`qf.${m.id}`])
        next[`qf.${m.id}`] = bestPick(m.home, m.away)
    })
    // Pass 4: SF
    const nsf = [
      { id:1, home: next['qf.1'], away: next['qf.2'] },
      { id:2, home: next['qf.3'], away: next['qf.4'] },
    ]
    nsf.forEach(m => {
      if (m.home && m.away && !next[`sf.${m.id}`])
        next[`sf.${m.id}`] = bestPick(m.home, m.away)
    })
    // Pass 5: Final
    if (next['sf.1'] && next['sf.2'] && !next['final.1'])
      next['final.1'] = bestPick(next['sf.1'], next['sf.2'])

    setPicks(next)
  }

  const countDone = (roundKey, matches) =>
    matches.filter(m => m.home && m.away && gp(roundKey, m.id)).length

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
            <button className={styles.clearBtn} onClick={() => { setPicks({}); localStorage.removeItem(BRACKET_KEY) }}>Reset</button>
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
          <RoundPanel key={r.key} title={r.label} matches={r.matches}
            picks={Object.fromEntries(
              Object.entries(picks)
                .filter(([k]) => k.startsWith(r.key + '.'))
                .map(([k, v]) => [Number(k.split('.')[1]), v])
            )}
            onPick={(id, team) => sp(r.key, id, team)}
            onAutoFill={() => {
              const next = { ...picks }
              r.matches.forEach(m => {
                if (m.home && m.away && !next[`${r.key}.${m.id}`])
                  next[`${r.key}.${m.id}`] = bestPick(m.home, m.away)
              })
              setPicks(next)
            }}
            isActive={activeRound === r.key}
            onActivate={() => setActiveRound(prev => prev === r.key ? null : r.key)}
            completedCount={countDone(r.key, r.matches)}
          />
        ))}
      </div>
    </div>
  )
}
