import React, { useState } from 'react'
import { FIXTURES, TEAMS, GROUPS } from '../data.js'
import { groupStandings } from '../utils.js'
import { GROUP_LABELS } from '../data.js'
import styles from './AIPredictions.module.css'

function buildPrompt() {
  const lines = [
    'You are a football analyst predicting every FIFA World Cup 2026 group stage match.',
    'For each match below, predict the score. Consider team strength, tournament history, and host advantage.',
    'Reply ONLY with valid JSON — an object where each key is the fixture id and value is {"h": homeGoals, "a": awayGoals}.',
    'Example: {"A1":{"h":2,"a":0},"A2":{"h":1,"a":1}}',
    'Keep scores realistic (0-4 goals per team max). Fixtures:\n',
  ]
  GROUP_LABELS.forEach(g => {
    lines.push(`Group ${g}:`)
    FIXTURES.filter(f => f.group === g && f.homeScore === null).forEach(f => {
      const ht = TEAMS[f.home], at = TEAMS[f.away]
      lines.push(`  ${f.id}: ${ht.name}${ht.host ? ' (host)' : ''} [str:${ht.strength}] vs ${at.name} [str:${at.strength}] — ${f.date}`)
    })
  })
  lines.push('\nRespond with ONLY the JSON object, no explanation, no markdown.')
  return lines.join('\n')
}

export default function AIPredictions({ onApply }) {
  const [status, setStatus]       = useState('idle')
  const [predictions, setPreds]   = useState(null)
  const [error, setError]         = useState(null)
  const [reasoning, setReasoning] = useState(null)

  const runAI = async () => {
    setStatus('loading')
    setError(null)
    setPreds(null)
    setReasoning(null)

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: buildPrompt() }),
      })

      const raw = await res.text()
      let data
      try { data = JSON.parse(raw) } catch {
        throw new Error('Server returned invalid response: ' + raw.slice(0, 200))
      }

      if (data.error) throw new Error(data.error + (data.detail ? ': ' + data.detail.slice(0, 200) : ''))

      const text = data.content?.[0]?.text || ''
      if (!text) throw new Error('Empty response from AI')
      const clean = text.replace(/```json|```/g, '').trim()
      let parsed
      try { parsed = JSON.parse(clean) } catch {
        throw new Error('AI returned invalid JSON: ' + clean.slice(0, 200))
      }

      setPreds(parsed)
      setStatus('done')

      // Build display by group
      const groups = {}
      Object.entries(parsed).forEach(([id, score]) => {
        const f = FIXTURES.find(x => x.id === id)
        if (!f) return
        if (!groups[f.group]) groups[f.group] = []
        const ht = TEAMS[f.home], at = TEAMS[f.away]
        groups[f.group].push({ home: ht.name, away: at.name, h: score.h, a: score.a, flag_h: ht.flag, flag_a: at.flag })
      })
      setReasoning(groups)

    } catch (e) {
      setStatus('error')
      setError(e.message)
    }
  }

  const projectedStandings = predictions
    ? GROUP_LABELS.map(g => {
        const rows = groupStandings(g, predictions)
        return { group: g, winner: rows[0], runner: rows[1] }
      })
    : null

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <h2>🤖 AI Predictions</h2>
        <p>Claude analyses all 48 group stage fixtures and predicts every score</p>
      </div>

      {status === 'idle' && (
        <div className={styles.startCard}>
          <div className={styles.startIcon}>🧠</div>
          <div className={styles.startTitle}>Get Claude's predictions</div>
          <div className={styles.startDesc}>
            Analyses all 12 groups, 48 matches — factoring in team strength, host advantage, and tournament history.
          </div>
          <button className={styles.runBtn} onClick={runAI}>Generate AI Predictions</button>
        </div>
      )}

      {status === 'loading' && (
        <div className={styles.loadingCard}>
          <div className={styles.spinner} />
          <div className={styles.loadingText}>Analysing all 48 matches…</div>
          <div className={styles.loadingSub}>Claude is predicting every group stage fixture</div>
        </div>
      )}

      {status === 'error' && (
        <div className={styles.errorCard}>
          <div>❌ {error}</div>
          <button className={styles.retryBtn} onClick={runAI}>Try again</button>
        </div>
      )}

      {status === 'done' && reasoning && (
        <>
          <div className={styles.doneBar}>
            <span>✅ {Object.keys(predictions).length} matches predicted</span>
            <div className={styles.doneActions}>
              <button className={styles.applyBtn} onClick={() => onApply(predictions)}>Apply to my predictions</button>
              <button className={styles.rerunBtn} onClick={runAI}>Re-run</button>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Projected Group Winners</div>
            <div className={styles.winnersGrid}>
              {projectedStandings.map(({ group, winner, runner }) => (
                <div key={group} className={styles.winnerCard}>
                  <div className={styles.winnerGroup}>Group {group}</div>
                  <div className={styles.winnerTeam}>
                    <span>{winner ? TEAMS[winner.code]?.flag : '?'}</span>
                    <span className={styles.winnerName}>{winner?.team?.name || '?'}</span>
                    <span className={styles.winnerPts}>{winner?.Pts}pts</span>
                  </div>
                  <div className={styles.runnerTeam}>
                    <span>{runner ? TEAMS[runner.code]?.flag : '?'}</span>
                    <span className={styles.runnerName}>{runner?.team?.name || '?'}</span>
                    <span className={styles.runnerPts}>{runner?.Pts}pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>All Predicted Scores</div>
            {GROUP_LABELS.map(g => (
              <div key={g} className={styles.groupBlock}>
                <div className={styles.groupLabel}>Group {g}</div>
                {(reasoning[g] || []).map((m, i) => (
                  <div key={i} className={styles.scoreRow}>
                    <span className={styles.scoreTeam}>{m.flag_h} {m.home}</span>
                    <span className={styles.scoreResult}>
                      <span className={m.h > m.a ? styles.win : ''}>{m.h}</span>
                      <span className={styles.dash}>–</span>
                      <span className={m.a > m.h ? styles.win : ''}>{m.a}</span>
                    </span>
                    <span className={`${styles.scoreTeam} ${styles.scoreTeamR}`}>{m.away} {m.flag_a}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
