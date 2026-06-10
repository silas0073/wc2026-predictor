import React, { useState } from 'react'
import { FIXTURES, TEAMS, GROUPS } from '../data.js'
import { groupStandings } from '../utils.js'
import styles from './AIPredictions.module.css'

const GROUP_LABELS = ['A','B','C','D','E','F','G','H','I','J','K','L']

function buildPrompt() {
  const lines = [
    'You are a football analyst predicting every FIFA World Cup 2026 group stage match.',
    'For each match below, predict the score. Consider team strength, tournament history, host advantage, and group dynamics.',
    'Reply ONLY with valid JSON — an object where each key is the fixture id and value is {h, a} scores.',
    'Example: {"A1":{"h":2,"a":0},"A2":{"h":1,"a":1}}',
    'Keep scores realistic (0-4 goals per team max). Here are the fixtures:\n',
  ]

  GROUP_LABELS.forEach(g => {
    lines.push(`Group ${g}:`)
    FIXTURES.filter(f => f.group === g && f.homeScore === null).forEach(f => {
      const ht = TEAMS[f.home]
      const at = TEAMS[f.away]
      lines.push(`  ${f.id}: ${ht.name}${ht.host ? ' (host)' : ''} [str:${ht.strength}] vs ${at.name} [str:${at.strength}] — ${f.date}`)
    })
  })

  lines.push('\nRespond with ONLY the JSON object, no explanation, no markdown.')
  return lines.join('\n')
}

export default function AIPredictions({ onApply }) {
  const [status, setStatus]     = useState('idle') // idle | loading | done | error
  const [predictions, setPreds] = useState(null)
  const [error, setError]       = useState(null)
  const [reasoning, setReasoning] = useState(null)

  const runAI = async () => {
    setStatus('loading')
    setError(null)
    setPreds(null)
    setReasoning(null)

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          system: 'You are a football analyst. Always respond with only valid JSON, no markdown, no explanation.',
          messages: [{ role: 'user', content: buildPrompt() }],
        }),
      })

      const data = await res.json()
      const text = data.content?.[0]?.text || ''

      // Strip any accidental markdown fences
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)

      setPreds(parsed)
      setStatus('done')

      // Build reasoning summary
      const groups = {}
      Object.entries(parsed).forEach(([id, score]) => {
        const f = FIXTURES.find(x => x.id === id)
        if (!f) return
        if (!groups[f.group]) groups[f.group] = []
        const ht = TEAMS[f.home]
        const at = TEAMS[f.away]
        groups[f.group].push({ home: ht.name, away: at.name, h: score.h, a: score.a, flag_h: ht.flag, flag_a: at.flag })
      })
      setReasoning(groups)

    } catch (e) {
      setStatus('error')
      setError(e.message)
    }
  }

  const applyAll = () => {
    if (predictions) onApply(predictions)
  }

  // Compute projected winners from predictions
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
          <button className={styles.runBtn} onClick={runAI}>
            Generate AI Predictions
          </button>
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
          <div>❌ Something went wrong: {error}</div>
          <button className={styles.retryBtn} onClick={runAI}>Try again</button>
        </div>
      )}

      {status === 'done' && reasoning && (
        <>
          <div className={styles.doneBar}>
            <span>✅ {Object.keys(predictions).length} matches predicted</span>
            <div className={styles.doneActions}>
              <button className={styles.applyBtn} onClick={applyAll}>Apply to my predictions</button>
              <button className={styles.rerunBtn} onClick={runAI}>Re-run</button>
            </div>
          </div>

          {/* Projected group winners */}
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

          {/* All scores by group */}
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
