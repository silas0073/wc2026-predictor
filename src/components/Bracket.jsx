import React, { useState, useEffect } from 'react'
import { TEAMS } from '../data.js'
import { matchOdds, formLabel } from '../odds.js'
import { groupStandings } from '../utils.js'
import { GROUP_LABELS, FIXTURES } from '../data.js'
import styles from './Bracket.module.css'

const BRACKET_KEY = 'wc2026_bracket'

// Official WC2026 R32 matchups (from FIFA schedule)
// Third-place slots depend on which 8 groups produce qualifiers — we pick best 3rds from predictions
function deriveR32(predictions, fixtures) {
  const w = {}, r = {}, t3 = []
  GROUP_LABELS.forEach(g => {
    const rows = groupStandings(g, predictions, fixtures)
    w[g] = rows[0]?.code || null
    r[g] = rows[1]?.code || null
    if (rows[2]?.code) t3.push({ code: rows[2].code, pts: rows[2].Pts, gd: rows[2].GD, gf: rows[2].GF })
  })
  // Best 8 third-place teams
  const best8 = t3.sort((a,b) => b.pts-a.pts || b.gd-a.gd || b.gf-a.gf).slice(0,8).map(x=>x.code)
  const b = (i) => best8[i] || null

  // Official R32 bracket (matches 73-88, in bracket order for R16 pairing)
  // M73: r[A] vs r[B]         → R16 with M75
  // M74: w[E] vs 3rd(ABCDF)   → R16 with M77
  // M75: w[F] vs r[C]         → R16 with M73
  // M76: w[C] vs r[F]         → R16 with M79
  // M77: w[I] vs 3rd(CDFGH)   → R16 with M74
  // M78: r[E] vs r[I]         → R16 with M80
  // M79: w[A] vs 3rd(CEFHI)   → R16 with M76
  // M80: w[L] vs 3rd(EHIJK)   → R16 with M78
  // M81: w[D] vs 3rd(BEFIJ)   → R16 with M84
  // M82: w[G] vs 3rd(AEHIJ)   → R16 with M85
  // M83: r[K] vs r[L]         → R16 with M86
  // M84: w[H] vs r[J]         → R16 with M81
  // M85: w[B] vs 3rd(EFGIJ)   → R16 with M82
  // M86: w[J] vs r[H]         → R16 with M83
  // M87: w[K] vs 3rd(DEIJL)   → R16 with M88
  // M88: r[D] vs r[G]         → R16 with M87

  return [
    { id: 1,  label:'M73', home: r['A'],  away: r['B'],  note:'2nd A vs 2nd B' },
    { id: 2,  label:'M74', home: w['E'],  away: b(0),    note:'1st E vs 3rd' },
    { id: 3,  label:'M75', home: w['F'],  away: r['C'],  note:'1st F vs 2nd C' },
    { id: 4,  label:'M76', home: w['C'],  away: r['F'],  note:'1st C vs 2nd F' },
    { id: 5,  label:'M77', home: w['I'],  away: b(1),    note:'1st I vs 3rd' },
    { id: 6,  label:'M78', home: r['E'],  away: r['I'],  note:'2nd E vs 2nd I' },
    { id: 7,  label:'M79', home: w['A'],  away: b(2),    note:'1st A vs 3rd' },
    { id: 8,  label:'M80', home: w['L'],  away: b(3),    note:'1st L vs 3rd' },
    { id: 9,  label:'M81', home: w['D'],  away: b(4),    note:'1st D vs 3rd' },
    { id: 10, label:'M82', home: w['G'],  away: b(5),    note:'1st G vs 3rd' },
    { id: 11, label:'M83', home: r['K'],  away: r['L'],  note:'2nd K vs 2nd L' },
    { id: 12, label:'M84', home: w['H'],  away: r['J'],  note:'1st H vs 2nd J' },
    { id: 13, label:'M85', home: w['B'],  away: b(6),    note:'1st B vs 3rd' },
    { id: 14, label:'M86', home: w['J'],  away: r['H'],  note:'1st J vs 2nd H' },
    { id: 15, label:'M87', home: w['K'],  away: b(7),    note:'1st K vs 3rd' },
    { id: 16, label:'M88', home: r['D'],  away: r['G'],  note:'2nd D vs 2nd G' },
  ]
}

