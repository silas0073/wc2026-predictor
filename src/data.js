export const TEAMS = {
  MEX: { name: 'Mexico',         flag: '🇲🇽', group: 'A', strength: 7.2, host: true  },
  KOR: { name: 'South Korea',    flag: '🇰🇷', group: 'A', strength: 6.8 },
  RSA: { name: 'South Africa',   flag: '🇿🇦', group: 'A', strength: 5.8 },
  CZE: { name: 'Czechia',        flag: '🇨🇿', group: 'A', strength: 6.4 },
  CAN: { name: 'Canada',         flag: '🇨🇦', group: 'B', strength: 7.0, host: true  },
  SUI: { name: 'Switzerland',    flag: '🇨🇭', group: 'B', strength: 7.2 },
  BIH: { name: 'Bosnia & Herz.', flag: '🇧🇦', group: 'B', strength: 6.0 },
  QAT: { name: 'Qatar',          flag: '🇶🇦', group: 'B', strength: 5.5 },
  BRA: { name: 'Brazil',         flag: '🇧🇷', group: 'C', strength: 8.4 },
  MAR: { name: 'Morocco',        flag: '🇲🇦', group: 'C', strength: 7.5 },
  SCO: { name: 'Scotland',       flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', group: 'C', strength: 6.3 },
  HAI: { name: 'Haiti',          flag: '🇭🇹', group: 'C', strength: 4.8 },
  USA: { name: 'USA',            flag: '🇺🇸', group: 'D', strength: 7.3, host: true  },
  AUS: { name: 'Australia',      flag: '🇦🇺', group: 'D', strength: 6.5 },
  PAR: { name: 'Paraguay',       flag: '🇵🇾', group: 'D', strength: 6.2 },
  TUR: { name: 'Türkiye',        flag: '🇹🇷', group: 'D', strength: 6.7 },
  GER: { name: 'Germany',        flag: '🇩🇪', group: 'E', strength: 8.2 },
  ECU: { name: 'Ecuador',        flag: '🇪🇨', group: 'E', strength: 6.4 },
  CIV: { name: "Côte d'Ivoire",  flag: '🇨🇮', group: 'E', strength: 6.8 },
  CUW: { name: 'Curaçao',        flag: '🇨🇼', group: 'E', strength: 4.5 },
  NED: { name: 'Netherlands',    flag: '🇳🇱', group: 'F', strength: 8.1 },
  JPN: { name: 'Japan',          flag: '🇯🇵', group: 'F', strength: 7.4 },
  SWE: { name: 'Sweden',         flag: '🇸🇪', group: 'F', strength: 6.9 },
  TUN: { name: 'Tunisia',        flag: '🇹🇳', group: 'F', strength: 5.8 },
  BEL: { name: 'Belgium',        flag: '🇧🇪', group: 'G', strength: 7.8 },
  EGY: { name: 'Egypt',          flag: '🇪🇬', group: 'G', strength: 6.5 },
  IRN: { name: 'Iran',           flag: '🇮🇷', group: 'G', strength: 6.1 },
  NZL: { name: 'New Zealand',    flag: '🇳🇿', group: 'G', strength: 5.2 },
  ESP: { name: 'Spain',          flag: '🇪🇸', group: 'H', strength: 8.8 },
  URU: { name: 'Uruguay',        flag: '🇺🇾', group: 'H', strength: 7.3 },
  SAU: { name: 'Saudi Arabia',   flag: '🇸🇦', group: 'H', strength: 6.0 },
  CPV: { name: 'Cape Verde',     flag: '🇨🇻', group: 'H', strength: 5.5 },
  FRA: { name: 'France',         flag: '🇫🇷', group: 'I', strength: 9.0 },
  SEN: { name: 'Senegal',        flag: '🇸🇳', group: 'I', strength: 7.0 },
  NOR: { name: 'Norway',         flag: '🇳🇴', group: 'I', strength: 7.6 },
  IRQ: { name: 'Iraq',           flag: '🇮🇶', group: 'I', strength: 5.0 },
  ARG: { name: 'Argentina',      flag: '🇦🇷', group: 'J', strength: 9.1 },
  AUT: { name: 'Austria',        flag: '🇦🇹', group: 'J', strength: 7.0 },
  ALG: { name: 'Algeria',        flag: '🇩🇿', group: 'J', strength: 6.3 },
  JOR: { name: 'Jordan',         flag: '🇯🇴', group: 'J', strength: 5.3 },
  POR: { name: 'Portugal',       flag: '🇵🇹', group: 'K', strength: 8.5 },
  COL: { name: 'Colombia',       flag: '🇨🇴', group: 'K', strength: 7.5 },
  UZB: { name: 'Uzbekistan',     flag: '🇺🇿', group: 'K', strength: 5.6 },
  COD: { name: 'DR Congo',       flag: '🇨🇩', group: 'K', strength: 5.8 },
  ENG: { name: 'England',        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'L', strength: 8.3 },
  CRO: { name: 'Croatia',        flag: '🇭🇷', group: 'L', strength: 7.4 },
  PAN: { name: 'Panama',         flag: '🇵🇦', group: 'L', strength: 5.9 },
  GHA: { name: 'Ghana',          flag: '🇬🇭', group: 'L', strength: 6.2 },
}

export const GROUPS = {
  A: ['MEX','KOR','RSA','CZE'], B: ['CAN','SUI','BIH','QAT'],
  C: ['BRA','MAR','SCO','HAI'], D: ['USA','AUS','PAR','TUR'],
  E: ['GER','ECU','CIV','CUW'], F: ['NED','JPN','SWE','TUN'],
  G: ['BEL','EGY','IRN','NZL'], H: ['ESP','URU','SAU','CPV'],
  I: ['FRA','SEN','NOR','IRQ'], J: ['ARG','AUT','ALG','JOR'],
  K: ['POR','COL','UZB','COD'], L: ['ENG','CRO','PAN','GHA'],
}

// kickoff = UTC ISO datetime string
export const FIXTURES = [
  // GROUP A
  { id:'A1', group:'A', md:1, date:'2026-06-11', kickoff:'2026-06-11T19:00Z', home:'MEX', away:'RSA', venue:'Estadio Azteca, Mexico City',       homeScore:2, awayScore:0 },
  { id:'A2', group:'A', md:1, date:'2026-06-12', kickoff:'2026-06-12T02:00Z', home:'KOR', away:'CZE', venue:'Estadio Akron, Guadalajara',          homeScore:2, awayScore:1 },
  { id:'A3', group:'A', md:2, date:'2026-06-18', kickoff:'2026-06-18T16:00Z', home:'CZE', away:'RSA', venue:'Mercedes-Benz Stadium, Atlanta',      homeScore:null, awayScore:null },
  { id:'A4', group:'A', md:2, date:'2026-06-19', kickoff:'2026-06-19T01:00Z', home:'MEX', away:'KOR', venue:'Estadio Akron, Guadalajara',           homeScore:null, awayScore:null },
  { id:'A5', group:'A', md:3, date:'2026-06-25', kickoff:'2026-06-25T01:00Z', home:'CZE', away:'MEX', venue:'Estadio Azteca, Mexico City',          homeScore:null, awayScore:null },
  { id:'A6', group:'A', md:3, date:'2026-06-25', kickoff:'2026-06-25T01:00Z', home:'RSA', away:'KOR', venue:'Estadio BBVA, Monterrey',              homeScore:null, awayScore:null },
  // GROUP B
  { id:'B1', group:'B', md:1, date:'2026-06-12', kickoff:'2026-06-12T19:00Z', home:'CAN', away:'BIH', venue:'BMO Field, Toronto',                  homeScore:null, awayScore:null },
  { id:'B2', group:'B', md:1, date:'2026-06-13', kickoff:'2026-06-13T19:00Z', home:'QAT', away:'SUI', venue:"Levi's Stadium, Santa Clara",          homeScore:null, awayScore:null },
  { id:'B3', group:'B', md:2, date:'2026-06-18', kickoff:'2026-06-18T19:00Z', home:'SUI', away:'BIH', venue:'SoFi Stadium, LA',                    homeScore:null, awayScore:null },
  { id:'B4', group:'B', md:2, date:'2026-06-18', kickoff:'2026-06-18T22:00Z', home:'CAN', away:'QAT', venue:'BC Place, Vancouver',                  homeScore:null, awayScore:null },
  { id:'B5', group:'B', md:3, date:'2026-06-24', kickoff:'2026-06-24T19:00Z', home:'SUI', away:'CAN', venue:'BC Place, Vancouver',                  homeScore:null, awayScore:null },
  { id:'B6', group:'B', md:3, date:'2026-06-24', kickoff:'2026-06-24T19:00Z', home:'BIH', away:'QAT', venue:'Lumen Field, Seattle',                 homeScore:null, awayScore:null },
  // GROUP C
  { id:'C1', group:'C', md:1, date:'2026-06-13', kickoff:'2026-06-13T22:00Z', home:'BRA', away:'MAR', venue:'MetLife Stadium, New York',            homeScore:null, awayScore:null },
  { id:'C2', group:'C', md:1, date:'2026-06-14', kickoff:'2026-06-14T01:00Z', home:'HAI', away:'SCO', venue:'Gillette Stadium, Boston',             homeScore:null, awayScore:null },
  { id:'C3', group:'C', md:2, date:'2026-06-19', kickoff:'2026-06-19T22:00Z', home:'SCO', away:'MAR', venue:'Gillette Stadium, Boston',             homeScore:null, awayScore:null },
  { id:'C4', group:'C', md:2, date:'2026-06-20', kickoff:'2026-06-20T01:00Z', home:'BRA', away:'HAI', venue:'Lincoln Financial Field, Philadelphia',homeScore:null, awayScore:null },
  { id:'C5', group:'C', md:3, date:'2026-06-24', kickoff:'2026-06-24T22:00Z', home:'SCO', away:'BRA', venue:'Hard Rock Stadium, Miami',             homeScore:null, awayScore:null },
  { id:'C6', group:'C', md:3, date:'2026-06-24', kickoff:'2026-06-24T22:00Z', home:'MAR', away:'HAI', venue:'MetLife Stadium, New York',            homeScore:null, awayScore:null },
  // GROUP D
  { id:'D1', group:'D', md:1, date:'2026-06-12', kickoff:'2026-06-13T01:00Z', home:'USA', away:'PAR', venue:'SoFi Stadium, LA',                    homeScore:null, awayScore:null },
  { id:'D2', group:'D', md:1, date:'2026-06-14', kickoff:'2026-06-14T04:00Z', home:'AUS', away:'TUR', venue:'BC Place, Vancouver',                  homeScore:null, awayScore:null },
  { id:'D3', group:'D', md:2, date:'2026-06-19', kickoff:'2026-06-19T19:00Z', home:'USA', away:'AUS', venue:'Lumen Field, Seattle',                 homeScore:null, awayScore:null },
  { id:'D4', group:'D', md:2, date:'2026-06-20', kickoff:'2026-06-20T04:00Z', home:'TUR', away:'PAR', venue:"Levi's Stadium, Santa Clara",          homeScore:null, awayScore:null },
  { id:'D5', group:'D', md:3, date:'2026-06-26', kickoff:'2026-06-26T02:00Z', home:'TUR', away:'USA', venue:'AT&T Stadium, Dallas',                 homeScore:null, awayScore:null },
  { id:'D6', group:'D', md:3, date:'2026-06-26', kickoff:'2026-06-26T02:00Z', home:'PAR', away:'AUS', venue:'Arrowhead Stadium, Kansas City',       homeScore:null, awayScore:null },
  // GROUP E
  { id:'E1', group:'E', md:1, date:'2026-06-14', kickoff:'2026-06-14T17:00Z', home:'GER', away:'CUW', venue:'NRG Stadium, Houston',                 homeScore:7, awayScore:1 },
  { id:'E2', group:'E', md:1, date:'2026-06-14', kickoff:'2026-06-14T23:00Z', home:'CIV', away:'ECU', venue:'Lincoln Financial Field, Philadelphia',homeScore:null, awayScore:null },
  { id:'E3', group:'E', md:2, date:'2026-06-20', kickoff:'2026-06-20T20:00Z', home:'GER', away:'CIV', venue:'BMO Field, Toronto',                   homeScore:null, awayScore:null },
  { id:'E4', group:'E', md:2, date:'2026-06-21', kickoff:'2026-06-21T00:00Z', home:'ECU', away:'CUW', venue:'Arrowhead Stadium, Kansas City',       homeScore:null, awayScore:null },
  { id:'E5', group:'E', md:3, date:'2026-06-25', kickoff:'2026-06-25T23:00Z', home:'ECU', away:'GER', venue:'AT&T Stadium, Dallas',                 homeScore:null, awayScore:null },
  { id:'E6', group:'E', md:3, date:'2026-06-25', kickoff:'2026-06-25T23:00Z', home:'CUW', away:'CIV', venue:'Arrowhead Stadium, Kansas City',       homeScore:null, awayScore:null },
  // GROUP F
  { id:'F1', group:'F', md:1, date:'2026-06-14', kickoff:'2026-06-14T23:00Z', home:'NED', away:'JPN', venue:'AT&T Stadium, Dallas',                 homeScore:null, awayScore:null },
  { id:'F2', group:'F', md:1, date:'2026-06-15', kickoff:'2026-06-15T02:00Z', home:'SWE', away:'TUN', venue:"Levi's Stadium, Santa Clara",          homeScore:null, awayScore:null },
  { id:'F3', group:'F', md:2, date:'2026-06-20', kickoff:'2026-06-20T17:00Z', home:'NED', away:'SWE', venue:'NRG Stadium, Houston',                 homeScore:null, awayScore:null },
  { id:'F4', group:'F', md:2, date:'2026-06-21', kickoff:'2026-06-21T02:00Z', home:'TUN', away:'JPN', venue:'Estadio BBVA, Monterrey',              homeScore:null, awayScore:null },
  { id:'F5', group:'F', md:3, date:'2026-06-25', kickoff:'2026-06-25T23:00Z', home:'JPN', away:'SWE', venue:'AT&T Stadium, Dallas',                 homeScore:null, awayScore:null },
  { id:'F6', group:'F', md:3, date:'2026-06-25', kickoff:'2026-06-25T23:00Z', home:'TUN', away:'NED', venue:"Levi's Stadium, Santa Clara",          homeScore:null, awayScore:null },
  // GROUP G
  { id:'G1', group:'G', md:1, date:'2026-06-15', kickoff:'2026-06-15T19:00Z', home:'BEL', away:'EGY', venue:'Lumen Field, Seattle',                 homeScore:null, awayScore:null },
  { id:'G2', group:'G', md:1, date:'2026-06-16', kickoff:'2026-06-16T01:00Z', home:'IRN', away:'NZL', venue:'Lincoln Financial Field, Philadelphia',homeScore:null, awayScore:null },
  { id:'G3', group:'G', md:2, date:'2026-06-21', kickoff:'2026-06-21T19:00Z', home:'BEL', away:'IRN', venue:'Lumen Field, Seattle',                 homeScore:null, awayScore:null },
  { id:'G4', group:'G', md:2, date:'2026-06-21', kickoff:'2026-06-21T23:00Z', home:'NZL', away:'EGY', venue:'AT&T Stadium, Dallas',                 homeScore:null, awayScore:null },
  { id:'G5', group:'G', md:3, date:'2026-06-26', kickoff:'2026-06-26T23:00Z', home:'EGY', away:'IRN', venue:'Hard Rock Stadium, Miami',             homeScore:null, awayScore:null },
  { id:'G6', group:'G', md:3, date:'2026-06-26', kickoff:'2026-06-26T23:00Z', home:'NZL', away:'BEL', venue:'Lincoln Financial Field, Philadelphia',homeScore:null, awayScore:null },
  // GROUP H
  { id:'H1', group:'H', md:1, date:'2026-06-15', kickoff:'2026-06-15T16:00Z', home:'ESP', away:'CPV', venue:'Mercedes-Benz Stadium, Atlanta',       homeScore:null, awayScore:null },
  { id:'H2', group:'H', md:1, date:'2026-06-15', kickoff:'2026-06-15T22:00Z', home:'SAU', away:'URU', venue:'Hard Rock Stadium, Miami',             homeScore:null, awayScore:null },
  { id:'H3', group:'H', md:2, date:'2026-06-21', kickoff:'2026-06-21T16:00Z', home:'ESP', away:'SAU', venue:'Mercedes-Benz Stadium, Atlanta',       homeScore:null, awayScore:null },
  { id:'H4', group:'H', md:2, date:'2026-06-21', kickoff:'2026-06-21T22:00Z', home:'URU', away:'CPV', venue:'Hard Rock Stadium, Miami',             homeScore:null, awayScore:null },
  { id:'H5', group:'H', md:3, date:'2026-06-26', kickoff:'2026-06-27T01:00Z', home:'CPV', away:'SAU', venue:'Camping World Stadium, Orlando',       homeScore:null, awayScore:null },
  { id:'H6', group:'H', md:3, date:'2026-06-26', kickoff:'2026-06-27T01:00Z', home:'URU', away:'ESP', venue:'Hard Rock Stadium, Miami',             homeScore:null, awayScore:null },
  // GROUP I
  { id:'I1', group:'I', md:1, date:'2026-06-16', kickoff:'2026-06-16T19:00Z', home:'FRA', away:'SEN', venue:'MetLife Stadium, New York',            homeScore:3, awayScore:1 },
  { id:'I2', group:'I', md:1, date:'2026-06-16', kickoff:'2026-06-16T22:00Z', home:'IRQ', away:'NOR', venue:'Gillette Stadium, Boston',              homeScore:null, awayScore:null },
  { id:'I3', group:'I', md:2, date:'2026-06-22', kickoff:'2026-06-22T19:00Z', home:'FRA', away:'IRQ', venue:'Lincoln Financial Field, Philadelphia',homeScore:null, awayScore:null },
  { id:'I4', group:'I', md:2, date:'2026-06-22', kickoff:'2026-06-22T22:00Z', home:'NOR', away:'SEN', venue:'MetLife Stadium, New York',            homeScore:null, awayScore:null },
  { id:'I5', group:'I', md:3, date:'2026-06-26', kickoff:'2026-06-26T19:00Z', home:'NOR', away:'FRA', venue:'Gillette Stadium, Boston',             homeScore:null, awayScore:null },
  { id:'I6', group:'I', md:3, date:'2026-06-26', kickoff:'2026-06-26T19:00Z', home:'SEN', away:'IRQ', venue:'BMO Field, Toronto',                   homeScore:null, awayScore:null },
  // GROUP J
  { id:'J1', group:'J', md:1, date:'2026-06-16', kickoff:'2026-06-17T01:00Z', home:'ARG', away:'ALG', venue:'Arrowhead Stadium, Kansas City',       homeScore:null, awayScore:null },
  { id:'J2', group:'J', md:1, date:'2026-06-17', kickoff:'2026-06-17T04:00Z', home:'AUT', away:'JOR', venue:"Levi's Stadium, Santa Clara",          homeScore:3, awayScore:1,
    goals: [
      { team:'AUT', name:'Romano Schmid', minute:"21'" },
      { team:'JOR', name:'Ali Olwan', minute:"50'" },
      { team:'AUT', name:'Yazan Al-Arab', minute:"76'", ownGoal:true },
      { team:'AUT', name:'Marko Arnautović', minute:"90+12'", penalty:true },
    ]
  },
  { id:'J3', group:'J', md:2, date:'2026-06-22', kickoff:'2026-06-23T01:00Z', home:'ARG', away:'AUT', venue:'MetLife Stadium, New York',            homeScore:null, awayScore:null },
  { id:'J4', group:'J', md:2, date:'2026-06-23', kickoff:'2026-06-23T04:00Z', home:'ALG', away:'JOR', venue:"Levi's Stadium, Santa Clara",          homeScore:null, awayScore:null },
  { id:'J5', group:'J', md:3, date:'2026-06-27', kickoff:'2026-06-27T23:00Z', home:'JOR', away:'ARG', venue:'AT&T Stadium, Dallas',                 homeScore:null, awayScore:null },
  { id:'J6', group:'J', md:3, date:'2026-06-27', kickoff:'2026-06-27T23:00Z', home:'ALG', away:'AUT', venue:"Levi's Stadium, Santa Clara",          homeScore:null, awayScore:null },
  // GROUP K
  { id:'K1', group:'K', md:1, date:'2026-06-17', kickoff:'2026-06-17T17:00Z', home:'POR', away:'COD', venue:'NRG Stadium, Houston',                 homeScore:null, awayScore:null },
  { id:'K2', group:'K', md:1, date:'2026-06-17', kickoff:'2026-06-18T02:00Z', home:'UZB', away:'COL', venue:'Estadio Azteca, Mexico City',          homeScore:null, awayScore:null },
  { id:'K3', group:'K', md:2, date:'2026-06-23', kickoff:'2026-06-23T17:00Z', home:'POR', away:'UZB', venue:'NRG Stadium, Houston',                 homeScore:null, awayScore:null },
  { id:'K4', group:'K', md:2, date:'2026-06-23', kickoff:'2026-06-23T20:00Z', home:'COL', away:'COD', venue:'Estadio Akron, Guadalajara',           homeScore:null, awayScore:null },
  { id:'K5', group:'K', md:3, date:'2026-06-27', kickoff:'2026-06-27T23:00Z', home:'COD', away:'UZB', venue:'Mercedes-Benz Stadium, Atlanta',       homeScore:null, awayScore:null },
  { id:'K6', group:'K', md:3, date:'2026-06-27', kickoff:'2026-06-27T23:00Z', home:'COL', away:'POR', venue:'Hard Rock Stadium, Miami',             homeScore:null, awayScore:null },
  // GROUP L
  { id:'L1', group:'L', md:1, date:'2026-06-17', kickoff:'2026-06-17T20:00Z', home:'ENG', away:'CRO', venue:'AT&T Stadium, Dallas',                 homeScore:null, awayScore:null },
  { id:'L2', group:'L', md:1, date:'2026-06-17', kickoff:'2026-06-17T23:00Z', home:'GHA', away:'PAN', venue:'BMO Field, Toronto',                   homeScore:null, awayScore:null },
  { id:'L3', group:'L', md:2, date:'2026-06-23', kickoff:'2026-06-23T22:00Z', home:'ENG', away:'GHA', venue:'Gillette Stadium, Boston',             homeScore:null, awayScore:null },
  { id:'L4', group:'L', md:2, date:'2026-06-23', kickoff:'2026-06-24T01:00Z', home:'PAN', away:'CRO', venue:'BMO Field, Toronto',                    homeScore:null, awayScore:null },
  { id:'L5', group:'L', md:3, date:'2026-06-27', kickoff:'2026-06-27T23:00Z', home:'PAN', away:'ENG', venue:'MetLife Stadium, New York',            homeScore:null, awayScore:null },
  { id:'L6', group:'L', md:3, date:'2026-06-27', kickoff:'2026-06-27T23:00Z', home:'CRO', away:'GHA', venue:'Lincoln Financial Field, Philadelphia',homeScore:null, awayScore:null },
]

export const GROUP_LABELS = ['A','B','C','D','E','F','G','H','I','J','K','L']

// ---- KNOCKOUT STAGE (Round of 32 -> Final) ----
// Real-results knockout bracket (separate from the prediction Bracket tab).
// Slot notation for `home`/`away` before teams are determined:
//   { g:'A', p:1 }      = Group A winner (p:2 = runner-up)
//   { t3:['A','B',...]} = best 3rd-place team from the listed groups
//   { w:73 }            = winner of match #73
//   { l:101 }           = loser of match #101 (used only for 3rd place playoff)
// Once resolved, `home`/`away` become plain team codes (filled in as data.js
// is patched post-match, same workflow as group stage).
export const KNOCKOUT_FIXTURES = [
  // ROUND OF 32 (16 matches)
  { id:'M73', round:'R32', date:'2026-06-28', kickoff:'2026-06-28T19:00Z', venue:'SoFi Stadium, Los Angeles',            home:{g:'A',p:2}, away:{g:'B',p:2}, homeScore:null, awayScore:null },
  { id:'M76', round:'R32', date:'2026-06-29', kickoff:'2026-06-29T17:00Z', venue:'NRG Stadium, Houston',                  home:{g:'C',p:1}, away:{g:'F',p:2}, homeScore:null, awayScore:null },
  { id:'M74', round:'R32', date:'2026-06-29', kickoff:'2026-06-29T20:30Z', venue:'Gillette Stadium, Foxborough',          home:{g:'E',p:1}, away:{t3:['A','B','C','D','F']}, homeScore:null, awayScore:null },
  { id:'M75', round:'R32', date:'2026-06-30', kickoff:'2026-06-30T01:00Z', venue:'Estadio Akron, Guadalajara',            home:{g:'F',p:1}, away:{g:'C',p:2}, homeScore:null, awayScore:null },
  { id:'M78', round:'R32', date:'2026-06-30', kickoff:'2026-06-30T17:00Z', venue:'AT&T Stadium, Arlington',               home:{g:'E',p:2}, away:{g:'I',p:2}, homeScore:null, awayScore:null },
  { id:'M77', round:'R32', date:'2026-06-30', kickoff:'2026-06-30T21:00Z', venue:'MetLife Stadium, East Rutherford',      home:{g:'I',p:1}, away:{t3:['C','D','F','G','H']}, homeScore:null, awayScore:null },
  { id:'M79', round:'R32', date:'2026-07-01', kickoff:'2026-07-01T01:00Z', venue:'Estadio Azteca, Mexico City',           home:{g:'A',p:1}, away:{t3:['C','E','F','H','I']}, homeScore:null, awayScore:null },
  { id:'M80', round:'R32', date:'2026-07-01', kickoff:'2026-07-01T16:00Z', venue:'Mercedes-Benz Stadium, Atlanta',        home:{g:'L',p:1}, away:{t3:['E','H','I','J','K']}, homeScore:null, awayScore:null },
  { id:'M82', round:'R32', date:'2026-07-01', kickoff:'2026-07-01T20:00Z', venue:'Lumen Field, Seattle',                  home:{g:'G',p:1}, away:{t3:['A','E','H','I','J']}, homeScore:null, awayScore:null },
  { id:'M81', round:'R32', date:'2026-07-02', kickoff:'2026-07-02T00:00Z', venue:"Levi's Stadium, Santa Clara",           home:{g:'D',p:1}, away:{t3:['B','E','F','I','J']}, homeScore:null, awayScore:null },
  { id:'M84', round:'R32', date:'2026-07-02', kickoff:'2026-07-02T19:00Z', venue:'SoFi Stadium, Los Angeles',             home:{g:'H',p:1}, away:{g:'J',p:2}, homeScore:null, awayScore:null },
  { id:'M83', round:'R32', date:'2026-07-02', kickoff:'2026-07-02T23:00Z', venue:'BMO Field, Toronto',                    home:{g:'K',p:2}, away:{g:'L',p:2}, homeScore:null, awayScore:null },
  { id:'M85', round:'R32', date:'2026-07-03', kickoff:'2026-07-03T03:00Z', venue:'BC Place, Vancouver',                   home:{g:'B',p:1}, away:{t3:['E','F','G','I','J']}, homeScore:null, awayScore:null },
  { id:'M88', round:'R32', date:'2026-07-03', kickoff:'2026-07-03T18:00Z', venue:'AT&T Stadium, Arlington',               home:{g:'D',p:2}, away:{g:'G',p:2}, homeScore:null, awayScore:null },
  { id:'M86', round:'R32', date:'2026-07-03', kickoff:'2026-07-03T22:00Z', venue:'Hard Rock Stadium, Miami',              home:{g:'J',p:1}, away:{g:'H',p:2}, homeScore:null, awayScore:null },
  { id:'M87', round:'R32', date:'2026-07-04', kickoff:'2026-07-04T01:30Z', venue:'Arrowhead Stadium, Kansas City',        home:{g:'K',p:1}, away:{t3:['D','E','I','J','L']}, homeScore:null, awayScore:null },

  // ROUND OF 16 (8 matches)
  { id:'M90', round:'R16', date:'2026-07-04', kickoff:'2026-07-04T17:00Z', venue:'NRG Stadium, Houston',                  home:{w:73}, away:{w:75}, homeScore:null, awayScore:null },
  { id:'M89', round:'R16', date:'2026-07-04', kickoff:'2026-07-04T21:00Z', venue:'Lincoln Financial Field, Philadelphia', home:{w:74}, away:{w:77}, homeScore:null, awayScore:null },
  { id:'M91', round:'R16', date:'2026-07-05', kickoff:'2026-07-05T20:00Z', venue:'MetLife Stadium, East Rutherford',      home:{w:76}, away:{w:78}, homeScore:null, awayScore:null },
  { id:'M92', round:'R16', date:'2026-07-06', kickoff:'2026-07-06T00:00Z', venue:'Estadio Azteca, Mexico City',           home:{w:79}, away:{w:80}, homeScore:null, awayScore:null },
  { id:'M93', round:'R16', date:'2026-07-06', kickoff:'2026-07-06T19:00Z', venue:'AT&T Stadium, Arlington',               home:{w:83}, away:{w:84}, homeScore:null, awayScore:null },
  { id:'M94', round:'R16', date:'2026-07-07', kickoff:'2026-07-07T00:00Z', venue:'Lumen Field, Seattle',                  home:{w:81}, away:{w:82}, homeScore:null, awayScore:null },
  { id:'M95', round:'R16', date:'2026-07-07', kickoff:'2026-07-07T16:00Z', venue:'Mercedes-Benz Stadium, Atlanta',        home:{w:86}, away:{w:88}, homeScore:null, awayScore:null },
  { id:'M96', round:'R16', date:'2026-07-07', kickoff:'2026-07-07T20:00Z', venue:'BC Place, Vancouver',                   home:{w:85}, away:{w:87}, homeScore:null, awayScore:null },

  // QUARTER-FINALS (4 matches)
  { id:'M97',  round:'QF', date:'2026-07-09', kickoff:'2026-07-09T20:00Z', venue:'Gillette Stadium, Foxborough',          home:{w:89}, away:{w:90}, homeScore:null, awayScore:null },
  { id:'M98',  round:'QF', date:'2026-07-10', kickoff:'2026-07-10T19:00Z', venue:'SoFi Stadium, Los Angeles',             home:{w:93}, away:{w:94}, homeScore:null, awayScore:null },
  { id:'M99',  round:'QF', date:'2026-07-11', kickoff:'2026-07-11T21:00Z', venue:'Hard Rock Stadium, Miami',              home:{w:91}, away:{w:92}, homeScore:null, awayScore:null },
  { id:'M100', round:'QF', date:'2026-07-12', kickoff:'2026-07-12T01:00Z', venue:'Arrowhead Stadium, Kansas City',        home:{w:95}, away:{w:96}, homeScore:null, awayScore:null },

  // SEMI-FINALS (2 matches)
  { id:'M101', round:'SF', date:'2026-07-14', kickoff:'2026-07-14T19:00Z', venue:'AT&T Stadium, Arlington',               home:{w:97}, away:{w:98}, homeScore:null, awayScore:null },
  { id:'M102', round:'SF', date:'2026-07-15', kickoff:'2026-07-15T19:00Z', venue:'Mercedes-Benz Stadium, Atlanta',        home:{w:99}, away:{w:100}, homeScore:null, awayScore:null },

  // THIRD PLACE PLAYOFF
  { id:'M103', round:'3RD', date:'2026-07-18', kickoff:'2026-07-18T21:00Z', venue:'Hard Rock Stadium, Miami',             home:{l:101}, away:{l:102}, homeScore:null, awayScore:null },

  // FINAL
  { id:'M104', round:'FINAL', date:'2026-07-19', kickoff:'2026-07-19T19:00Z', venue:'MetLife Stadium, East Rutherford',   home:{w:101}, away:{w:102}, homeScore:null, awayScore:null },
]

export const KNOCKOUT_ROUND_LABELS = {
  R32: 'Round of 32', R16: 'Round of 16', QF: 'Quarter-finals',
  SF: 'Semi-finals', '3RD': '3rd Place Playoff', FINAL: 'Final',
}
