import React, { useState, useCallback, useEffect } from 'react'
import GroupStage from './components/GroupStage.jsx'
import Schedule from './components/Schedule.jsx'
import Results from './components/Results.jsx'
import TableView from './components/TableView.jsx'
import Bracket from './components/Bracket.jsx'
import AIPredictions from './components/AIPredictions.jsx'
import styles from './App.module.css'

const STORAGE_KEY = 'wc2026_predictions'

const TABS = [
  { id: 'predictor', label: 'Predictor', icon: '⚽' },
  { id: 'schedule',  label: 'Schedule',  icon: '📅' },
  { id: 'results',   label: 'Results',   icon: '🏁' },
  { id: 'table',     label: 'Standings', icon: '📊' },
  { id: 'bracket',   label: 'Bracket',   icon: '🏆' },
  { id: 'ai',        label: 'AI Picks',  icon: '🤖' },
]

export default function App() {
  const [tab, setTab] = useState('predictor')

  // Load from localStorage on mount
  const [predictions, setPredictions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch { return {} }
  })

  // Save to localStorage whenever predictions change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions))
    } catch {}
  }, [predictions])

  const predict = useCallback((fixtureId, h, a) => {
    setPredictions(prev => ({ ...prev, [fixtureId]: { h, a } }))
  }, [])

  const bulkPredict = useCallback((map) => {
    setPredictions(prev => ({ ...prev, ...map }))
  }, [])

  const clearAll = useCallback(() => {
    setPredictions({})
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const predCount = Object.values(predictions).filter(p => p.h != null).length
  const totalUpcoming = 48

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <div className={styles.brandBall}>⚽</div>
            <div>
              <div className={styles.brandName}>World Cup 2026</div>
              <div className={styles.brandSub}>Predictor · USA / CAN / MEX</div>
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

      <main className={styles.main}>
        <div className={styles.content}>
          {tab === 'predictor' && <GroupStage predictions={predictions} onPredict={predict} onBulkPredict={bulkPredict} />}
          {tab === 'schedule'  && <Schedule predictions={predictions} />}
          {tab === 'results'   && <Results />}
          {tab === 'table'     && <TableView predictions={predictions} />}
          {tab === 'bracket'   && <Bracket predictions={predictions} />}
          {tab === 'ai'        && <AIPredictions onApply={bulkPredict} />}
        </div>
      </main>
    </div>
  )
}
