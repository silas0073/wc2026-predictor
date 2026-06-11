import { TEAMS } from './data.js'

// Recent form (last 5 competitive/friendly matches before WC)
// W=3, D=1, L=0 — higher = better form
export const FORM = {
  MEX: ['W','W','D','W','L'], // Won Gold Cup, lost to Serbia friendly
  KOR: ['W','D','W','L','W'],
  RSA: ['W','L','W','W','D'],
  CZE: ['D','W','L','W','W'],
  CAN: ['W','W','D','W','D'], // 7-game unbeaten run
  SUI: ['W','D','W','W','D'],
  BIH: ['L','W','D','W','L'],
  QAT: ['L','D','L','W','L'],
  BRA: ['W','W','D','W','W'],
  MAR: ['W','W','W','D','W'],
  SCO: ['D','W','W','D','L'],
  HAI: ['L','L','D','L','W'],
  USA: ['W','W','D','W','W'],
  AUS: ['W','D','W','W','D'],
  PAR: ['D','L','W','D','W'],
  TUR: ['W','W','D','W','L'],
  GER: ['W','W','W','D','W'],
  ECU: ['D','W','W','D','W'],
  CIV: ['W','W','D','W','W'],
  CUW: ['L','D','L','L','W'],
  NED: ['W','W','W','D','W'],
  JPN: ['W','W','W','W','D'],
  SWE: ['W','D','W','W','L'],
  TUN: ['D','W','L','D','W'],
  BEL: ['W','W','D','W','W'],
  EGY: ['W','W','D','W','D'],
  IRN: ['W','D','W','L','W'],
  NZL: ['D','L','D','W','L'],
  ESP: ['W','W','W','W','W'], // Nations League winners
  URU: ['W','W','D','W','L'],
  SAU: ['D','W','L','W','D'],
  CPV: ['W','D','W','L','W'],
  FRA: ['W','W','W','D','W'],
  SEN: ['W','D','W','W','D'],
  NOR: ['W','W','W','W','D'], // Haaland on fire
  IRQ: ['D','W','L','L','D'],
  ARG: ['W','W','W','W','D'], // World champions
  AUT: ['W','W','D','W','W'],
  ALG: ['W','D','W','L','W'],
  JOR: ['D','W','L','D','L'],
  POR: ['W','W','W','D','W'],
  COL: ['W','W','D','W','W'],
  UZB: ['W','D','L','W','D'],
  COD: ['W','D','W','L','W'],
  ENG: ['W','W','W','D','W'],
  CRO: ['W','D','W','D','W'],
  PAN: ['D','W','L','W','D'],
  GHA: ['W','D','W','W','L'],
}

export function formScore(code) {
  const f = FORM[code] || ['D','D','D','D','D']
  const pts = f.reduce((s,r) => s + (r==='W'?3:r==='D'?1:0), 0)
  return pts / 15 // normalise 0-1
}

export function formLabel(code) {
  return (FORM[code] || []).map(r =>
    r === 'W' ? '🟢' : r === 'D' ? '🟡' : '🔴'
  ).join('')
}

// Calculate win probabilities based on strength + form + home advantage
export function matchOdds(homeCode, awayCode) {
  const ht = TEAMS[homeCode], at = TEAMS[awayCode]
  if (!ht || !at) return { homeWin: 33, draw: 33, awayWin: 34, fav: null, favLabel: 'Even' }

  const homeStr = ht.strength + (ht.host ? 0.5 : 0) + formScore(homeCode) * 1.5
  const awayStr = at.strength + formScore(awayCode) * 1.5

  const total = homeStr + awayStr + 4 // draw factor
  const rawHome = (homeStr / total) * 100
  const rawAway = (awayStr / total) * 100
  const rawDraw = 100 - rawHome - rawAway

  const homeWin = Math.round(rawHome)
  const awayWin = Math.round(rawAway)
  const draw    = Math.round(rawDraw)

  let fav = null, favLabel = 'Even'
  const maxGap = Math.max(homeWin, awayWin) - Math.min(homeWin, awayWin)
  if (homeWin > awayWin + 8) { fav = 'home'; favLabel = `${ht.name} fav` }
  else if (awayWin > homeWin + 8) { fav = 'away'; favLabel = `${at.name} fav` }
  else { fav = 'even'; favLabel = 'Even match' }

  return { homeWin, draw, awayWin, fav, favLabel }
}

// Decimal odds from probability
export function toDecimalOdds(pct) {
  if (pct <= 0) return '—'
  return (100 / pct).toFixed(2)
}
