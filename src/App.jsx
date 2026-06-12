import React, { useState, useCallback, useEffect } from 'react'
import GroupStage from './components/GroupStage.jsx'
import Schedule from './components/Schedule.jsx'
import Results from './components/Results.jsx'
import TableView from './components/TableView.jsx'
import Bracket from './components/Bracket.jsx'
import AIPredictions from './components/AIPredictions.jsx'
import GoldenBoot from './components/GoldenBoot.jsx'
import LiveScores from './components/LiveScores.jsx'
import { useLiveResults } from './useLiveResults.js'
import Banner from './components/Banner.jsx'
import { FIXTURES } from './data.js'
import styles from './App.module.css'

const STORAGE_KEY = 'wc2026_predictions'
const BRACKET_KEY = 'wc2026_bracket'

// Only count valid upcoming fixture IDs
const VALID_IDS = new Set(FIXTURES.map(f => f.id))

const TABS = [
  { id: 'predictor', label: 'Predictor', icon: '⚽' },
  { id: 'bracket',   label: 'Bracket',   icon: '🏆' },
  { id: 'ai',        label: 'AI Picks',  icon: '🤖' },
  { id: 'schedule',  label: 'Schedule',  icon: '📅' },
  { id: 'results',   label: 'Results',   icon: '🏁' },
  { id: 'table',     label: 'Standings', icon: '📊' },
  { id: 'golden',    label: 'Top Scorers', icon: '🥾' },
]

export default function App() {
  const [tab, setTab] = useState('predictor')
  const { fixtures: liveFixtures } = useLiveResults()

  const [predictions, setPredictions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return {}
      const parsed = JSON.parse(saved)
      // Strip any keys that aren't valid fixture IDs
      return Object.fromEntries(Object.entries(parsed).filter(([id]) => VALID_IDS.has(id)))
    } catch { return {} }
  })

  const [bracketPicks, setBracketPicks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(BRACKET_KEY) || '{}') } catch { return {} }
  })

  useEffect(() => {
    try { localStorage.setItem(BRACKET_KEY, JSON.stringify(bracketPicks)) } catch {}
  }, [bracketPicks])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions)) } catch {}
  }, [predictions])

  const predict = useCallback((fixtureId, h, a) => {
    if (!VALID_IDS.has(fixtureId)) return
    setPredictions(prev => ({ ...prev, [fixtureId]: { h, a } }))
  }, [])

  const bulkPredict = useCallback((map) => {
    // Only merge valid fixture IDs
    const clean = Object.fromEntries(Object.entries(map).filter(([id]) => VALID_IDS.has(id)))
    setPredictions(prev => ({ ...prev, ...clean }))
  }, [])

  // Replace predictions entirely (used by group clear)
  const replacePredictions = useCallback((map) => {
    const clean = Object.fromEntries(Object.entries(map).filter(([id]) => VALID_IDS.has(id)))
    setPredictions(clean)
  }, [])

  // Load a saved set — replaces predictions and bracket picks together.
  // If the saved set has no bracket data (older saves), clear bracket so
  // it regenerates fresh from the new group standings.
  const loadPredictions = useCallback((map, bracket) => {
    const clean = Object.fromEntries(Object.entries(map).filter(([id]) => VALID_IDS.has(id)))
    setPredictions(clean)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean))
    if (bracket && Object.keys(bracket).length > 0) {
      setBracketPicks(bracket)
    } else {
      setBracketPicks({})
      localStorage.removeItem(BRACKET_KEY)
    }
  }, [])

  const clearAll = useCallback(() => {
    setPredictions({})
    setBracketPicks({})
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(BRACKET_KEY)
  }, [])

  // Count only valid predictions with actual scores
  const predCount = Object.entries(predictions)
    .filter(([id, p]) => VALID_IDS.has(id) && p.h != null && p.a != null).length
  const totalUpcoming = VALID_IDS.size

  return (
    <div className={styles.app}>
      <div className={styles.stickyTop}>
      <Banner />
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <div className={styles.brandBall}>⚽</div>
            <div>
              <div className={styles.brandName}>World Cup 2026</div>
              <div className={styles.brandSub}>Predictor · USA / CAN / MEX · v{__APP_VERSION__}</div>
            </div>
          </div>
          <div className={styles.headerRight}>
            {predCount > 0 && (
              <div className={styles.predPill}>
                <span className={styles.predNum}>{predCount}</span>/{totalUpcoming}
                <span className={styles.savedDot} title="Saved">💾</span>
              </div>
            )}
            {predCount > 0 && (
              <button className={styles.clearBtn} onClick={clearAll}>Clear</button>
            )}
          </div>
        </div>
      </header>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          {TABS.map(t => (
            <button
              key={t.id}
              className={`${styles.navBtn} ${tab === t.id ? styles.active : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span className={styles.navIcon}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
      <LiveScores />
      </div>

      <main className={styles.main}>
        <div className={styles.content}>
          {tab === 'predictor' && <GroupStage predictions={predictions} onPredict={predict} onBulkPredict={bulkPredict} onLoad={loadPredictions} onReplace={replacePredictions} fixtures={liveFixtures} bracketPicks={bracketPicks} />}
          {tab === 'schedule'  && <Schedule predictions={predictions} fixtures={liveFixtures} />}
          {tab === 'results'   && <Results predictions={predictions} fixtures={liveFixtures} />}
          {tab === 'table'     && <TableView predictions={predictions} fixtures={liveFixtures} />}
          {tab === 'bracket'   && <Bracket predictions={predictions} fixtures={liveFixtures} picks={bracketPicks} onPicksChange={setBracketPicks} />}
          {tab === 'ai'        && <AIPredictions onApply={bulkPredict} />}
          {tab === 'golden'    && <GoldenBoot />}
        </div>
      </main>
    </div>
  )
}
