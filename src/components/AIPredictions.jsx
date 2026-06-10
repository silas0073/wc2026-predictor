import React, { useState } from 'react'
import { FIXTURES, TEAMS } from '../data.js'
import { groupStandings } from '../utils.js'
import { GROUP_LABELS } from '../data.js'
import styles from './AIPredictions.module.css'

const UPCOMING = FIXTURES.filter(f => f.homeScore === null)
const VALID_IDS = new Set(UPCOMING.map(f => f.id))

function buildGroupPrompt() {
  const ids = UPCOMING.map(f => f.id)
  const lines = [
    `Predict exactly ${ids.length} FIFA World Cup 2026 group stage matches.`,
    `Valid IDs: ${ids.join(', ')}`,
    'Reply ONLY with JSON: {"ID":{"h":goals,"a":goals}, ...} using ONLY those IDs. Scores 0-5 max.\n',
  ]
  GROUP_LABELS.forEach(g => {
    lines.push(`Group ${g}:`)
    UPCOMING.filter(f => f.group === g).forEach(f => {
      const ht = TEAMS[f.home], at = TEAMS[f.away]
      lines.push(`  "${f.id}": ${ht.name}${ht.host ? '(host)' : ''} vs ${at.name}`)
    })
  })
  lines.push('\nJSON only, no other text.')
  return lines.join('\n')
}

function buildKnockoutPrompt(standings) {
  const lines = [
    'You are predicting the FIFA World Cup 2026 knockout stage.',
    'Based on these group stage results, predict the winner of every knockout round match.',
    'Reply ONLY with a JSON object in this exact format — no other text:\n',
    '{"r32":[w1,w2,w3,w4,w5,w6,w7,w8,w9,w10,w11,w12,w13,w14,w15,w16],"r16":[w1,w2,w3,w4,w5,w6,w7,w8],"qf":[w1,w2,w3,w4],"sf":[w1,w2],"final":"winner_code","champion":"winner_code"}\n',
    'Use the 3-letter team codes shown below. Winners feed into the next round in order (1v2→match1, 3v4→match2, etc).\n',
    'Group standings (winner / runner-up / best 3rd):',
  ]

  const thirds = []
  GROUP_LABELS.forEach(g => {
    const rows = standings[g]
    const w = rows[0], r = rows[1], t = rows[2]
    lines.push(`  Group ${g}: 1st=${w?.code}(${w?.Pts}pts) 2nd=${r?.code}(${r?.Pts}pts) 3rd=${t?.code}(${t?.Pts}pts)`)
    if (t) thirds.push({ code: t.code, pts: t.Pts, gd: t.GD })
  })

  const best4thirds = thirds.sort((a,b) => b.pts-a.pts || b.gd-a.gd).slice(0,4).map(t=>t.code)
  lines.push(`\nBest 4 third-place teams: ${best4thirds.join(', ')}`)

  lines.push('\nRound of 32 matchups:')
  const w = {}, r = {}
  GROUP_LABELS.forEach(g => { w[g]=standings[g][0]?.code; r[g]=standings[g][1]?.code })
  const r32pairs = [
    [w['A'],r['B']], [w['C'],r['D']], [w['E'],r['F']], [w['G'],r['H']],
    [w['I'],r['J']], [w['K'],r['L']], [w['B'],r['A']], [w['D'],r['C']],
    [w['F'],r['E']], [w['H'],r['G']], [w['J'],r['I']], [w['L'],r['K']],
    [best4thirds[0], best4thirds[1]], [best4thirds[2], best4thirds[3]],
    [best4thirds[0] ? w['A'] : null, best4thirds[0]],
    [best4thirds[2] ? w['B'] : null, best4thirds[2]],
  ]
  r32pairs.forEach(([h,a], i) => {
    lines.push(`  M${i+1}: ${h||'TBD'} vs ${a||'TBD'}`)
  })

  lines.push('\nPredict winners for all rounds. JSON only.')
  return lines.join('\n')
}

async function callAI(prompt) {
  const res = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })
  const raw = await res.text()
  let data
  try { data = JSON.parse(raw) } catch { throw new Error('Server error: ' + raw.slice(0, 200)) }
  if (data.error) throw new Error(data.error + (data.detail ? ': ' + data.detail.slice(0,200) : ''))
  const text = data.content?.[0]?.text || ''
  if (!text) throw new Error('Empty response from AI')
  const clean = text.replace(/```json|```/g, '').trim()
  try { return JSON.parse(clean) } catch { throw new Error('Invalid JSON: ' + clean.slice(0,150)) }
}

