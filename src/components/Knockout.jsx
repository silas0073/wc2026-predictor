import React from 'react'
import { TEAMS, KNOCKOUT_ROUND_LABELS } from '../data.js'
import { formatAEST, formatAESTDate } from '../utils.js'
import styles from './Knockout.module.css'

const ROUND_ORDER = ['R32', 'R16', 'QF', 'SF', 'FINAL']

function TeamRow({ code, score, shootout, isWinner, isLive, liveScore }) {
  if (!code) {
    return (
      <div className={`${styles.teamRow} ${styles.tbd}`}>
        <span className={styles.crest}>•</span>
        <span className={styles.teamName}>TBD</span>
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

function MatchCard({ match }) {
  const { home, away, homeScore, awayScore, homeShootout, awayShootout, liveStatus, liveHomeScore, liveAwayScore, liveClock, kickoff, venue } = match
  const played = homeScore !== null && awayScore !== null
  const isLive = liveStatus === 'in'
  let homeWin = false, awayWin = false
  if (played) {
    if (homeScore !== awayScore) { homeWin = homeScore > awayScore; awayWin = !homeWin }
    else if (homeShootout != null && awayShootout != null) { homeWin = homeShootout > awayShootout; awayWin = !homeWin }
  }

  return (
    <div className={`${styles.match} ${played ? styles.played : ''} ${isLive ? styles.live : ''}`}>
      <div className={styles.matchMeta}>
        <span>{formatAESTDate(kickoff)} · {formatAEST(kickoff)}</span>
        {isLive && <span className={styles.liveTag}>● LIVE {liveClock || ''}</span>}
      </div>
      <TeamRow code={home} score={homeScore} shootout={homeShootout} isWinner={homeWin} isLive={isLive} liveScore={liveHomeScore} />
      <TeamRow code={away} score={awayScore} shootout={awayShootout} isWinner={awayWin} isLive={isLive} liveScore={liveAwayScore} />
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
        <div className={styles.tree}>
          {ROUND_ORDER.map(r => (
            <div key={r} className={styles.column}>
              <div className={styles.columnHeader}>{KNOCKOUT_ROUND_LABELS[r]}</div>
              <div className={`${styles.matchList} ${styles[`matchList_${r}`]}`}>
                {byRound[r].map(m => <MatchCard key={m.id} match={m} />)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {thirdPlace && (
        <div className={styles.thirdPlaceSection}>
          <div className={styles.columnHeader}>{KNOCKOUT_ROUND_LABELS['3RD']}</div>
          <MatchCard match={thirdPlace} />
        </div>
      )}
    </div>
  )
}
