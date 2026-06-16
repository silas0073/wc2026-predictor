import React, { useState, useEffect } from 'react'
import { FIXTURES, GROUP_LABELS, TEAMS } from '../data.js'
import { teamObj, formatDate } from '../utils.js'
import styles from './Results.module.css'

// Cache highlight results at module level — survives component re-renders
// caused by parent live-data polling, preventing the "load then hide" issue
const highlightCache = {} // v2 - SBS only

function HighlightCard({ homeCode, awayCode }) {
  const cacheKey = `sbs2-${homeCode}-${awayCode}`
  const [state, setState] = useState(() => highlightCache[cacheKey] ? 'found' : 'idle')
  const [video, setVideo] = useState(() => highlightCache[cacheKey] || null)

  const home = TEAMS[homeCode]?.name || homeCode
  const away = TEAMS[awayCode]?.name || awayCode

  useEffect(() => {
    if (highlightCache[cacheKey]) {
      setVideo(highlightCache[cacheKey])
      setState('found')
      return
    }
    let mounted = true
    const fetchHighlight = async () => {
      setState('loading')
      try {
        const res = await fetch(`/api/highlights?home=${encodeURIComponent(home)}&away=${encodeURIComponent(away)}`)
        const data = await res.json()
        if (mounted) {
          if (data.videoId && data.source === 'sbs') {
            // Only cache genuine SBS results
            highlightCache[cacheKey] = data
            setVideo(data)
            setState('found')
          } else if (data.videoId) {
            // Non-SBS result — show but don't cache so it retries next time
            setVideo(data)
            setState('found')
          } else if (data.searchUrl || data.fallback) {
            // API error fallback — show a plain search link
            const fallbackData = {
              videoUrl: data.searchUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(home + ' ' + away + ' highlights World Cup 2026 SBS Sport')}`,
              title: `${home} vs ${away} — highlights`,
              thumbnail: null,
              channel: 'SBS Sport (search)',
              fallback: true,
            }
            highlightCache[cacheKey] = fallbackData
            setVideo(fallbackData)
            setState('found')
          } else {
            setState('notfound')
          }
        }
      } catch {
        if (mounted) setState('notfound')
      }
    }
    fetchHighlight()
    return () => { mounted = false }
  }, [cacheKey])

  if (state === 'loading') return (
    <div className={styles.highlightLoading}>Loading highlights…</div>
  )

  if (state === 'notfound' || state === 'idle') return null

  // Fallback: no thumbnail, just a link
  if (video.fallback || !video.thumbnail) return (
    <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className={styles.highlightFallback}>
      ▶ Watch highlights on YouTube
    </a>
  )

  return (
    <a
      href={video.videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.highlightCard}
    >
      <div className={styles.thumbWrap}>
        {video.thumbnail ? (
          <img src={video.thumbnail} alt="Highlights" className={styles.thumb} />
        ) : (
          <div className={styles.thumbPlaceholder} />
        )}
        <div className={styles.playOverlay}>▶</div>
      </div>
      <div className={styles.highlightMeta}>
        <span className={styles.highlightTitle}>{video.title}</span>
        <span className={styles.highlightChannel}>{video.channel}</span>
      </div>
    </a>
  )
}

export default function Results({ predictions = {}, fixtures = FIXTURES }) {
  const [filterGroup, setFilterGroup] = useState('ALL')

  const played = fixtures.filter(f => f.homeScore !== null)
  const filtered = filterGroup === 'ALL' ? played : played.filter(f => f.group === filterGroup)

  if (played.length === 0) {
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

  const byDate = filtered.reduce((acc, f) => {
    if (!acc[f.date]) acc[f.date] = []
    acc[f.date].push(f)
    return acc
  }, {})
  const dates = Object.keys(byDate).sort((a,b) => b.localeCompare(a))

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <h2>Results</h2>
        <p>{played.length} of 48 group stage matches played</p>
      </div>

      <div className={styles.filters}>
        <button className={`${styles.fBtn} ${filterGroup==='ALL' ? styles.fActive : ''}`} onClick={() => setFilterGroup('ALL')}>All</button>
        {GROUP_LABELS.map(g => (
          <button key={g} className={`${styles.fBtn} ${filterGroup===g ? styles.fActive : ''}`} onClick={() => setFilterGroup(g)}>Grp {g}</button>
        ))}
      </div>

      {dates.map(date => (
        <div key={date} className={styles.dateBlock}>
          <div className={styles.dateHeader}>{formatDate(date)}</div>
          {byDate[date].map(f => {
            const home = teamObj(f.home)
            const away = teamObj(f.away)
            const hw = f.homeScore > f.awayScore
            const aw = f.awayScore > f.homeScore
            const pred = predictions[f.id]
            const hasPred = pred?.h != null

            return (
              <div key={f.id} className={styles.row}>
                <div className={styles.rowTop}>
                <span className={styles.grp}>Grp {f.group}</span>
                <div className={styles.teams}>
                  <div className={`${styles.team} ${styles.teamL}`}>
                    <span className={styles.flag}>{home.flag}</span>
                    <span className={`${styles.name} ${hw ? styles.winner : ''}`}>{home.name}</span>
                  </div>
                  <div className={styles.scoreBox}>
                    <span className={`${styles.s} ${hw ? styles.sWin : ''}`}>{f.homeScore}</span>
                    <span className={styles.sdash}>–</span>
                    <span className={`${styles.s} ${aw ? styles.sWin : ''}`}>{f.awayScore}</span>
                    {hasPred && (
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
                    <span className={`${styles.name} ${aw ? styles.winner : ''}`}>{away.name}</span>
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

                  return (
                    <div className={styles.events}>
                      {all.map((e, i) => {
                        const teamFlag = e.team === f.home ? home.flag : away.flag
                        const teamCode = e.team === f.home ? home.code : away.code
                        return (
                          <div key={i} className={styles.eventItem}>
                            <span className={styles.eventFlag}>{teamFlag}</span>
                            <span className={styles.eventIcon}>{e.kind === 'goal' ? '⚽' : '🟥'}</span>
                            <span className={styles.eventText}>
                              {e.name}{e.ownGoal ? ' (OG)' : ''}{e.minute ? ` ${e.minute}` : ''}
                            </span>
                            <span className={styles.eventTeamCode}>{teamCode}</span>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
                <HighlightCard homeCode={f.home} awayCode={f.away} />
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
