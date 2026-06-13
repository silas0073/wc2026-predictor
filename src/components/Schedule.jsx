import React, { useState } from 'react'
import { FIXTURES, GROUP_LABELS, TEAMS } from '../data.js'
import { teamObj, formatAESTDate, formatAEST } from '../utils.js'
import { matchOdds, formLabel } from '../odds.js'
import styles from './Schedule.module.css'

function OddsBar({ homeCode, awayCode }) {
  const { homeWin, draw, awayWin, fav } = matchOdds(homeCode, awayCode)
  const ht = TEAMS[homeCode], at = TEAMS[awayCode]
  return (
    <div className={styles.oddsWrap}>
      <div className={styles.oddsTeams}>
        <span className={`${styles.oddsTeamLabel} ${fav==='home' ? styles.oddsFavTeam : ''}`}>
          {ht?.flag} {homeCode}{fav==='home' ? ' ⭐' : ''}
        </span>
        <span className={styles.oddsCentre}>{draw}% draw</span>
        <span className={`${styles.oddsTeamLabel} ${styles.oddsTeamRight} ${fav==='away' ? styles.oddsFavTeam : ''}`}>
          {fav==='away' ? '⭐ ' : ''}{awayCode} {at?.flag}
        </span>
      </div>
      <div className={styles.oddsBar}>
        <div className={styles.oddsHome} style={{ width: homeWin + '%' }} />
        <div className={styles.oddsDraw} style={{ width: draw + '%' }} />
        <div className={styles.oddsAway} style={{ width: awayWin + '%' }} />
      </div>
      <div className={styles.oddsLabels}>
        <span className={styles.oddsNum} style={{ color: fav==='home' ? 'var(--green)' : 'var(--muted)' }}>{homeWin}%</span>
        <span className={styles.oddsNum} style={{ color: fav==='away' ? 'var(--green)' : 'var(--muted)' }}>{awayWin}%</span>
      </div>
      <div className={styles.formRow}>
        <span title="Recent form (last 5)">{formLabel(homeCode)}</span>
        <span className={styles.formLabel}>form</span>
        <span title="Recent form (last 5)">{formLabel(awayCode)}</span>
      </div>
    </div>
  )
}

export default function Schedule({ predictions, fixtures = FIXTURES }) {
  const [filterGroup, setFilterGroup] = useState('ALL')
  const [showPlayed, setShowPlayed] = useState(true)

  const filtered = fixtures.filter(f =>
    (filterGroup === 'ALL' || f.group === filterGroup) &&
    (showPlayed || f.homeScore === null)
  )

  // Group by AEST date (derived from kickoff UTC)
  const byDate = filtered.reduce((acc, f) => {
    const aestDate = f.kickoff
      ? new Date(new Date(f.kickoff).getTime() + 10*60*60*1000).toISOString().slice(0,10)
      : f.date
    if (!acc[aestDate]) acc[aestDate] = []
    acc[aestDate].push(f)
    return acc
  }, {})
  const dates = Object.keys(byDate).sort()

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <h2>Schedule</h2>
        <p>All fixtures · times in AEST</p>
      </div>

      <div className={styles.filterRow}>
        <div className={styles.filters}>
          <button className={`${styles.fBtn} ${filterGroup==='ALL' ? styles.fActive : ''}`} onClick={() => setFilterGroup('ALL')}>All</button>
          {GROUP_LABELS.map(g => (
            <button key={g} className={`${styles.fBtn} ${filterGroup===g ? styles.fActive : ''}`} onClick={() => setFilterGroup(g)}>Grp {g}</button>
          ))}
        </div>
        <button
          className={`${styles.toggleBtn} ${showPlayed ? styles.toggleOn : ''}`}
          onClick={() => setShowPlayed(p => !p)}
        >
          {showPlayed ? '✓ Showing results' : 'Show results'}
        </button>
      </div>

      {dates.map(date => (
        <div key={date} className={styles.dateBlock}>
          <div className={styles.dateHeader}>
            {new Date(date + 'T12:00:00').toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' })}
          </div>
          {byDate[date].map(f => {
            const home = teamObj(f.home)
            const away = teamObj(f.away)
            const isPlayed = f.homeScore !== null
            const isLive = f.liveStatus === 'in'
            const pred = predictions[f.id]
            return (
              <div key={f.id} className={`${styles.row} ${isPlayed ? styles.rowPlayed : ''} ${isLive ? styles.rowLive : ''}`}>
                <div className={styles.rowMeta}>
                  <span className={styles.grpBadge}>Grp {f.group}</span>
                  <span className={styles.time}>
                    {isPlayed
                      ? <span className={styles.ftBadge}>FT</span>
                      : isLive
                        ? <span className={styles.liveBadge}>● {f.liveClock || 'LIVE'}</span>
                        : formatAEST(f.kickoff)
                    }
                  </span>
                </div>

                <div className={styles.matchRow}>
                  <div className={styles.team}>
                    <span className={styles.flag}>{home.flag}</span>
                    <span className={styles.name}>{home.name}</span>
                  </div>

                  <div className={styles.scoreArea}>
                    {isPlayed ? (
                      <div className={styles.scoreStack}>
                        <span className={styles.liveScore}>
                          <span className={f.homeScore > f.awayScore ? styles.win : ''}>{f.homeScore}</span>
                          <span className={styles.sdash}>–</span>
                          <span className={f.awayScore > f.homeScore ? styles.win : ''}>{f.awayScore}</span>
                        </span>
                        {pred?.h != null && pred?.a != null && (
                          <span className={styles.predCompare}>
                            predicted {pred.h}-{pred.a}
                            {pred.h === f.homeScore && pred.a === f.awayScore
                              ? <span className={styles.predExact}> ✓</span>
                              : (pred.h > pred.a) === (f.homeScore > f.awayScore) &&
                                (pred.h === pred.a) === (f.homeScore === f.awayScore)
                                ? <span className={styles.predResult}> ~</span>
                                : <span className={styles.predWrong}> ✗</span>
                            }
                          </span>
                        )}
                      </div>
                    ) : isLive ? (
                      <span className={styles.liveScoreActive}>
                        {f.liveHomeScore} – {f.liveAwayScore}
                      </span>
                    ) : (
                      <span className={styles.vsText}>vs</span>
                    )}
                  </div>

                  <div className={`${styles.team} ${styles.teamR}`}>
                    <span className={styles.name}>{away.name}</span>
                    <span className={styles.flag}>{away.flag}</span>
                  </div>
                </div>

                <div className={styles.venue}>{f.venue}</div>

                {!isPlayed && !isLive && <OddsBar homeCode={f.home} awayCode={f.away} />}
              </div>
            )
          })}
        </div>
      ))}

      {dates.length === 0 && (
        <div className={styles.empty}>No fixtures match your filter</div>
      )}
    </div>
  )
}
