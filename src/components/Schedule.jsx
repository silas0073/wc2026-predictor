import React, { useState } from 'react'
import { FIXTURES, GROUP_LABELS, TEAMS } from '../data.js'
import { teamObj, formatAESTDate, formatAEST } from '../utils.js'
import { matchOdds, formLabel } from '../odds.js'
import styles from './Schedule.module.css'

const ROUND_LABELS = {
  R32: 'Round of 32',
  R16: 'Round of 16',
  QF:  'Quarter-Finals',
  SF:  'Semi-Finals',
  F:   'Final',
  TPF: '3rd Place Play-off',
}

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

function aestDate(kickoff, date) {
  return kickoff
    ? new Date(new Date(kickoff).getTime() + 10*60*60*1000).toISOString().slice(0,10)
    : date
}

function dateLabel(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' })
}

export default function Schedule({ predictions, fixtures = FIXTURES, knockoutFixtures = [] }) {
  const [section, setSection] = useState('knockout')
  const [filterGroup, setFilterGroup] = useState('ALL')
  const [filterRound, setFilterRound] = useState('ALL')
  const [showPlayed, setShowPlayed] = useState(true)

  // ── Group stage ──────────────────────────────────────────────────────────
  const filteredGroup = fixtures.filter(f =>
    (filterGroup === 'ALL' || f.group === filterGroup) &&
    (showPlayed || f.homeScore === null)
  )
  const groupByDate = filteredGroup.reduce((acc, f) => {
    const d = aestDate(f.kickoff, f.date)
    if (!acc[d]) acc[d] = []
    acc[d].push(f)
    return acc
  }, {})
  const groupDates = Object.keys(groupByDate).sort()

  // ── Knockout ─────────────────────────────────────────────────────────────
  // Include all knockout fixtures (TBD ones too — they're in the schedule)
  const knockoutRounds = [...new Set(knockoutFixtures.map(f => f.round))]
  const filteredKnockout = knockoutFixtures.filter(f =>
    (filterRound === 'ALL' || f.round === filterRound) &&
    (showPlayed || f.homeScore === null)
  )
  const knockoutByDate = filteredKnockout.reduce((acc, f) => {
    const d = aestDate(f.kickoff, f.date)
    if (!acc[d]) acc[d] = []
    acc[d].push(f)
    return acc
  }, {})
  const knockoutDates = Object.keys(knockoutByDate).sort()

  const teamDisplay = (code, descriptor) => {
    if (code) return teamObj(code)
    // descriptor is an object like {g:'A',p:1} or a string like 'Winner M73'
    if (!descriptor) return { flag: '🏳️', name: 'TBD' }
    if (typeof descriptor === 'string') return { flag: '🏳️', name: descriptor }
    const pos = descriptor.p === 1 ? '1st' : descriptor.p === 2 ? '2nd' : `${descriptor.p}th`
    return { flag: '🏳️', name: `${pos} Grp ${descriptor.g}` }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <h2>Schedule</h2>
        <p>All fixtures · times in AEST</p>
      </div>

      {/* Section toggle */}
      <div className={styles.sectionToggle}>
        <button
          className={`${styles.sToggleBtn} ${section === 'group' ? styles.sToggleActive : ''}`}
          onClick={() => setSection('group')}
        >
          Group Stage
        </button>
        <button
          className={`${styles.sToggleBtn} ${section === 'knockout' ? styles.sToggleActive : ''}`}
          onClick={() => setSection('knockout')}
          disabled={knockoutFixtures.length === 0}
        >
          Knockout
        </button>
      </div>

      {section === 'group' && (
        <>
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

          {groupDates.map(date => (
            <div key={date} className={styles.dateBlock}>
              <div className={styles.dateHeader}>{dateLabel(date)}</div>
              {groupByDate[date].map(f => {
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
          {groupDates.length === 0 && <div className={styles.empty}>No fixtures match your filter</div>}
        </>
      )}

      {section === 'knockout' && (
        <>
          <div className={styles.filterRow}>
            <div className={styles.filters}>
              <button className={`${styles.fBtn} ${filterRound==='ALL' ? styles.fActive : ''}`} onClick={() => setFilterRound('ALL')}>All</button>
              {knockoutRounds.map(r => (
                <button key={r} className={`${styles.fBtn} ${filterRound===r ? styles.fActive : ''}`} onClick={() => setFilterRound(r)}>
                  {ROUND_LABELS[r] || r}
                </button>
              ))}
            </div>
            <button
              className={`${styles.toggleBtn} ${showPlayed ? styles.toggleOn : ''}`}
              onClick={() => setShowPlayed(p => !p)}
            >
              {showPlayed ? '✓ Showing results' : 'Show results'}
            </button>
          </div>

          {knockoutDates.map(date => (
            <div key={date} className={styles.dateBlock}>
              <div className={styles.dateHeader}>{dateLabel(date)}</div>
              {knockoutByDate[date].map(f => {
                const home = teamDisplay(f.home, f.homeDescriptor || f._homeSlot)
                const away = teamDisplay(f.away, f.awayDescriptor || f._awaySlot)
                const isPlayed = f.homeScore !== null
                const isLive = f.liveStatus === 'in'
                const isTBD = !f.home || !f.away
                const hasShootout = f.homeShootout != null && f.awayShootout != null
                const soHome = hasShootout && f.homeShootout > f.awayShootout
                const soAway = hasShootout && f.awayShootout > f.homeShootout

                return (
                  <div key={f.id} className={`${styles.row} ${isPlayed ? styles.rowPlayed : ''} ${isLive ? styles.rowLive : ''} ${isTBD ? styles.rowTBD : ''}`}>
                    <div className={styles.rowMeta}>
                      <span className={styles.grpBadge}>{ROUND_LABELS[f.round] || f.round}</span>
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
                        <span className={`${styles.name} ${isTBD ? styles.nameTBD : ''}`}>{home.name}</span>
                      </div>
                      <div className={styles.scoreArea}>
                        {isPlayed ? (
                          <div className={styles.scoreStack}>
                            <span className={styles.liveScore}>
                              <span className={(f.homeScore > f.awayScore || soHome) ? styles.win : ''}>{f.homeScore}</span>
                              <span className={styles.sdash}>–</span>
                              <span className={(f.awayScore > f.homeScore || soAway) ? styles.win : ''}>{f.awayScore}</span>
                            </span>
                            {hasShootout && (
                              <span className={styles.shootoutNote}>({f.homeShootout}–{f.awayShootout} pens)</span>
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
                        <span className={`${styles.name} ${isTBD ? styles.nameTBD : ''}`}>{away.name}</span>
                        <span className={styles.flag}>{away.flag}</span>
                      </div>
                    </div>

                    <div className={styles.venue}>{f.venue}</div>
                    {/* Odds bar only when both teams are known and match not yet played */}
                    {!isPlayed && !isLive && !isTBD && <OddsBar homeCode={f.home} awayCode={f.away} />}
                  </div>
                )
              })}
            </div>
          ))}
          {knockoutDates.length === 0 && <div className={styles.empty}>No fixtures match your filter</div>}
        </>
      )}
    </div>
  )
}
