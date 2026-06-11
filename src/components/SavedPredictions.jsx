import React, { useState, useEffect } from 'react'
import styles from './SavedPredictions.module.css'

const SAVES_KEY = 'wc2026_saved_sets'

export default function SavedPredictions({ predictions, onLoad }) {
  const [saves, setSaves] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SAVES_KEY) || '{}') } catch { return {} }
  })
  const [name, setName] = useState('')
  const [open, setOpen] = useState(false)
  const [activeSet, setActiveSet] = useState(null) // name of currently loaded set
  const [dirty, setDirty] = useState(false)        // has it changed since load?

  useEffect(() => {
    try { localStorage.setItem(SAVES_KEY, JSON.stringify(saves)) } catch {}
  }, [saves])

  // Track if predictions differ from the loaded set
  useEffect(() => {
    if (!activeSet || !saves[activeSet]) { setDirty(false); return }
    const saved = JSON.stringify(saves[activeSet].data)
    const current = JSON.stringify(predictions)
    setDirty(saved !== current)
  }, [predictions, activeSet, saves])

  const save = () => {
    const n = name.trim() || `Prediction ${new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short' })} ${new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}`
    setSaves(prev => ({ ...prev, [n]: { data: { ...predictions }, saved: new Date().toISOString() } }))
    setName('')
    setActiveSet(n)
    setDirty(false)
  }

  const update = () => {
    if (!activeSet) return
    setSaves(prev => ({ ...prev, [activeSet]: { data: { ...predictions }, saved: new Date().toISOString() } }))
    setDirty(false)
  }

  const load = (n) => {
    onLoad(saves[n].data)
    setActiveSet(n)
    setDirty(false)
    setOpen(false)
  }

  const del = (n) => {
    setSaves(prev => { const s = { ...prev }; delete s[n]; return s })
    if (activeSet === n) { setActiveSet(null); setDirty(false) }
  }

  const count = Object.values(predictions).filter(p => p?.h != null).length
  const saveCount = Object.keys(saves).length

  return (
    <div className={styles.wrap}>
      {/* Active set banner */}
      {activeSet && (
        <div className={`${styles.activeBanner} ${dirty ? styles.activeDirty : ''}`}>
          <div className={styles.activeLeft}>
            <span className={styles.activeIcon}>{dirty ? '✏️' : '✓'}</span>
            <span className={styles.activeName}>{activeSet}</span>
            {dirty && <span className={styles.dirtyTag}>unsaved changes</span>}
          </div>
          {dirty && (
            <button className={styles.updateBtn} onClick={update}>
              ↑ Update
            </button>
          )}
        </div>
      )}

      <div className={styles.saveRow}>
        <input
          className={styles.input}
          placeholder={activeSet ? `Save as new (or update above)…` : `Name this prediction set…`}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && count > 0 && save()}
        />
        <button className={styles.saveBtn} onClick={save} disabled={count === 0}>
          💾 Save new
        </button>
        {saveCount > 0 && (
          <button
            className={`${styles.loadBtn} ${open ? styles.loadBtnOpen : ''}`}
            onClick={() => setOpen(o => !o)}
          >
            📂 {saveCount}
          </button>
        )}
      </div>

      {open && saveCount > 0 && (
        <div className={styles.list}>
          {Object.entries(saves)
            .sort((a, b) => new Date(b[1].saved) - new Date(a[1].saved))
            .map(([n, s]) => {
              const pickCount = Object.values(s.data).filter(p => p?.h != null).length
              const d = new Date(s.saved)
              const isActive = n === activeSet
              return (
                <div key={n} className={`${styles.item} ${isActive ? styles.itemActive : ''}`}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>
                      {isActive && <span className={styles.activeDot} />}
                      {n}
                    </span>
                    <span className={styles.itemMeta}>
                      {pickCount} picks · {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      {isActive && dirty && <span className={styles.itemDirty}> · unsaved</span>}
                    </span>
                  </div>
                  <div className={styles.itemActions}>
                    {isActive && dirty
                      ? <button className={styles.updateItemBtn} onClick={update}>↑ Update</button>
                      : <button className={styles.loadItemBtn} onClick={() => load(n)} disabled={isActive && !dirty}>
                          {isActive ? 'Active' : 'Load'}
                        </button>
                    }
                    <button className={styles.delBtn} onClick={() => del(n)}>✕</button>
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
