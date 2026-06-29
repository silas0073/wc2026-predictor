import React, { useState, useEffect, useRef } from 'react'
import { FIXTURES, GROUP_LABELS } from '../data.js'
import { teamObj, formatDate } from '../utils.js'
import styles from './Results.module.css'

const highlightCache = {}

function useHighlight(fixture) {
  const [state, setState] = useState({ candidates: [], loading: false, tried: false })
  const key = fixture.id

  useEffect(() => {
    if (fixture.homeScore === null || state.tried) return
    if (highlightCache[key] !== undefined) {
      setState({ candidates: highlightCache[key], loading: false, tried: true })
      return
    }
    setState(s => ({ ...s, loading: true }))
    const home = encodeURIComponent(fixture.home)
    const away = encodeURIComponent(fixture.away)
    fetch(`/api/highlights?home=${home}&away=${away}&date=${fixture.date}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        const candidates = d.candidates ?? (d.videoId ? [{ videoId: d.videoId }] : [])
        highlightCache[key] = candidates
        setState({ candidates, loading: false, tried: true })
      })
      .catch(() => {
        highlightCache[key] = []
        setState({ candidates: [], loading: false, tried: true })
      })
  }, [fixture.homeScore])

  return state
}

function HighlightEmbed({ fixture, isOpen, onOpen, onClose }) {
  const { candidates, loading } = useHighlight(fixture)
  const [idx, setIdx] = useState(0)
  const iframeRef = useRef(null)

  useEffect(() => { if (!isOpen) setIdx(0) }, [isOpen])

  if (loading) return (
    <div className={styles.highlightRow}>
      <span className={styles.highlightLoading}>🎬 Loading highlights…</span>
    </div>
  )

  const sbsSearchUrl = `https://www.youtube.com/@SBSSportau/search?query=${encodeURIComponent(`${teamObj(fixture.home).name} ${teamObj(fixture.away).name} FIFA World Cup 2026 Highlights`)}`

  if (!candidates.length) return (
    <div className={styles.highlightRow}>
      <a
        className={styles.highlightBtn}
        href={sbsSearchUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        🔍 Search SBS on YouTube
      </a>
    </div>
  )

  const videoId = candidates[idx]?.videoId

  const tryNext = () => {
    if (idx + 1 < candidates.length) setIdx(i => i + 1)
    else onClose()
  }

  return (
    <div className={styles.highlightRow}>
      {!isOpen ? (
        <button className={styles.highlightBtn} onClick={onOpen}>
          ▶ Watch Highlights
        </button>
      ) : (
        <>
          <div className={styles.embedWrap}>
            <iframe
              key={videoId}
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title="Match highlights"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.embed}
              onError={tryNext}
            />
          </div>
          <div className={styles.highlightActions}>
            <button className={styles.closeBtn} onClick={onClose}>✕ Close</button>
            {candidates.length > 1 && idx + 1 < candidates.length && (
              <button className={styles.nextBtn} onClick={tryNext}>↻ Try another</button>
            )}
            <a
              className={styles.nextBtn}
              href={sbsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              🔍 Search SBS on YouTube
            </a>
          </div>
        </>
      )}
    </div>
  )
}

const ROUND_LABELS = {
  R32: 'Round of 32',
  R16: 'Round of 16',
  QF:  'Quarter-Finals',
  SF:  'Semi-Finals',
  F:   'Final',
  TPF: '3rd Place Play-off',
}

function MatchRow({ f, predictions, openHighlight, setOpenHighlight, isKnockout }) {
  const home = teamObj(f.home)
  const away = teamObj(f.away)
  const hw = f.homeScore > f.awayScore
  const aw = f.awayScore > f.homeScore
  const pred = predictions?.[f.id]
  const hasPred = pred?.h != null

  // Shootout display
  const hasShootout = f.homeShootout != null && f.awayShootout != null
  const shootoutWinnerHome = hasShootout && f.homeShootout > f.awayShootout
  const shootoutWinnerAway = hasShootout && f.awayShootout > f.homeShootout

  return (
    <div className={styles.row}>
      <div className={styles.rowTop}>
        {isKnockout ? (
          <span className={styles.grp}>{ROUND_LABELS[f.round] || f.round}</span>
        ) : (
          <span className={styles.grp}>Grp {f.group}</span>
        )}
        <div className={styles.teams}>
          <div className={`${styles.team} ${styles.teamL}`}>
            <span className={styles.flag}>{home.flag}</span>
            <span className={`${styles.name} ${(hw || shootoutWinnerHome) ? styles.winner : ''}`}>{home.name}</span>
          </div>
          <div className={styles.scoreBox}>
            <span className={`${styles.s} ${(hw || shootoutWinnerHome) ? styles.sWin : ''}`}>{f.homeScore}</span>
            <span className={styles.sdash}>–</span>
            <span className={`${styles.s} ${(aw || shootoutWinnerAway) ? styles.sWin : ''}`}>{f.awayScore}</span>
            {hasShootout && (
              <span className={styles.shootoutNote}>
                ({f.homeShootout}–{f.awayShootout} pens)
              </span>
            )}
            {hasPred && !isKnockout && (
              <span className={styles.predBelow}>
                {pred.h}–{pred.a}
                {pred.h === f.homeScore && pred.a === f.awayScore
                  ? <span className={styles.predExact}> ✓</span>
                  : (pred.h > pred.a) === hw || (pred.h === pred.a && !hw && !aw)
                    ? <span className={styles.predResult}> ~</span>
                    : <span className={styles.predWrong}> ✗</span>
                }
              </span>
            )}
          </div>
          <div className={`${styles.team} ${styles.teamR}`}>
            <span className={`${styles.name} ${(aw || shootoutWinnerAway) ? styles.winner : ''}`}>{away.name}</span>
            <span className={styles.flag}>{away.flag}</span>
          </div>
        </div>
      </div>

      {(f.goals?.length > 0 || f.redCards?.length > 0) && (() => {
        const all = [
          ...(f.goals || []).map(g => ({ ...g, kind: 'goal' })),
          ...(f.redCards || []).map(r => ({ ...r, kind: 'red' })),
        ]
        const minuteNum = (m) => {
          const match = (m || '').match(/(\d+)/)
          return match ? parseInt(match[1], 10) : 999
        }
        all.sort((a,b) => minuteNum(a.minute) - minuteNum(b.minute))
        const homeEvents = all.filter(e => e.team === f.home)
        const awayEvents = all.filter(e => e.team === f.away)
        const rows = Math.max(homeEvents.length, awayEvents.length)
        return (
          <div className={styles.events}>
            {Array.from({ length: rows }).map((_, i) => {
              const h = homeEvents[i]
              const a = awayEvents[i]
              return (
                <div key={i} className={styles.eventRow}>
                  <div className={styles.eventHome}>
                    {h && <>
                      <span className={styles.eventIcon}>{h.kind === 'goal' ? '⚽' : '🟥'}</span>
                      <span className={styles.eventText}>{h.name}{h.ownGoal ? ' (OG)' : ''}</span>
                      <span className={styles.eventMinute}>{h.minute}</span>
                      <span className={styles.eventFlag}>{home.flag}</span>
                    </>}
                  </div>
                  <div className={styles.eventAway}>
                    {a && <>
                      <span className={styles.eventFlag}>{away.flag}</span>
                      <span className={styles.eventMinute}>{a.minute}</span>
                      <span className={styles.eventText}>{a.name}{a.ownGoal ? ' (OG)' : ''}</span>
                      <span className={styles.eventIcon}>{a.kind === 'goal' ? '⚽' : '🟥'}</span>
                    </>}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })()}

      <HighlightEmbed
        fixture={f}
        isOpen={openHighlight === f.id}
        onOpen={() => setOpenHighlight(f.id)}
        onClose={() => setOpenHighlight(null)}
      />
    </div>
  )
}

export default function Results({ predictions = {}, fixtures = FIXTURES, knockoutFixtures = [] }) {
  const [section, setSection] = useState('knockout')
  const [filterGroup, setFilterGroup] = useState('ALL')
  const [filterRound, setFilterRound] = useState('ALL')
  const [openHighlight, setOpenHighlight] = useState(null)

  const playedGroup = fixtures.filter(f => f.homeScore !== null)
  const playedKnockout = knockoutFixtures.filter(f => f.homeScore !== null && f.home && f.away)

  const filteredGroup = filterGroup === 'ALL' ? playedGroup : playedGroup.filter(f => f.group === filterGroup)
  const filteredKnockout = filterRound === 'ALL' ? playedKnockout : playedKnockout.filter(f => f.round === filterRound)

  const knockoutRounds = [...new Set(playedKnockout.map(f => f.round))]

  const totalPlayed = playedGroup.length + playedKnockout.length

  if (totalPlayed === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.pageHeader}>
          <h2>Results</h2>
          <p>Completed matches will appear here</p>
        </div>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⏳</div>
          <div className={styles.emptyTitle}>Tournament hasn't started yet</div>
          <div className={styles.emptySub}>The opening match (Mexico vs South Africa) kicks off June 11, 2026. Check back once matches are played.</div>
        </div>
      </div>
    )
  }

  const byDate = (list) => {
    const acc = list.reduce((a, f) => {
      if (!a[f.date]) a[f.date] = []
      a[f.date].push(f)
      return a
    }, {})
    return Object.keys(acc).sort((a,b) => b.localeCompare(a)).map(d => ({ date: d, matches: acc[d] }))
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <h2>Results</h2>
        <p>{playedGroup.length} group stage · {playedKnockout.length} knockout matches played</p>
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
          disabled={playedKnockout.length === 0}
        >
          Knockout {playedKnockout.length > 0 && <span className={styles.sToggleBadge}>{playedKnockout.length}</span>}
        </button>
      </div>

      {section === 'group' && (
        <>
          <div className={styles.filters}>
            <button className={`${styles.fBtn} ${filterGroup==='ALL' ? styles.fActive : ''}`} onClick={() => setFilterGroup('ALL')}>All</button>
            {GROUP_LABELS.map(g => (
              <button key={g} className={`${styles.fBtn} ${filterGroup===g ? styles.fActive : ''}`} onClick={() => setFilterGroup(g)}>Grp {g}</button>
            ))}
          </div>
          {byDate(filteredGroup).map(({ date, matches }) => (
            <div key={date} className={styles.dateBlock}>
              <div className={styles.dateHeader}>{formatDate(date)}</div>
              {matches.map(f => (
                <MatchRow
                  key={f.id}
                  f={f}
                  predictions={predictions}
                  openHighlight={openHighlight}
                  setOpenHighlight={setOpenHighlight}
                  isKnockout={false}
                />
              ))}
            </div>
          ))}
        </>
      )}

      {section === 'knockout' && (
        <>
          {playedKnockout.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🏆</div>
              <div className={styles.emptyTitle}>No knockout matches played yet</div>
              <div className={styles.emptySub}>The Round of 32 kicks off June 28, 2026.</div>
            </div>
          ) : (
            <>
              <div className={styles.filters}>
                <button className={`${styles.fBtn} ${filterRound==='ALL' ? styles.fActive : ''}`} onClick={() => setFilterRound('ALL')}>All</button>
                {knockoutRounds.map(r => (
                  <button key={r} className={`${styles.fBtn} ${filterRound===r ? styles.fActive : ''}`} onClick={() => setFilterRound(r)}>
                    {ROUND_LABELS[r] || r}
                  </button>
                ))}
              </div>
              {byDate(filteredKnockout).map(({ date, matches }) => (
                <div key={date} className={styles.dateBlock}>
                  <div className={styles.dateHeader}>{formatDate(date)}</div>
                  {matches.map(f => (
                    <MatchRow
                      key={f.id}
                      f={f}
                      predictions={predictions}
                      openHighlight={openHighlight}
                      setOpenHighlight={setOpenHighlight}
                      isKnockout={true}
                    />
                  ))}
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  )
}