export default function AIPredictions({ onApply }) {
  const [status, setStatus]       = useState('idle')
  const [step, setStep]           = useState('')
  const [groupPreds, setGroupPreds] = useState(null)
  const [knockout, setKnockout]   = useState(null)
  const [groupDisplay, setGroupDisplay] = useState(null)
  const [error, setError]         = useState(null)

  const runAI = async () => {
    setStatus('loading')
    setStep('Predicting group stage…')
    setError(null)
    setGroupPreds(null)
    setKnockout(null)
    setGroupDisplay(null)

    try {
      // Step 1: Group stage
      const parsed = await callAI(buildGroupPrompt())
      const valid = Object.fromEntries(Object.entries(parsed).filter(([id]) => VALID_IDS.has(id)))
      if (Object.keys(valid).length < 40) throw new Error(`Only ${Object.keys(valid).length} group predictions returned — try re-running`)

      setGroupPreds(valid)

      // Build standings from predictions
      const standings = {}
      GROUP_LABELS.forEach(g => { standings[g] = groupStandings(g, valid) })

      // Build group display
      const groups = {}
      Object.entries(valid).forEach(([id, score]) => {
        const f = FIXTURES.find(x => x.id === id)
        if (!f) return
        if (!groups[f.group]) groups[f.group] = []
        const ht = TEAMS[f.home], at = TEAMS[f.away]
        groups[f.group].push({ home: ht.name, away: at.name, h: score.h, a: score.a, fh: ht.flag, fa: at.flag })
      })
      setGroupDisplay(groups)

      // Step 2: Knockout bracket
      setStep('Predicting knockout bracket…')
      const ko = await callAI(buildKnockoutPrompt(standings))
      setKnockout(ko)
      setStatus('done')

    } catch (e) {
      setStatus('error')
      setError(e.message)
    }
  }

  const projectedStandings = groupPreds
    ? GROUP_LABELS.map(g => { const rows = groupStandings(g, groupPreds); return { group: g, winner: rows[0], runner: rows[1] } })
    : null

  const champion = knockout?.champion || (knockout?.final && TEAMS[knockout.final] ? knockout.final : null)

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <h2>🤖 AI Predictions</h2>
        <p>Full tournament — group stage scores + complete knockout bracket to the Final</p>
      </div>

      {status === 'idle' && (
        <div className={styles.startCard}>
          <div className={styles.startIcon}>🧠</div>
          <div className={styles.startTitle}>Get Claude's full tournament prediction</div>
          <div className={styles.startDesc}>
            Two AI calls: first predicts all 48 group stage scores, then uses those standings to predict the complete knockout bracket through to a World Cup champion.
          </div>
          <button className={styles.runBtn} onClick={runAI}>Generate Full Prediction</button>
        </div>
      )}

      {status === 'loading' && (
        <div className={styles.loadingCard}>
          <div className={styles.spinner} />
          <div className={styles.loadingText}>{step}</div>
          <div className={styles.loadingSub}>Claude is analysing the full tournament</div>
        </div>
      )}

      {status === 'error' && (
        <div className={styles.errorCard}>
          <div>❌ {error}</div>
          <button className={styles.retryBtn} onClick={runAI}>Try again</button>
        </div>
      )}

      {status === 'done' && (
        <>
          <div className={styles.doneBar}>
            <span>✅ Full tournament predicted</span>
            <div className={styles.doneActions}>
              <button className={styles.applyBtn} onClick={() => onApply(groupPreds)}>Apply group picks</button>
              <button className={styles.rerunBtn} onClick={runAI}>Re-run</button>
            </div>
          </div>

          {/* Champion */}
          {champion && TEAMS[champion] && (
            <div className={styles.championCard}>
              <div className={styles.champFlag}>{TEAMS[champion].flag}</div>
              <div className={styles.champName}>{TEAMS[champion].name}</div>
              <div className={styles.champLabel}>🏆 Claude's World Cup Champion</div>
            </div>
          )}

          {/* Knockout bracket */}
          {knockout && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Predicted Knockout Path</div>
              {[
                { key: 'r32', label: 'Round of 32' },
                { key: 'r16', label: 'Round of 16' },
                { key: 'qf',  label: 'Quarter-finals' },
                { key: 'sf',  label: 'Semi-finals' },
              ].map(({ key, label }) => {
                const teams = knockout[key]
                if (!teams?.length) return null
                return (
                  <div key={key} className={styles.koRound}>
                    <div className={styles.koLabel}>{label}</div>
                    <div className={styles.koTeams}>
                      {teams.map((code, i) => {
                        const t = TEAMS[code]
                        if (!t) return <span key={i} className={styles.koTeamUnknown}>{code}</span>
                        return (
                          <div key={i} className={styles.koTeam}>
                            <span>{t.flag}</span>
                            <span>{t.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              {knockout.final && TEAMS[knockout.final] && (
                <div className={styles.koRound}>
                  <div className={styles.koLabel}>Final Winner</div>
                  <div className={styles.koTeams}>
                    <div className={`${styles.koTeam} ${styles.koChamp}`}>
                      <span>{TEAMS[knockout.final].flag}</span>
                      <span>{TEAMS[knockout.final].name}</span>
                      <span>🏆</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Group winners summary */}
          {projectedStandings && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Group Stage Winners</div>
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
          )}

          {/* All group scores */}
          {groupDisplay && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>All Group Stage Scores</div>
              {GROUP_LABELS.map(g => (
                <div key={g} className={styles.groupBlock}>
                  <div className={styles.groupLabel}>Group {g}</div>
                  {(groupDisplay[g] || []).map((m, i) => (
                    <div key={i} className={styles.scoreRow}>
                      <span className={styles.scoreTeam}>{m.fh} {m.home}</span>
                      <span className={styles.scoreResult}>
                        <span className={m.h > m.a ? styles.win : ''}>{m.h}</span>
                        <span className={styles.dash}>–</span>
                        <span className={m.a > m.h ? styles.win : ''}>{m.a}</span>
                      </span>
                      <span className={`${styles.scoreTeam} ${styles.scoreTeamR}`}>{m.away} {m.fa}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
