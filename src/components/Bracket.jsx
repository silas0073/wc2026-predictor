import React, { useState } from 'react'
import { TEAMS } from '../data.js'
import { groupStandings, simulateScore } from '../utils.js'
import { GROUP_LABELS } from '../data.js'
import styles from './Bracket.module.css'

// Derive Round of 32 seedings from group results
function deriveR32(predictions) {
  const winners = {}
  const runners = {}
  GROUP_LABELS.forEach(g => {
    const rows = groupStandings(g, predictions)
    winners[g] = rows[0]?.code
    runners[g] = rows[1]?.code
  })
  // Official WC2026 R32 matchups (group winners vs runners-up)
  // W=Winner, R=Runner-up
  return [
    { id:'r32_1',  home: winners['A'] || '?A1', away: runners['B'] || '?B2' },
    { id:'r32_2',  home: winners['B'] || '?B1', away: runners['A'] || '?A2' },
    { id:'r32_3',  home: winners['C'] || '?C1', away: runners['D'] || '?D2' },
    { id:'r32_4',  home: winners['D'] || '?D1', away: runners['C'] || '?C2' },
    { id:'r32_5',  home: winners['E'] || '?E1', away: runners['F'] || '?F2' },
    { id:'r32_6',  home: winners['F'] || '?F1', away: runners['E'] || '?E2' },
    { id:'r32_7',  home: winners['G'] || '?G1', away: runners['H'] || '?H2' },
    { id:'r32_8',  home: winners['H'] || '?H1', away: runners['G'] || '?G2' },
    { id:'r32_9',  home: winners['I'] || '?I1', away: runners['J'] || '?J2' },
    { id:'r32_10', home: winners['J'] || '?J1', away: runners['I'] || '?I2' },
    { id:'r32_11', home: winners['K'] || '?K1', away: runners['L'] || '?L2' },
    { id:'r32_12', home: winners['L'] || '?L1', away: runners['K'] || '?K2' },
    { id:'r32_13', home: '3rd-best', away: '3rd-best' },
    { id:'r32_14', home: '3rd-best', away: '3rd-best' },
    { id:'r32_15', home: '3rd-best', away: '3rd-best' },
    { id:'r32_16', home: '3rd-best', away: '3rd-best' },
  ]
}

function TeamChip({ code }) {
  if (!code || code.startsWith('?') || code.startsWith('3rd')) {
    return <span className={styles.tbd}>{code?.startsWith('3rd') ? '3rd-place TBD' : (code ? `${code.slice(1)} winner/runner-up` : 'TBD')}</span>
  }
  const t = TEAMS[code]
  if (!t) return <span className={styles.tbd}>{code}</span>
  return (
    <span className={styles.chip}>
      <span>{t.flag}</span>
      <span className={styles.chipName}>{t.name}</span>
      <span className={styles.chipCode}>{code}</span>
    </span>
  )
}

function KOMatch({ home, away, winner, onPick }) {
  const isUnknown = !home || !away || home.startsWith('?') || away.startsWith('?') ||
    home.startsWith('3rd') || away.startsWith('3rd')

  return (
    <div className={styles.match}>
      <div
        className={`${styles.side} ${winner === home ? styles.sideWin : ''} ${!isUnknown && home !== '?' ? styles.sideClickable : ''}`}
        onClick={() => !isUnknown && home && !home.startsWith('?') && onPick && onPick(home)}
      >
        <TeamChip code={home} />
      </div>
      <div
        className={`${styles.side} ${winner === away ? styles.sideWin : ''} ${!isUnknown && away !== '?' ? styles.sideClickable : ''}`}
        onClick={() => !isUnknown && away && !away.startsWith('?') && onPick && onPick(away)}
      >
        <TeamChip code={away} />
      </div>
    </div>
  )
}

