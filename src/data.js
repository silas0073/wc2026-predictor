// All 48 teams with strength ratings (1-10) and flag emoji
export const TEAMS = {
  // Group A
  MEX: { name: 'Mexico',         flag: '🇲🇽', group: 'A', strength: 7.2, host: true  },
  KOR: { name: 'South Korea',    flag: '🇰🇷', group: 'A', strength: 6.8 },
  RSA: { name: 'South Africa',   flag: '🇿🇦', group: 'A', strength: 5.8 },
  CZE: { name: 'Czechia',        flag: '🇨🇿', group: 'A', strength: 6.4 },
  // Group B
  CAN: { name: 'Canada',         flag: '🇨🇦', group: 'B', strength: 7.0, host: true  },
  SUI: { name: 'Switzerland',    flag: '🇨🇭', group: 'B', strength: 7.2 },
  BIH: { name: 'Bosnia & Herz.', flag: '🇧🇦', group: 'B', strength: 6.0 },
  QAT: { name: 'Qatar',          flag: '🇶🇦', group: 'B', strength: 5.5 },
  // Group C
  BRA: { name: 'Brazil',         flag: '🇧🇷', group: 'C', strength: 8.4 },
  MAR: { name: 'Morocco',        flag: '🇲🇦', group: 'C', strength: 7.5 },
  SCO: { name: 'Scotland',       flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', group: 'C', strength: 6.3 },
  HAI: { name: 'Haiti',          flag: '🇭🇹', group: 'C', strength: 4.8 },
  // Group D
  USA: { name: 'USA',            flag: '🇺🇸', group: 'D', strength: 7.3, host: true  },
  AUS: { name: 'Australia',      flag: '🇦🇺', group: 'D', strength: 6.5 },
  PAR: { name: 'Paraguay',       flag: '🇵🇾', group: 'D', strength: 6.2 },
  TUR: { name: 'Türkiye',        flag: '🇹🇷', group: 'D', strength: 6.7 },
  // Group E
  GER: { name: 'Germany',        flag: '🇩🇪', group: 'E', strength: 8.2 },
  ECU: { name: 'Ecuador',        flag: '🇪🇨', group: 'E', strength: 6.4 },
  CIV: { name: "Côte d'Ivoire",  flag: '🇨🇮', group: 'E', strength: 6.8 },
  CUW: { name: 'Curaçao',        flag: '🇨🇼', group: 'E', strength: 4.5 },
  // Group F
  NED: { name: 'Netherlands',    flag: '🇳🇱', group: 'F', strength: 8.1 },
  JPN: { name: 'Japan',          flag: '🇯🇵', group: 'F', strength: 7.4 },
  SWE: { name: 'Sweden',         flag: '🇸🇪', group: 'F', strength: 6.9 },
  TUN: { name: 'Tunisia',        flag: '🇹🇳', group: 'F', strength: 5.8 },
  // Group G
  BEL: { name: 'Belgium',        flag: '🇧🇪', group: 'G', strength: 7.8 },
  EGY: { name: 'Egypt',          flag: '🇪🇬', group: 'G', strength: 6.5 },
  IRN: { name: 'Iran',           flag: '🇮🇷', group: 'G', strength: 6.1 },
  NZL: { name: 'New Zealand',    flag: '🇳🇿', group: 'G', strength: 5.2 },
  // Group H
  ESP: { name: 'Spain',          flag: '🇪🇸', group: 'H', strength: 8.8 },
  URU: { name: 'Uruguay',        flag: '🇺🇾', group: 'H', strength: 7.3 },
  SAU: { name: 'Saudi Arabia',   flag: '🇸🇦', group: 'H', strength: 6.0 },
  CPV: { name: 'Cape Verde',     flag: '🇨🇻', group: 'H', strength: 5.5 },
  // Group I
  FRA: { name: 'France',         flag: '🇫🇷', group: 'I', strength: 9.0 },
  SEN: { name: 'Senegal',        flag: '🇸🇳', group: 'I', strength: 7.0 },
  NOR: { name: 'Norway',         flag: '🇳🇴', group: 'I', strength: 7.6 },
  IRQ: { name: 'Iraq',           flag: '🇮🇶', group: 'I', strength: 5.0 },
  // Group J
  ARG: { name: 'Argentina',      flag: '🇦🇷', group: 'J', strength: 9.1 },
  AUT: { name: 'Austria',        flag: '🇦🇹', group: 'J', strength: 7.0 },
  ALG: { name: 'Algeria',        flag: '🇩🇿', group: 'J', strength: 6.3 },
  JOR: { name: 'Jordan',         flag: '🇯🇴', group: 'J', strength: 5.3 },
  // Group K
  POR: { name: 'Portugal',       flag: '🇵🇹', group: 'K', strength: 8.5 },
  COL: { name: 'Colombia',       flag: '🇨🇴', group: 'K', strength: 7.5 },
  UZB: { name: 'Uzbekistan',     flag: '🇺🇿', group: 'K', strength: 5.6 },
  COD: { name: 'DR Congo',       flag: '🇨🇩', group: 'K', strength: 5.8 },
  // Group L
  ENG: { name: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'L', strength: 8.3 },
  CRO: { name: 'Croatia',        flag: '🇭🇷', group: 'L', strength: 7.4 },
  PAN: { name: 'Panama',         flag: '🇵🇦', group: 'L', strength: 5.9 },
  GHA: { name: 'Ghana',          flag: '🇬🇭', group: 'L', strength: 6.2 },
}

export const GROUPS = {
  A: ['MEX','KOR','RSA','CZE'],
  B: ['CAN','SUI','BIH','QAT'],
  C: ['BRA','MAR','SCO','HAI'],
  D: ['USA','AUS','PAR','TUR'],
  E: ['GER','ECU','CIV','CUW'],
  F: ['NED','JPN','SWE','TUN'],
  G: ['BEL','EGY','IRN','NZL'],
  H: ['ESP','URU','SAU','CPV'],
  I: ['FRA','SEN','NOR','IRQ'],
  J: ['ARG','AUT','ALG','JOR'],
  K: ['POR','COL','UZB','COD'],
  L: ['ENG','CRO','PAN','GHA'],
}

// All 48 group stage fixtures (MD = matchday 1/2/3)
// homeScore/awayScore: null = upcoming, number = played
export const FIXTURES = [
  // ── GROUP A ──
  { id:'A1', group:'A', md:1, date:'2026-06-11', home:'MEX', away:'RSA', venue:'Estadio Azteca, Mexico City',    homeScore:null, awayScore:null },
  { id:'A2', group:'A', md:1, date:'2026-06-11', home:'KOR', away:'CZE', venue:'Estadio Akron, Guadalajara',     homeScore:null, awayScore:null },
  { id:'A3', group:'A', md:2, date:'2026-06-18', home:'CZE', away:'RSA', venue:'Mercedes-Benz Stadium, Atlanta', homeScore:null, awayScore:null },
  { id:'A4', group:'A', md:2, date:'2026-06-18', home:'MEX', away:'KOR', venue:'Estadio Akron, Guadalajara',     homeScore:null, awayScore:null },
  { id:'A5', group:'A', md:3, date:'2026-06-24', home:'CZE', away:'MEX', venue:'Estadio Azteca, Mexico City',    homeScore:null, awayScore:null },
  { id:'A6', group:'A', md:3, date:'2026-06-24', home:'RSA', away:'KOR', venue:'Estadio BBVA, Monterrey',        homeScore:null, awayScore:null },
  // ── GROUP B ──
  { id:'B1', group:'B', md:1, date:'2026-06-12', home:'CAN', away:'BIH', venue:'BMO Field, Toronto',            homeScore:null, awayScore:null },
  { id:'B2', group:'B', md:1, date:'2026-06-13', home:'QAT', away:'SUI', venue:"Levi's Stadium, Santa Clara",   homeScore:null, awayScore:null },
  { id:'B3', group:'B', md:2, date:'2026-06-18', home:'SUI', away:'BIH', venue:'SoFi Stadium, LA',              homeScore:null, awayScore:null },
  { id:'B4', group:'B', md:2, date:'2026-06-18', home:'CAN', away:'QAT', venue:'BC Place, Vancouver',           homeScore:null, awayScore:null },
  { id:'B5', group:'B', md:3, date:'2026-06-24', home:'SUI', away:'CAN', venue:'BC Place, Vancouver',           homeScore:null, awayScore:null },
  { id:'B6', group:'B', md:3, date:'2026-06-24', home:'BIH', away:'QAT', venue:'Lumen Field, Seattle',          homeScore:null, awayScore:null },
  // ── GROUP C ──
  { id:'C1', group:'C', md:1, date:'2026-06-13', home:'BRA', away:'MAR', venue:'MetLife Stadium, New York',     homeScore:null, awayScore:null },
  { id:'C2', group:'C', md:1, date:'2026-06-13', home:'HAI', away:'SCO', venue:'Gillette Stadium, Boston',      homeScore:null, awayScore:null },
  { id:'C3', group:'C', md:2, date:'2026-06-19', home:'SCO', away:'MAR', venue:'Gillette Stadium, Boston',      homeScore:null, awayScore:null },
  { id:'C4', group:'C', md:2, date:'2026-06-19', home:'BRA', away:'HAI', venue:'Hard Rock Stadium, Miami',      homeScore:null, awayScore:null },
  { id:'C5', group:'C', md:3, date:'2026-06-24', home:'SCO', away:'BRA', venue:'Gillette Stadium, Boston',      homeScore:null, awayScore:null },
  { id:'C6', group:'C', md:3, date:'2026-06-24', home:'MAR', away:'HAI', venue:'MetLife Stadium, New York',     homeScore:null, awayScore:null },
  // ── GROUP D ──
  { id:'D1', group:'D', md:1, date:'2026-06-12', home:'USA', away:'PAR', venue:'SoFi Stadium, LA',              homeScore:null, awayScore:null },
  { id:'D2', group:'D', md:1, date:'2026-06-13', home:'AUS', away:'TUR', venue:'BC Place, Vancouver',           homeScore:null, awayScore:null },
  { id:'D3', group:'D', md:2, date:'2026-06-19', home:'USA', away:'AUS', venue:'Lumen Field, Seattle',          homeScore:null, awayScore:null },
  { id:'D4', group:'D', md:2, date:'2026-06-19', home:'TUR', away:'PAR', venue:'SoFi Stadium, LA',              homeScore:null, awayScore:null },
  { id:'D5', group:'D', md:3, date:'2026-06-25', home:'TUR', away:'USA', venue:'AT&T Stadium, Dallas',          homeScore:null, awayScore:null },
  { id:'D6', group:'D', md:3, date:'2026-06-25', home:'PAR', away:'AUS', venue:'Arrowhead Stadium, Kansas City',homeScore:null, awayScore:null },
  // ── GROUP E ──
  { id:'E1', group:'E', md:1, date:'2026-06-14', home:'GER', away:'CUW', venue:'BMO Field, Toronto',            homeScore:null, awayScore:null },
  { id:'E2', group:'E', md:1, date:'2026-06-15', home:'CIV', away:'ECU', venue:'Arrowhead Stadium, Kansas City',homeScore:null, awayScore:null },
  { id:'E3', group:'E', md:2, date:'2026-06-20', home:'GER', away:'CIV', venue:'BMO Field, Toronto',            homeScore:null, awayScore:null },
  { id:'E4', group:'E', md:2, date:'2026-06-20', home:'ECU', away:'CUW', venue:'Arrowhead Stadium, Kansas City',homeScore:null, awayScore:null },
  { id:'E5', group:'E', md:3, date:'2026-06-25', home:'ECU', away:'GER', venue:'AT&T Stadium, Dallas',          homeScore:null, awayScore:null },
  { id:'E6', group:'E', md:3, date:'2026-06-25', home:'CUW', away:'CIV', venue:'Arrowhead Stadium, Kansas City',homeScore:null, awayScore:null },
  // ── GROUP F ──
  { id:'F1', group:'F', md:1, date:'2026-06-14', home:'NED', away:'JPN', venue:'Lincoln Financial Field, Philadelphia', homeScore:null, awayScore:null },
  { id:'F2', group:'F', md:1, date:'2026-06-14', home:'SWE', away:'TUN', venue:'Levi\'s Stadium, Santa Clara',  homeScore:null, awayScore:null },
  { id:'F3', group:'F', md:2, date:'2026-06-20', home:'NED', away:'SWE', venue:'Lincoln Financial Field, Philadelphia', homeScore:null, awayScore:null },
  { id:'F4', group:'F', md:2, date:'2026-06-20', home:'TUN', away:'JPN', venue:'Estadio Guadalupe, Guadalajara',homeScore:null, awayScore:null },
  { id:'F5', group:'F', md:3, date:'2026-06-25', home:'JPN', away:'SWE', venue:'AT&T Stadium, Dallas',          homeScore:null, awayScore:null },
  { id:'F6', group:'F', md:3, date:'2026-06-25', home:'TUN', away:'NED', venue:'Levi\'s Stadium, Santa Clara',  homeScore:null, awayScore:null },
  // ── GROUP G ──
  { id:'G1', group:'G', md:1, date:'2026-06-15', home:'BEL', away:'EGY', venue:'Lumen Field, Seattle',          homeScore:null, awayScore:null },
  { id:'G2', group:'G', md:1, date:'2026-06-15', home:'IRN', away:'NZL', venue:'Lincoln Financial Field, Philadelphia', homeScore:null, awayScore:null },
  { id:'G3', group:'G', md:2, date:'2026-06-21', home:'BEL', away:'IRN', venue:'Lumen Field, Seattle',          homeScore:null, awayScore:null },
  { id:'G4', group:'G', md:2, date:'2026-06-21', home:'NZL', away:'EGY', venue:'AT&T Stadium, Dallas',          homeScore:null, awayScore:null },
  { id:'G5', group:'G', md:3, date:'2026-06-26', home:'EGY', away:'IRN', venue:'Hard Rock Stadium, Miami',      homeScore:null, awayScore:null },
  { id:'G6', group:'G', md:3, date:'2026-06-26', home:'NZL', away:'BEL', venue:'Lincoln Financial Field, Philadelphia', homeScore:null, awayScore:null },
  // ── GROUP H ──
  { id:'H1', group:'H', md:1, date:'2026-06-15', home:'ESP', away:'CPV', venue:'Mercedes-Benz Stadium, Atlanta',homeScore:null, awayScore:null },
  { id:'H2', group:'H', md:1, date:'2026-06-15', home:'SAU', away:'URU', venue:'Hard Rock Stadium, Miami',      homeScore:null, awayScore:null },
  { id:'H3', group:'H', md:2, date:'2026-06-21', home:'ESP', away:'SAU', venue:'Mercedes-Benz Stadium, Atlanta',homeScore:null, awayScore:null },
  { id:'H4', group:'H', md:2, date:'2026-06-21', home:'URU', away:'CPV', venue:'Hard Rock Stadium, Miami',      homeScore:null, awayScore:null },
  { id:'H5', group:'H', md:3, date:'2026-06-26', home:'CPV', away:'SAU', venue:'Camping World Stadium, Orlando',homeScore:null, awayScore:null },
  { id:'H6', group:'H', md:3, date:'2026-06-26', home:'URU', away:'ESP', venue:'Hard Rock Stadium, Miami',      homeScore:null, awayScore:null },
  // ── GROUP I ──
  { id:'I1', group:'I', md:1, date:'2026-06-16', home:'FRA', away:'IRQ', venue:'Arrowhead Stadium, Kansas City',homeScore:null, awayScore:null },
  { id:'I2', group:'I', md:1, date:'2026-06-16', home:'NOR', away:'SEN', venue:'Camping World Stadium, Orlando',homeScore:null, awayScore:null },
  { id:'I3', group:'I', md:2, date:'2026-06-22', home:'FRA', away:'NOR', venue:'Camping World Stadium, Orlando',homeScore:null, awayScore:null },
  { id:'I4', group:'I', md:2, date:'2026-06-22', home:'SEN', away:'IRQ', venue:'Arrowhead Stadium, Kansas City',homeScore:null, awayScore:null },
  { id:'I5', group:'I', md:3, date:'2026-06-26', home:'IRQ', away:'NOR', venue:'Camping World Stadium, Orlando',homeScore:null, awayScore:null },
  { id:'I6', group:'I', md:3, date:'2026-06-26', home:'SEN', away:'FRA', venue:'Arrowhead Stadium, Kansas City',homeScore:null, awayScore:null },
  // ── GROUP J ──
  { id:'J1', group:'J', md:1, date:'2026-06-16', home:'ARG', away:'ALG', venue:'Arrowhead Stadium, Kansas City',homeScore:null, awayScore:null },
  { id:'J2', group:'J', md:1, date:'2026-06-16', home:'AUT', away:'JOR', venue:'Levi\'s Stadium, Santa Clara',  homeScore:null, awayScore:null },
  { id:'J3', group:'J', md:2, date:'2026-06-22', home:'ARG', away:'AUT', venue:'MetLife Stadium, New York',     homeScore:null, awayScore:null },
  { id:'J4', group:'J', md:2, date:'2026-06-22', home:'ALG', away:'JOR', venue:'Levi\'s Stadium, Santa Clara',  homeScore:null, awayScore:null },
  { id:'J5', group:'J', md:3, date:'2026-06-27', home:'JOR', away:'ARG', venue:'AT&T Stadium, Dallas',          homeScore:null, awayScore:null },
  { id:'J6', group:'J', md:3, date:'2026-06-27', home:'ALG', away:'AUT', venue:'Levi\'s Stadium, Santa Clara',  homeScore:null, awayScore:null },
  // ── GROUP K ──
  { id:'K1', group:'K', md:1, date:'2026-06-17', home:'POR', away:'COD', venue:'NRG Stadium, Houston',          homeScore:null, awayScore:null },
  { id:'K2', group:'K', md:1, date:'2026-06-17', home:'UZB', away:'COL', venue:'Estadio Azteca, Mexico City',   homeScore:null, awayScore:null },
  { id:'K3', group:'K', md:2, date:'2026-06-23', home:'POR', away:'UZB', venue:'NRG Stadium, Houston',          homeScore:null, awayScore:null },
  { id:'K4', group:'K', md:2, date:'2026-06-23', home:'COL', away:'COD', venue:'Camping World Stadium, Orlando',homeScore:null, awayScore:null },
  { id:'K5', group:'K', md:3, date:'2026-06-27', home:'COD', away:'UZB', venue:'NRG Stadium, Houston',          homeScore:null, awayScore:null },
  { id:'K6', group:'K', md:3, date:'2026-06-27', home:'COL', away:'POR', venue:'Camping World Stadium, Orlando',homeScore:null, awayScore:null },
  // ── GROUP L ──
  { id:'L1', group:'L', md:1, date:'2026-06-17', home:'ENG', away:'CRO', venue:'AT&T Stadium, Dallas',          homeScore:null, awayScore:null },
  { id:'L2', group:'L', md:1, date:'2026-06-17', home:'GHA', away:'PAN', venue:'BMO Field, Toronto',            homeScore:null, awayScore:null },
  { id:'L3', group:'L', md:2, date:'2026-06-23', home:'ENG', away:'GHA', venue:'Gillette Stadium, Boston',      homeScore:null, awayScore:null },
  { id:'L4', group:'L', md:2, date:'2026-06-23', home:'PAN', away:'CRO', venue:'AT&T Stadium, Dallas',          homeScore:null, awayScore:null },
  { id:'L5', group:'L', md:3, date:'2026-06-27', home:'PAN', away:'ENG', venue:'MetLife Stadium, New York',     homeScore:null, awayScore:null },
  { id:'L6', group:'L', md:3, date:'2026-06-27', home:'CRO', away:'GHA', venue:'Lincoln Financial Field, Philadelphia', homeScore:null, awayScore:null },
]

export const GROUP_LABELS = ['A','B','C','D','E','F','G','H','I','J','K','L']
