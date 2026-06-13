import { TEAMS } from './data.js'

// Short scouting summary for each team
export const TEAM_REVIEWS = {
  MEX: "Hosts with home advantage and a passionate crowd. Solid spine but historically struggle to convert dominance into knockout wins.",
  KOR: "Asian powerhouse built around pace and pressing. Will need their European-based stars to fire to escape a tricky group.",
  RSA: "Bafana Bafana bring energy and a tight defensive shape, but lack the firepower to trouble the bigger sides.",
  CZE: "Well-organised European outfit with a strong set-piece threat. Capable of an upset but short on depth.",
  CAN: "Co-hosts riding a long unbeaten run, built on pace out wide and a settled core from MLS and Europe.",
  SUI: "Typically efficient and hard to beat, with a deep, experienced squad that rarely embarrasses itself.",
  BIH: "Physical, direct side with a few standout individuals — competitive but group stage looks like the ceiling.",
  QAT: "Hosts of 2022 making the step up again; technically tidy but lacking the physicality for this level.",
  BRA: "Stacked with attacking talent across the front line. Genuine title contenders if the back line holds up.",
  MAR: "Riding the wave of their 2022 semi-final run, with a tight defence and dangerous transitions.",
  SCO: "Tartan Army bring passion and a well-drilled shape; can frustrate bigger teams but goals are scarce.",
  HAI: "History-makers just for qualifying. Expect spirited performances but a tough ask against Group C's heavyweights.",
  USA: "Hosts with a young, athletic core and growing belief. Home support could carry them deep into the knockouts.",
  AUS: "Socceroos bring a fighting spirit and defensive discipline; likely to be competitive without being prolific.",
  PAR: "Resolute and well-organised, Paraguay grind out results rather than dazzle — could sneak through as dark horses.",
  TUR: "Talented individuals with flashes of brilliance, but consistency across 90 minutes remains the question.",
  GER: "Reloaded golden generation with serious firepower. Among the favourites if the defence tightens up.",
  ECU: "Athletic, well-organised and difficult to break down — a classic group-stage banana skin for bigger nations.",
  CIV: "Pace and power in abundance from Ivory Coast's attack; talent there to cause problems for anyone.",
  CUW: "Smallest nation in the field by population — a fairytale story, but a major step up in quality awaits.",
  NED: "Deep, balanced squad with elite individuals in every line. Dark horse for a deep run.",
  JPN: "Slick, possession-based football with technical quality throughout — capable of beating anyone on their day.",
  SWE: "Solid and well-drilled, Sweden lean on team shape and set pieces rather than individual brilliance.",
  TUN: "Disciplined defensively with quick counters; will look to frustrate and nick a result late.",
  BEL: "Aging but still talented core looking for one last big run — quality up top but legs are a question.",
  EGY: "Built around their superstar forward, Egypt are dangerous on the counter but inconsistent defensively.",
  IRN: "Tough, well-organised and difficult to break down — typically punch above their ranking.",
  NZL: "Plucky underdogs with limited resources; competitive spirit but group stage is the realistic ceiling.",
  ESP: "Reigning continental champions playing the most attractive football in the tournament — top favourites.",
  URU: "Gritty, tactically flexible and never short of fight — always a tough out in knockout football.",
  SAU: "Improved depth and coaching, capable of a shock result but likely to find the group stage tough.",
  CPV: "Smallest population to ever qualify — organised and hard-working, but talent gap is significant.",
  FRA: "Defending runners-up with elite talent across the pitch. Squad depth makes them genuine champions.",
  SEN: "Athletic, physical and increasingly tactically savvy — capable of a deep run if the front line clicks.",
  NOR: "Built around their world-class striker, with quality wide players — knockout potential if service is good.",
  IRQ: "Returning to the World Cup after decades away — passionate support but a big gap in quality to close.",
  ARG: "World champions with the world's best player still leading the line — favourites to go all the way again.",
  AUT: "High-energy pressing side that's been a tough out for bigger nations in recent years.",
  ALG: "Pace and flair in attack but defensive lapses have cost them in the past — boom or bust.",
  JOR: "First World Cup appearance — proud underdogs who'll be happy just to compete in this group.",
  POR: "Star-studded squad with a golden generation reaching its peak — top-four potential.",
  COL: "Fluid, attacking football with genuine quality in midfield — capable of beating anyone on form.",
  UZB: "First-time qualifiers with a disciplined defensive setup — group stage participation is the realistic goal.",
  COD: "Athletic and direct, DR Congo bring raw talent but limited tournament experience at this level.",
  ENG: "Deep, talented squad under pressure to finally deliver — genuine title contenders on paper.",
  CRO: "Perennial overachievers with a never-say-die mentality — always dangerous in knockout football.",
  PAN: "Compact, well-drilled underdogs who can frustrate — limited ceiling but hard to beat.",
  GHA: "Athletic and technically gifted, the Black Stars have the talent to cause an upset or two.",
}

// Strength-based likely outcome prediction
export function predictOutcome(code) {
  const t = TEAMS[code]
  if (!t) return { label: 'Unknown', tier: 'unknown' }

  let s = t.strength + (t.host ? 0.4 : 0)

  if (s >= 8.5) return { label: 'World Cup contender', tier: 'top', detail: 'Genuine chance of lifting the trophy' }
  if (s >= 7.8) return { label: 'Semi-final potential', tier: 'high', detail: 'Could go deep with the right draw' }
  if (s >= 7.0) return { label: 'Round of 16 / Quarters', tier: 'mid-high', detail: 'Strong knockout chance' }
  if (s >= 6.2) return { label: 'Knockout stage possible', tier: 'mid', detail: 'Group stage 50/50, capable of advancing' }
  if (s >= 5.4) return { label: 'Group stage — outside chance', tier: 'low-mid', detail: 'Needs a strong group draw to advance' }
  return { label: 'Likely group stage exit', tier: 'low', detail: 'A point or upset would be a good tournament' }
}
