import React, { useRef, useState, useLayoutEffect, useCallback } from 'react'
import { TEAMS, KNOCKOUT_ROUND_LABELS } from '../data.js'
import { formatAEST, formatAESTDate } from '../utils.js'
import styles from './Knockout.module.css'

const ROUND_ORDER = ['R32', 'R16', 'QF', 'SF', 'FINAL']

// Human-readable placeholder for a slot that hasn't resolved to a real team
// yet, e.g. {g:'A',p:1} -> "Winner Group A", {w:73} -> "Winner M73".
function slotLabel(slot) {
  if (!slot || typeof slot === 'string') return 'TBD'
  if (slot.g) return `${slot.p === 1 ? 'Winner' : 'Runner-up'} Gr ${slot.g}`
  if (slot.t3) return 'Best 3rd Place'
  if (slot.w != null) return `Winner M${slot.w}`
  if (slot.l != null) return `Loser M${slot.l}`
  return 'TBD'
}

function TeamRow({ code, slot, score, shootout, isWinner, isLive, liveScore }) {
  if (!code) {
    return (
      <div className={`${styles.teamRow} ${styles.tbd}`}>
        <span className={styles.crest}>•</span>
        <span className={styles.teamName}>{slotLabel(slot)}</span>
      </div>
    )
  }
  const t = TEAMS[code]
  return (
    <div className={`${styles.teamRow} ${isWinner ? styles.winner : ''}`}>
      <span className={styles.crest}>{t?.flag || '🏳️'}</span>
      <span className={styles.teamName}>{t?.name || code}</span>
      {isLive ? (
        <span className={styles.scoreLive}>{liveScore}</span>
      ) : score !== null ? (
        <span className={styles.score}>{score}{shootout != null ? <sup className={styles.pk}>{shootout}</sup> : ''}</span>
      ) : null}
    </div>
  )
}

function MatchCard({ match, registerRef }) {
  const { id, home, away, homeScore, awayScore, homeShootout, awayShootout, liveStatus, liveHomeScore, liveAwayScore, liveClock, kickoff, venue, homeSlot, awaySlot } = match
  const played = homeScore !== null && awayScore !== null
  const isLive = liveStatus === 'in'
  let homeWin = false, awayWin = false
  if (played) {
    if (homeScore !== awayScore) { homeWin = homeScore > awayScore; awayWin = !homeWin }
    else if (homeShootout != null && awayShootout != null) { homeWin = homeShootout > awayShootout; awayWin = !homeWin }
  }

  return (
    <div ref={el => registerRef(id, el)} className={`${styles.match} ${played ? styles.played : ''} ${isLive ? styles.live : ''}`}>
      <div className={styles.matchMeta}>
        <span>{formatAESTDate(kickoff)} · {formatAEST(kickoff)}</span>
        {isLive && <span className={styles.liveTag}>● LIVE {liveClock || ''}</span>}
      </div>
      <TeamRow code={home} slot={homeSlot} score={homeScore} shootout={homeShootout} isWinner={homeWin} isLive={isLive} liveScore={liveHomeScore} />
      <TeamRow code={away} slot={awaySlot} score={awayScore} shootout={awayShootout} isWinner={awayWin} isLive={isLive} liveScore={liveAwayScore} />
      {venue && <div className={styles.venue}>{venue}</div>}
    </div>
  )
}

export default function Knockout({ fixtures = [] }) {
  const byRound = ROUND_ORDER.reduce((acc, r) => {
    acc[r] = fixtures.filter(f => f.round === r)
    return acc
  }, {})
  const thirdPlace = fixtures.find(f => f.round === '3RD')

  const treeRef = useRef(null)
  const matchRefs = useRef({})
  const [paths, setPaths] = useState([])

  const registerRef = useCallback((id, el) => {
    if (el) matchRefs.current[id] = el
    else delete matchRefs.current[id]
  }, [])

  // Draw real elbow connectors between each match and the two earlier-round
  // matches that feed into it (derived from homeSlot/awaySlot {w:matchId}),
  // measured from actual DOM positions so the tree always lines up correctly
  // regardless of card height/wrapping.
  useLayoutEffect(() => {
    const compute = () => {
      const container = treeRef.current
      if (!container) return
      const cRect = container.getBoundingClientRect()
      const next = []
      const addConnection = (sourceId, targetId, resolved) => {
        const sEl = matchRefs.current[sourceId]
        const tEl = matchRefs.current[targetId]
        if (!sEl || !tEl) return
        const sRect = sEl.getBoundingClientRect()
        const tRect = tEl.getBoundingClientRect()
        const x1 = sRect.right - cRect.left
        const y1 = sRect.top + sRect.height / 2 - cRect.top
        const x2 = tRect.left - cRect.left
        const y2 = tRect.top + tRect.height / 2 - cRect.top
        const midX = (x1 + x2) / 2
        next.push({ key: `${sourceId}-${targetId}`, d: `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`, resolved })
      }

      fixtures.forEach(m => {
        if (m.round === '3RD') return // separate section, different coordinate space
        if (m.homeSlot?.w != null) addConnection(`M${m.homeSlot.w}`, m.id, m.home != null)
        if (m.awaySlot?.w != null) addConnection(`M${m.awaySlot.w}`, m.id, m.away != null)
      })
      setPaths(next)
    }

    compute()
    const ro = new ResizeObserver(compute)
    if (treeRef.current) ro.observe(treeRef.current)
    window.addEventListener('resize', compute)
    return () => { ro.disconnect(); window.removeEventListener('resize', compute) }
  }, [fixtures])

  const startsIn = (() => {
    const first = byRound.R32[0]
    if (!first) return null
    const diff = new Date(first.kickoff).getTime() - Date.now()
    if (diff <= 0) return null
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  })()

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Knockout</h2>
          <p>Real results · Round of 32 through the Final</p>
        </div>
      </div>

      {startsIn !== null && (
        <div className={styles.notStarted}>
          <div className={styles.notStartedIcon}>🏆</div>
          <div className={styles.notStartedTitle}>Knockout stage starts in {startsIn} day{startsIn !== 1 ? 's' : ''}</div>
          <div className={styles.notStartedSub}>
            Round of 32 kicks off {formatAESTDate(byRound.R32[0].kickoff)}, once group standings are final.
            Slots below fill in automatically as groups wrap up and matches are played.
          </div>
        </div>
      )}

      {/* Horizontally scrollable connected tree */}
      <div className={styles.treeScroll}>
        <div className={styles.tree} ref={treeRef}>
          <svg className={styles.connectorLayer}>
            {paths.map(p => (
              <path key={p.key} d={p.d} className={p.resolved ? styles.connectorResolved : styles.connectorPending} />
            ))}
          </svg>
          {ROUND_ORDER.map(r => (
            <div key={r} className={styles.column}>
              <div className={styles.columnHeader}>{KNOCKOUT_ROUND_LABELS[r]}</div>
              <div className={`${styles.matchList} ${styles[`matchList_${r}`]}`}>
                {byRound[r].map(m => <MatchCard key={m.id} match={m} registerRef={registerRef} />)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {thirdPlace && (
        <div className={styles.thirdPlaceSection}>
          <div className={styles.columnHeader}>{KNOCKOUT_ROUND_LABELS['3RD']}</div>
          <MatchCard match={thirdPlace} registerRef={registerRef} />
        </div>
      )}
    </div>
  )
}
