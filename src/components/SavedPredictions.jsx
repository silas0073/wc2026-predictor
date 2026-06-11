import React, { useState, useEffect } from 'react'
import styles from './SavedPredictions.module.css'

const SAVES_KEY = 'wc2026_saved_sets'

export default function SavedPredictions({ predictions, onLoad }) {
  const [saves, setSaves] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SAVES_KEY) || '{}') } catch { return {} }
  })
  const [name, setName] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try { localStorage.setItem(SAVES_KEY, JSON.stringify(saves)) } catch {}
  }, [saves])

  const save = () => {
    const n = name.trim() || `Prediction ${new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}`
    setSaves(prev => ({ ...prev, [n]: { data: predictions, saved: new Date().toISOString() } }))
    setName('')
  }

  const load = (n) => { onLoad(saves[n].data); setOpen(false) }
  const del  = (n) => setSaves(prev => { const s = {...prev}; delete s[n]; return s })

  const count = Object.keys(predictions).filter(id => predictions[id]?.h != null).length
  const saveCount = Object.keys(saves).length

  return (
    <div className={styles.wrap}>
      <div className={styles.saveRow}>
        <input
          className={styles.input}
          placeholder="Name this prediction set…"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && count > 0 && save()}
        />
        <button className={styles.saveBtn} onClick={save} disabled={count === 0}>
          💾 Save ({count} picks)
        </button>
        {saveCount > 0 && (
          <button className={`${styles.loadBtn} ${open ? styles.loadBtnOpen : ''}`} onClick={() => setOpen(o => !o)}>
            📂 Saved ({saveCount})
          </button>
        )}
      </div>

      {open && saveCount > 0 && (
        <div className={styles.list}>
          {Object.entries(saves).sort((a,b) => new Date(b[1].saved) - new Date(a[1].saved)).map(([n, s]) => {
            const pickCount = Object.values(s.data).filter(p => p?.h != null).length
            const d = new Date(s.saved)
            return (
              <div key={n} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{n}</span>
                  <span className={styles.itemMeta}>{pickCount} picks · {d.toLocaleDateString('en-GB', { day:'numeric', month:'short' })}</span>
                </div>
                <div className={styles.itemActions}>
                  <button className={styles.loadItemBtn} onClick={() => load(n)}>Load</button>
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
