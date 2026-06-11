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
  if (!ht || !at) return { homeWin: 38, draw: 24, awayWin: 38, fav: 'even', favLabel: 'Even' }

  // Strength 1-10 scale, amplified with power to spread weak vs strong
  const homeStr = Math.pow(ht.strength + (ht.host ? 0.6 : 0) + formScore(homeCode) * 2, 2)
  const awayStr = Math.pow(at.strength + formScore(awayCode) * 2, 2)

  // Draw factor is smaller and shrinks when there's a big gap
  const gap = Math.abs(homeStr - awayStr)
  const drawFactor = Math.max(8, 22 - gap * 0.15) // ~22% for even, drops to ~8% for big mismatches

  const total = homeStr + awayStr + drawFactor
  const rawHome = (homeStr / total) * 100
  const rawAway = (awayStr / total) * 100
  const draw    = Math.round((drawFactor / total) * 100)

  // Split remaining between home and away
  const remaining = 100 - draw
  const homeWin = Math.round((rawHome / (rawHome + rawAway)) * remaining)
  const awayWin = remaining - homeWin

  let fav = 'even', favLabel = 'Even match'
  if (homeWin > awayWin + 10) { fav = 'home'; favLabel = `${ht.name} fav` }
  else if (awayWin > homeWin + 10) { fav = 'away'; favLabel = `${at.name} fav` }

  return { homeWin, draw, awayWin, fav, favLabel }
}

// Decimal odds from probability
export function toDecimalOdds(pct) {
  if (pct <= 0) return '—'
  return (100 / pct).toFixed(2)
}
