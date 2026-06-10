import React, { useState, useCallback } from 'react'
import GroupStage from './components/GroupStage.jsx'
import Schedule from './components/Schedule.jsx'
import Results from './components/Results.jsx'
import TableView from './components/TableView.jsx'
import Bracket from './components/Bracket.jsx'
import styles from './App.module.css'

const TABS = [
  { id: 'predictor', label: 'Predictor', icon: '⚽' },
  { id: 'schedule',  label: 'Schedule',  icon: '📅' },
  { id: 'results',   label: 'Results',   icon: '🏁' },
  { id: 'table',     label: 'Standings', icon: '📊' },
  { id: 'bracket',   label: 'Bracket',   icon: '🏆' },
]

export default function App() {
  const [tab, setTab] = useState('predictor')
  const [predictions, setPredictions] = useState({})

  const predict = useCallback((fixtureId, h, a) => {
    setPredictions(prev => ({ ...prev, [fixtureId]: { h, a } }))
  }, [])

  const bulkPredict = useCallback((map) => {
    setPredictions(prev => ({ ...prev, ...map }))
  }, [])

  const clearAll = useCallback(() => setPredictions({}), [])

  const predCount = Object.keys(predictions).length
  const totalUpcoming = 48 // all group stage matches

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
                <span className={styles.predNum}>{predCount}</span>/{totalUpcoming} predicted
              </div>
            )}
            {predCount > 0 && (
              <button className={styles.clearBtn} onClick={clearAll}>Clear all</button>
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
        </div>
      </main>
    </div>
  )
}