export default function Bracket({ predictions }) {
  const r32 = deriveR32(predictions)

  // bracket state: picks at each round
  const [r32picks,  setR32picks]  = useState({})
  const [r16picks,  setR16picks]  = useState({})
  const [qfpicks,   setQFpicks]   = useState({})
  const [sfpicks,   setSFpicks]   = useState({})
  const [finalpick, setFinalPick] = useState(null)

  const pickR32  = (id, team) => setR32picks(p  => ({ ...p, [id]:  team }))
  const pickR16  = (id, team) => setR16picks(p  => ({ ...p, [id]:  team }))
  const pickQF   = (id, team) => setQFpicks(p   => ({ ...p, [id]:  team }))
  const pickSF   = (id, team) => setSFpicks(p   => ({ ...p, [id]:  team }))

  // Build R16 matchups from R32 winners (pairs: 1v2, 3v4, …)
  const r16 = Array.from({ length: 8 }, (_, i) => ({
    id: `r16_${i+1}`,
    home: r32picks[r32[i*2]?.id],
    away: r32picks[r32[i*2+1]?.id],
  }))

  const qf = Array.from({ length: 4 }, (_, i) => ({
    id: `qf_${i+1}`,
    home: r16picks[r16[i*2]?.id],
    away: r16picks[r16[i*2+1]?.id],
  }))

  const sf = [
    { id:'sf_1', home: qfpicks['qf_1'], away: qfpicks['qf_2'] },
    { id:'sf_2', home: qfpicks['qf_3'], away: qfpicks['qf_4'] },
  ]

  const final = {
    home: sfpicks['sf_1'],
    away: sfpicks['sf_2'],
  }

  const allGroupsDone = GROUP_LABELS.every(g => {
    const rows = groupStandings(g, predictions)
    return rows[0]?.P >= 3
  })

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <h2>Knockout Bracket</h2>
        <p>Click a team to advance them. Complete the group stage first to populate seedings.</p>
      </div>

      {!allGroupsDone && (
        <div className={styles.notice}>
          ⚠️ Complete all group stage predictions (or wait for real results) to see accurate R32 seedings.
          Partial results shown where available.
        </div>
      )}

      <div className={styles.bracket}>
        {/* Round of 32 */}
        <div className={styles.round}>
          <div className={styles.roundLabel}>Round of 32</div>
          <div className={styles.matches}>
            {r32.map(m => (
              <KOMatch key={m.id} home={m.home} away={m.away} winner={r32picks[m.id]} onPick={t => pickR32(m.id, t)} />
            ))}
          </div>
        </div>

        {/* Round of 16 */}
        <div className={styles.round}>
          <div className={styles.roundLabel}>Round of 16</div>
          <div className={styles.matches}>
            {r16.map(m => (
              <KOMatch key={m.id} home={m.home} away={m.away} winner={r16picks[m.id]} onPick={t => pickR16(m.id, t)} />
            ))}
          </div>
        </div>

        {/* Quarter-finals */}
        <div className={styles.round}>
          <div className={styles.roundLabel}>Quarter-finals</div>
          <div className={styles.matches}>
            {qf.map(m => (
              <KOMatch key={m.id} home={m.home} away={m.away} winner={qfpicks[m.id]} onPick={t => pickQF(m.id, t)} />
            ))}
          </div>
        </div>

        {/* Semi-finals */}
        <div className={styles.round}>
          <div className={styles.roundLabel}>Semi-finals</div>
          <div className={styles.matches}>
            {sf.map(m => (
              <KOMatch key={m.id} home={m.home} away={m.away} winner={sfpicks[m.id]} onPick={t => pickSF(m.id, t)} />
            ))}
          </div>
        </div>

        {/* Final */}
        <div className={styles.round}>
          <div className={styles.roundLabel}>Final · Jul 19 · MetLife</div>
          <div className={styles.matches}>
            <KOMatch home={final.home} away={final.away} winner={finalpick} onPick={setFinalPick} />
          </div>
        </div>
      </div>

      {finalpick && TEAMS[finalpick] && (
        <div className={styles.champion}>
          <div className={styles.champFlag}>{TEAMS[finalpick].flag}</div>
          <div className={styles.champName}>{TEAMS[finalpick].name}</div>
          <div className={styles.champLabel}>🏆 Your World Cup Champion</div>
        </div>
      )}
    </div>
  )
}