// Official R16 pairings from bracket
// M89: M74w vs M77w  → QF1
// M90: M73w vs M75w  → QF1
// M91: M76w vs M79w  → QF2
// M92: M78w vs M80w  → QF2
// M93: M81w vs M84w  → QF3
// M94: M82w vs M85w  → QF3
// M95: M83w vs M86w  → QF4
// M96: M87w vs M88w  → QF4
const R16_PAIRS = [[2,5],[1,3],[4,7],[6,8],[9,12],[10,13],[11,14],[15,16]]
// R16 id i pairs r32 ids R16_PAIRS[i-1]

function TeamBtn({ code, isWinner, onClick, note }) {
  if (!code) return (
    <div className={`${styles.teamBtn} ${styles.teamTbd}`} title={note}>
      {note || 'TBD'}
    </div>
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
  const { home, away, note } = match
  const canPick = home && away
  return (
    <div className={`${styles.matchCard} ${winner ? styles.matchDone : ''}`}>
      <div className={styles.matchNum}>{match.label || `M${matchNum}`} <span className={styles.matchNote}>{note}</span></div>
      <TeamBtn code={home} isWinner={winner === home} onClick={() => canPick && onPick(home)} note={!home ? note : null} />
      <div className={styles.matchVs}>vs</div>
      <TeamBtn code={away} isWinner={winner === away} onClick={() => canPick && onPick(away)} note={!away ? note : null} />
      {canPick && !winner && (() => {
        const o = matchOdds(home, away)
        const ht = TEAMS[home], at = TEAMS[away]
        return (
          <div className={styles.oddsWrap}>
            <div className={styles.oddsTeams}>
              <span className={`${styles.oddsTeamLabel} ${o.fav==='home' ? styles.oddsFavTeam : ''}`}>
                {ht?.flag} {home}{o.fav==='home' ? ' ⭐' : ''}
              </span>
              <span className={styles.oddsCentre}>{o.draw}% draw</span>
              <span className={`${styles.oddsTeamLabel} ${o.fav==='away' ? styles.oddsFavTeam : ''}`}>
                {o.fav==='away' ? '⭐ ' : ''}{away} {at?.flag}
              </span>
            </div>
            <div className={styles.oddsBar}>
              <div className={styles.oddsHome} style={{width: o.homeWin+'%'}} />
              <div className={styles.oddsDraw} style={{width: o.draw+'%'}} />
              <div className={styles.oddsAway} style={{width: o.awayWin+'%'}} />
            </div>
            <div className={styles.oddsRow}>
              <span className={styles.oddsNum}>{o.homeWin}%</span>
              <span className={styles.oddsNum}>{o.awayWin}%</span>
            </div>
            <div className={styles.formRow}>
              <span>{formLabel(home)}</span>
              <span className={styles.formMid}>form</span>
              <span>{formLabel(away)}</span>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

function RoundPanel({ title, matches, picks, onPick, onAutoFill, isActive, onActivate, completedCount }) {
  const pickable = matches.filter(m => m.home && m.away).length
  const isDone = pickable > 0 && completedCount === pickable
  return (
    <div className={`${styles.round} ${isActive ? styles.roundActive : ''}`}>
      <button className={styles.roundHeader} onClick={onActivate}>
        <div className={styles.roundLeft}>
          <span className={styles.roundTitle}>{title}</span>
          <span className={`${styles.roundProgress} ${isDone ? styles.roundDone : ''}`}>
            {completedCount}/{pickable} picked
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

export default function Bracket({ predictions, fixtures = FIXTURES, picks: externalPicks, onPicksChange }) {
  const r32 = deriveR32(predictions, fixtures)

  // Support both controlled (from App) and uncontrolled (fallback) usage
  const [internalPicks, setInternalPicks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(BRACKET_KEY) || '{}') } catch { return {} }
  })
  const picks = externalPicks ?? internalPicks
  const setPicks = onPicksChange ?? setInternalPicks

  const [activeRound, setActiveRound] = useState('r32')

  useEffect(() => {
    if (!onPicksChange) {
      try { localStorage.setItem(BRACKET_KEY, JSON.stringify(picks)) } catch {}
    }
  }, [picks, onPicksChange])

  const gp = (round, id) => picks[`${round}.${id}`]
  const sp = (round, id, team) => setPicks(prev => ({ ...prev, [`${round}.${id}`]: team }))

  // R16: official pairings
  const r16 = R16_PAIRS.map((pair, i) => ({
    id: i + 1,
    home: gp('r32', r32[pair[0]-1]?.id),
    away: gp('r32', r32[pair[1]-1]?.id),
    note: `W${pair[0]} vs W${pair[1]}`
  }))

  // QF: r16 pairs (1v2, 3v4, 5v6, 7v8)
  const qf = [
    { id:1, home: gp('r16',1), away: gp('r16',2), note:'R16 M1 vs M2' },
    { id:2, home: gp('r16',3), away: gp('r16',4), note:'R16 M3 vs M4' },
    { id:3, home: gp('r16',5), away: gp('r16',6), note:'R16 M5 vs M6' },
    { id:4, home: gp('r16',7), away: gp('r16',8), note:'R16 M7 vs M8' },
  ]

  const sf = [
    { id:1, home: gp('qf',1), away: gp('qf',2) },
    { id:2, home: gp('qf',3), away: gp('qf',4) },
  ]

  const final = [{ id:1, home: gp('sf',1), away: gp('sf',2) }]
  const champion = gp('final', 1)

  const bestPick = (a, b) => {
    if (!a && !b) return null
    if (!b) return a
    if (!a) return b
    return (TEAMS[a]?.strength || 5) >= (TEAMS[b]?.strength || 5) ? a : b
  }

  const autoFillAll = () => {
    const next = { ...picks }
    r32.forEach(m => { if (m.home && m.away && !next[`r32.${m.id}`]) next[`r32.${m.id}`] = bestPick(m.home, m.away) })
    const nr16 = R16_PAIRS.map((pair,i) => ({ id:i+1, home: next[`r32.${r32[pair[0]-1]?.id}`], away: next[`r32.${r32[pair[1]-1]?.id}`] }))
    nr16.forEach(m => { if (m.home && m.away && !next[`r16.${m.id}`]) next[`r16.${m.id}`] = bestPick(m.home, m.away) })
    const nqf = [
      { id:1, home: next['r16.1'], away: next['r16.2'] },
      { id:2, home: next['r16.3'], away: next['r16.4'] },
      { id:3, home: next['r16.5'], away: next['r16.6'] },
      { id:4, home: next['r16.7'], away: next['r16.8'] },
    ]
    nqf.forEach(m => { if (m.home && m.away && !next[`qf.${m.id}`]) next[`qf.${m.id}`] = bestPick(m.home, m.away) })
    const nsf = [{ id:1, home: next['qf.1'], away: next['qf.2'] }, { id:2, home: next['qf.3'], away: next['qf.4'] }]
    nsf.forEach(m => { if (m.home && m.away && !next[`sf.${m.id}`]) next[`sf.${m.id}`] = bestPick(m.home, m.away) })
    if (next['sf.1'] && next['sf.2'] && !next['final.1']) next['final.1'] = bestPick(next['sf.1'], next['sf.2'])
    setPicks(next)
  }

  const countDone = (rk, matches) => matches.filter(m => m.home && m.away && gp(rk, m.id)).length

  const rounds = [
    { key:'r32',   label:'Round of 32',             matches: r32   },
    { key:'r16',   label:'Round of 16',             matches: r16   },
    { key:'qf',    label:'Quarter-finals',           matches: qf    },
    { key:'sf',    label:'Semi-finals',              matches: sf    },
    { key:'final', label:'Final · Jul 19 · MetLife', matches: final },
  ]

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Knockout Bracket</h2>
          <p>Official FIFA R32 seedings — tap to advance or auto-fill</p>
        </div>
        <div className={styles.headerBtns}>
          <button className={styles.autoAllBtn} onClick={autoFillAll}>⚡ Auto-fill all</button>
          {Object.keys(picks).length > 0 && (
            <button className={styles.clearBtn} onClick={() => setPicks({})}>Reset</button>
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
            picks={Object.fromEntries(Object.entries(picks).filter(([k]) => k.startsWith(r.key+'.')).map(([k,v]) => [Number(k.split('.')[1]),v]))}
            onPick={(id,team) => sp(r.key,id,team)}
            onAutoFill={() => {
              const next = { ...picks }
              r.matches.forEach(m => { if (m.home && m.away && !next[`${r.key}.${m.id}`]) next[`${r.key}.${m.id}`] = bestPick(m.home, m.away) })
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
