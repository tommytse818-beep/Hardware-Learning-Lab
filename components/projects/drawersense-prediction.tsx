import type { ReactNode } from "react";

const ink = "#233747", teal = "#087f83", muted = "#536575", orange = "#b45309";
function Text({ x, y, children, size = 22, anchor = "start", bold = false, color = ink }: { x: number; y: number; children: ReactNode; size?: number; anchor?: "start" | "middle" | "end"; bold?: boolean; color?: string }) {
  return <text x={x} y={y} fontSize={size} textAnchor={anchor} fontWeight={bold ? 700 : 500} fill={color}>{children}</text>;
}
function Line({ d, faint = false }: { d: string; faint?: boolean }) {
  return <path d={d} stroke={faint ? "#9baab5" : teal} strokeWidth={3} fill="none" strokeDasharray={faint ? "7 7" : undefined} strokeLinecap="round" strokeLinejoin="round" />;
}
function Dot({ x, y }: { x: number; y: number }) { return <circle cx={x} cy={y} r={6} fill="white" stroke={ink} strokeWidth={2}/>; }
function Panel({ x, y, width, height }: { x: number; y: number; width: number; height: number }) { return <rect x={x} y={y} width={width} height={height} rx={14} fill="#f1f7f7" stroke="#cadada"/>; }

export const predictionDescriptions: Record<string, { title: string; description: string; caption: string }> = {
  "2.0A": { title: "Predict the reminder on two blank response tracks", description: "The first opening lasts five seconds. The second continues past a twenty-second target, then closes and reopens. Both reminder tracks are blank for your prediction.", caption: "Read the physical opening first. Sketch your reminder underneath and explain what closing and reopening should do. These are behaviour tracks, not electrical voltage measurements." },
  "2.0B": { title: "A five-function map for your connections", description: "Power sits above Sense, Wait/reset, Decide/mute and Alert. The jobs and connections are unfinished. Add information arrows and distinguish supply connections from return connections.", caption: "The boxes name the required functions. Add their jobs and connections in your own map. A functional arrow describes information; an electrical connection must be interpreted as part of a circuit." },
  "2.1A": { title: "Two unfinished switch views for your ON and OFF drawings", description: "Both templates keep terminals in the same positions: one at source positive, two at the board rail, and three at resistor R17 to ground. The moving contact is deliberately omitted. Draw one selected contact per stable state and identify the common terminal.", caption: "Unfinished drawing templates, not a third switch position. Add one moving contact to each view. This is reference terminal numbering, not a physical lever direction or a verified photograph." },
  "2.1B": { title: "Given parallel branches and an unconnected voltmeter", description: "Two loads share a 3.0 volt source and common return. Their given currents are two and three milliamps. A voltmeter symbol is supplied without leads. Draw its connections and current arrows, then calculate the unknown source current and branch voltages.", caption: "The currents are exercise givens. The unconnected V symbol is a tool for your drawing, not a meter already wired for use. Label both endpoints of each measurement." },
  "2.1C": { title: "Capacitor inventory beside an unfinished power drawing", description: "Three IC blocks are connected to supply and return. A separate inventory gives C1, a polarised 100 microfarad part marked 6.3 volts, and C2 through C4, each 100 nanofarads. Add their connections, polarity and location to your drawing.", caption: "The inventory is not a physical layout or a wired build. Decide where each capacitor belongs, then explain its job and what each marking means." },
  "2.1D": { title: "Known pulse values and blank voltage axes", description: "The ideal model gives 20 milliamps for one millisecond and a maximum voltage decrease of 0.30 volts. C1 is nominally 100 microfarads with plus or minus twenty percent tolerance. The waveform and calculations are left unfinished.", caption: "Assume the capacitor alone supplies the constant extra current. Sketch your predicted change, convert the units and calculate. The dashed line is the allowed lower voltage, not a measured response." },
  "2.1E": { title: "Disconnected source and unfinished RC discharge model", description: "The battery feed is disconnected. C1 is 100 microfarads, initially at 3.0 volts, and R17 is one kilohm. Connect the two components as a discharge loop and sketch voltage against time on the blank axes.", caption: "This is an unfinished isolated RC model. Add the discharge connections and conventional-current arrows. Distinguish the calculated time constant from the reminder wait." },
  "2.1F": { title: "Plan measurements at the near and far rail positions", description: "The near and far rail sections have a connection to investigate. Mark where the red and black probes go and record the actual readings. An observation sheet also asks for the source setting, tutor-chosen current limit, switch continuity states and OFF observation method.", caption: "A schematic planning view, not a breadboard photo. Map the real conductors with power disconnected. Record actual measurements separately from the example fault described in the question." },
};

export function BehaviourTracks({ explanation = false }: { explanation?: boolean }) {
  return <g>
    <Text x={44} y={44} size={26} bold>{explanation ? "Compare opening and reminder tracks" : "Read the opening. Draw the reminder."}</Text>
    <Text x={44} y={79} color={muted}>Target wait: 20 s · illustrative time spacing</Text>
    <Panel x={30} y={99} width={860} height={170}/>
    <Text x={48} y={133} bold>Brief opening</Text><Text x={48} y={168}>Open for 5 s</Text>
    <Line d="M275 160H330V125H445V160H847"/>
    <Text x={48} y={230} color={orange}>Reminder</Text>
    <Line d="M275 230H847" faint={!explanation}/>
    {!explanation && <Text x={500} y={215} color={muted}>Your prediction</Text>}
    {explanation && <Text x={500} y={214} color={orange}>Quiet throughout</Text>}
    <Panel x={30} y={285} width={860} height={195}/>
    <Text x={48} y={325} bold>Long opening</Text><Text x={48} y={359}>Then close</Text><Text x={48} y={391}>and reopen</Text>
    <Line d="M275 350H330V315H651V350H746V315H847"/>
    <Line d="M560 303V453 M651 303V453 M746 303V453" faint/>
    <Text x={560} y={465} anchor="middle" size={19}>20 s reached</Text><Text x={651} y={296} anchor="middle" size={19}>close</Text><Text x={772} y={296} anchor="middle" size={19}>reopen</Text>
    <Text x={48} y={432} color={orange}>Reminder</Text>
    <Line d={explanation ? "M275 434H560V399H651V434H847" : "M275 434H847"} faint={!explanation}/>
    {explanation && <Text x={765} y={410} anchor="middle" size={18} color={orange}>fresh wait</Text>}
    <Text x={44} y={514} color={muted}>{explanation ? "Closing stops the reminder and resets the wait." : "Add the output track and explain your prediction before checking."}</Text>
  </g>;
}

function FunctionTask() {
  return <g>
    <Text x={44} y={46} size={26} bold>Give the five functions their connections</Text>
    <Text x={44} y={83} color={muted}>Draw the information paths and the supply / return paths separately.</Text>
    <Panel x={326} y={115} width={268} height={87}/><Text x={460} y={151} anchor="middle" bold>① Power</Text><Text x={460} y={184} anchor="middle" color={muted}>Supply and return</Text>
    {[{x:35,n:"② Sense"},{x:252,n:"③ Wait / reset"},{x:469,n:"④ Decide / mute"},{x:686,n:"⑤ Alert"}].map(({x,n})=><g key={n}>
      <Panel x={x} y={280} width={198} height={118}/><Text x={x+99} y={319} size={21} anchor="middle" bold>{n}</Text><Text x={x+18} y={368} color={muted}>Job: __________</Text>
    </g>)}
    <Text x={44} y={452}>Which signals does the decision need?</Text>
    <Text x={44} y={490} color={muted}>Use a key so another learner can distinguish your line types.</Text>
  </g>;
}

function SwitchTask() {
  return <g>
    <Text x={44} y={45} size={26} bold>Keep the terminal positions fixed</Text>
    <Text x={44} y={82} color={muted}>Draw each selected contact. Then identify common and trace the route.</Text>
    {[{x:20,label:"Your ON sketch"},{x:470,label:"Your OFF sketch"}].map(({x,label})=><g key={label} transform={`translate(${x},0)`}>
      <Panel x={10} y={107} width={420} height={358}/><Text x={220} y={144} anchor="middle" bold>{label}</Text>
      <Line d="M45 211H155 M329 286H400 M163 366V390"/>
      <Dot x={163} y={211}/><Dot x={321} y={286}/><Dot x={163} y={358}/>
      <Text x={43} y={186} size={21}>1 · source +</Text><Text x={286} y={259} size={21}>2 · rail</Text><Text x={128} y={346} size={21}>3</Text>
      <rect x={150} y={390} width={26} height={33} fill="white" stroke={teal} strokeWidth={3}/><Line d="M163 423V440H300"/>
      <Text x={199} y={409} size={20}>R17 · 1 kΩ</Text><Text x={305} y={447} size={20}>GND</Text>
    </g>)}
    <Text x={44} y={506} color={muted}>The blank contact is a task space, not a neutral stable position.</Text>
  </g>;
}

function ParallelTask() {
  return <g>
    <Text x={44} y={46} size={26} bold>Trace two endpoints before calculating</Text>
    <Text x={44} y={83} color={muted}>Given: ideal source 3.0 V; branch currents 2 mA and 3 mA</Text>
    <Line d="M110 145H847 M110 388H847 M110 145V224 M110 306V388"/>
    <circle cx={110} cy={265} r={41} fill="#f1f7f7" stroke={teal} strokeWidth={3}/><Text x={110} y={257} anchor="middle">+</Text><Text x={110} y={287} anchor="middle">−</Text>
    <Text x={50} y={440}>3.0 V source</Text><Text x={791} y={129} color={teal}>VCC</Text><Text x={790} y={420} color={teal}>GND</Text>
    {[{x:363,n:"Load 1",i:"2 mA"},{x:595,n:"Load 2",i:"3 mA"}].map(({x,n,i})=><g key={n}>
      <Line d={`M${x} 145V213 M${x} 319V388`}/><Panel x={x-72} y={213} width={144} height={106}/><Text x={x} y={252} anchor="middle" bold>{n}</Text><Text x={x} y={292} anchor="middle" color={orange}>{i}</Text>
      <Dot x={x} y={145}/><Dot x={x} y={388}/>
    </g>)}
    <circle cx={808} cy={265} r={30} fill="white" stroke={ink} strokeWidth={3}/><Text x={808} y={275} anchor="middle" bold>V</Text>
    <Text x={758} y={334} size={19}>Add leads</Text><Text x={283} y={438}>V₁ = ?</Text><Text x={510} y={438}>V₂ = ?</Text>
    <Text x={44} y={489}>Add source and branch current arrows. Where does each current return?</Text>
  </g>;
}

function CapacitorTask() {
  return <g>
    <Text x={44} y={46} size={26} bold>Place each part and explain its job</Text>
    <Text x={44} y={83} color={muted}>Add capacitors to your own supply drawing. Include C1 polarity.</Text>
    <Panel x={35} y={120} width={260} height={332}/><Text x={57} y={158} bold>Parts to add</Text>
    <Text x={57} y={208} bold>C1 · polarised</Text><Text x={57} y={245}>100 µF · 6.3 V</Text>
    <Text x={57} y={303} bold>C2, C3, C4</Text><Text x={57} y={340}>100 nF each</Text><Text x={57} y={380}>Non-polarised</Text>
    <Line d="M329 166H863 M329 399H863"/><Text x={329} y={144} color={teal}>VCC</Text><Text x={329} y={434} color={teal}>GND</Text>
    {[421,594,767].map((x,i)=><g key={x}><Line d={`M${x} 166V235 M${x} 321V399`}/><Panel x={x-55} y={235} width={110} height={86}/><Text x={x} y={285} anchor="middle" bold>IC {i+1}</Text><Dot x={x} y={166}/><Dot x={x} y={399}/></g>)}
    <Text x={44} y={491}>Explain the two markings on C1 and the placement of each local part.</Text>
  </g>;
}

function DroopTask() {
  return <g>
    <Text x={44} y={46} size={26} bold>Turn the given limit into a design estimate</Text>
    <Text x={44} y={82} color={muted}>Ideal model: C1 alone supplies the constant extra current.</Text>
    <Panel x={35} y={109} width={350} height={335}/><Text x={57} y={151} bold>Known values</Text>
    <Text x={57} y={199}>I = 20 mA</Text><Text x={57} y={243}>Δt = 1 ms</Text><Text x={57} y={287}>Maximum ΔV = 0.30 V</Text>
    <Text x={57} y={346}>C1 = 100 µF ±20%</Text><Text x={57} y={396} color={muted}>Use the minimum actual C.</Text>
    <Line d="M440 145V369H851"/><Text x={440} y={129}>Voltage</Text><Text x={786} y={409}>Time</Text>
    <Line d="M450 183H849 M450 295H849 M503 175V368 M745 175V368" faint/>
    <Text x={622} y={210} anchor="middle" color={muted}>Starting voltage</Text><Text x={622} y={330} anchor="middle" color={muted}>Lowest allowed voltage</Text>
    <Text x={622} y={394} anchor="middle" size={20}>pulse lasts 1 ms</Text><Text x={577} y={258} color={orange}>Your curve</Text>
    <Text x={44} y={492} bold>C ≥ I Δt / ΔV</Text><Text x={300} y={492}>Convert, calculate, then compare with the limit.</Text>
  </g>;
}

function DischargeTask() {
  return <g>
    <Text x={44} y={46} size={26} bold>Connect the discharge loop and predict voltage</Text>
    <Text x={44} y={82} color={muted}>Battery feed disconnected · other board loads omitted</Text>
    <Panel x={34} y={113} width={490} height={305}/>
    <Line d="M164 173V249 M140 249H188 M140 269H188 M164 269V367 M369 173V233 M369 307V367"/>
    <rect x={350} y={233} width={38} height={74} fill="white" stroke={teal} strokeWidth={3}/>
    <Dot x={164} y={173}/><Dot x={164} y={367}/><Dot x={369} y={173}/><Dot x={369} y={367}/>
    <Text x={100} y={237} color={orange} size={29}>+</Text><Text x={92} y={149}>C1 100 µF</Text><Text x={305} y={149}>R17 1 kΩ</Text><Text x={55} y={395}>Initial C1 voltage: 3.0 V</Text>
    <Line d="M591 156V380H868"/><Text x={591} y={138}>Voltage</Text><Text x={810} y={416}>Time</Text><Text x={638} y={242} color={muted}>Your curve</Text>
    <Text x={612} y={332} color={muted} size={19}>Mark one time constant.</Text>
    <Text x={44} y={474} bold>I₀ = V₀ / R</Text><Text x={277} y={474} bold>τ = RC</Text>
    <Text x={44} y={511} color={muted}>Add wires and current arrows; the component ends are deliberately unjoined.</Text>
  </g>;
}

export function RailInvestigation({ explanation = false }: { explanation?: boolean }) {
  return <g>
    <Text x={44} y={46} size={26} bold>{explanation ? "Check the conductor between the two positions" : "Plan two measurements, not one"}</Text>
    <Text x={44} y={82} color={muted}>Map actual breadboard connections with all power removed.</Text>
    <Panel x={35} y={113} width={850} height={249}/>
    <Line d="M84 173H374 M542 173H837 M84 304H837"/>
    <rect x={384} y={142} width={147} height={65} rx={8} fill="white" stroke="#9baab5" strokeDasharray="7 7"/>
    <Text x={458} y={168} anchor="middle" size={19}>{explanation ? "Possible split" : "Investigate"}</Text><Text x={458} y={194} anchor="middle" size={19}>{explanation ? "or missing link" : "connection"}</Text>
    <Dot x={230} y={173}/><Dot x={695} y={173}/><Dot x={230} y={304}/><Dot x={695} y={304}/>
    <Text x={230} y={143} anchor="middle" bold>Near rail</Text><Text x={695} y={143} anchor="middle" bold>Far rail</Text>
    <Text x={230} y={233} anchor="middle" color={orange}>Reading: ___ V</Text><Text x={695} y={233} anchor="middle" color={orange}>Reading: ___ V</Text>
    <Text x={74} y={339} color={teal}>Common return: verify on the actual board</Text>
    <Text x={44} y={405}>Source setting: ____ V</Text><Text x={436} y={405}>Tutor’s current limit: ____ mA</Text>
    <Text x={44} y={453}>Record both switch continuity states and the OFF observation method.</Text>
    <Text x={44} y={500} color={muted}>{explanation ? "A gap is a hypothesis to test with power removed, not proof from coloured lines." : "In your sketch, add the voltmeter leads and name the two probe nodes."}</Text>
  </g>;
}

export function DrawerSensePrediction({ lessonId }: { lessonId: string }) {
  const drawings: Record<string, ReactNode> = { "2.0A":<BehaviourTracks/>, "2.0B":<FunctionTask/>, "2.1A":<SwitchTask/>, "2.1B":<ParallelTask/>, "2.1C":<CapacitorTask/>, "2.1D":<DroopTask/>, "2.1E":<DischargeTask/>, "2.1F":<RailInvestigation/> };
  return drawings[lessonId] ?? null;
}

/** Earlier concepts use different examples so they do not complete the task drawing. */
export function DrawerSenseConceptReference({ lessonId }: { lessonId: string }) {
  let title = "", caption = "", drawing: ReactNode = null;
  if (lessonId === "2.1A") {
    title = "Recall a simpler two-terminal switch";
    caption = "These are complete source–switch–resistor loops. Opening the contact breaks the steady current route; voltage can still exist at the source. The three-terminal task above adds a second selected route.";
    drawing = <>{[0,460].map((dx,i)=><g key={dx} transform={`translate(${dx},0)`}>
      <Text x={42} y={47} bold>{i===0?"Closed contacts":"Open contacts"}</Text>
      <Line d="M80 184V110H165 M239 110H350V163 M350 242V307H80V205 M55 184H105 M66 205H94"/>
      <Dot x={172} y={110}/><Dot x={232} y={110}/><Line d={i===0?"M179 110H225":"M179 105L227 77"}/>
      <rect x={334} y={163} width={32} height={79} fill="white" stroke={teal} strokeWidth={3}/>
      <Text x={98} y={242}>Source</Text><Text x={316} y={213} anchor="end">Resistor load</Text>
      <Text x={160} y={340} color={muted}>Return to source</Text>
    </g>)}</>;
  }
  if (lessonId === "2.1B") {
    title = "Recall series and parallel by their connections";
    caption = "In series the shared connection has no branch, so both elements carry the same current. In parallel both endpoints are shared. Physical proximity or the number of boxes does not define either connection.";
    drawing = <>
      <Text x={42} y={47} bold>Series: one unbranched route</Text><Text x={490} y={47} bold>Parallel: two shared endpoints</Text>
      <Line d="M75 179V101H343V135 M343 179V217 M343 261V307H75V213 M54 179H96 M64 213H86"/>
      <rect x={327} y={135} width={32} height={44} fill="white" stroke={teal} strokeWidth={3}/><rect x={327} y={217} width={32} height={44} fill="white" stroke={teal} strokeWidth={3}/>
      <Dot x={343} y={198}/><Text x={224} y={167}>R₁</Text><Text x={224} y={249}>R₂</Text><Text x={98} y={201} size={20}>no branch here</Text>
      <Line d="M527 180V101H852 M527 213V307H852 M506 180H548 M516 213H538 M666 101V172 M821 101V172 M666 236V307 M821 236V307"/>
      {[666,821].map((x,i)=><g key={x}><rect x={x-16} y={172} width={32} height={64} fill="white" stroke={teal} strokeWidth={3}/><Text x={x+27} y={212}>R{i+1}</Text><Dot x={x} y={101}/><Dot x={x} y={307}/></g>)}
      <Text x={509} y={87} color={teal}>Node A</Text><Text x={509} y={342} color={teal}>Node B</Text>
    </>;
  }
  if (lessonId === "2.1C") {
    title = "Recall why the whole RC network defines a filter";
    caption = "These ideal RC examples define an input and output relative to return. The output is across C for low-pass and across R for high-pass. A capacitor’s presence alone does not identify a filter or make it a reminder timer.";
    drawing = <>
      <Text x={40} y={47} bold>Low-pass · output across C</Text><Text x={491} y={47} bold>High-pass · output across R</Text>
      <Line d="M66 143H157 M245 143H419 M66 307H419 M338 143V211 M313 211H363 M313 231H363 M338 231V307"/>
      <rect x={157} y={128} width={88} height={30} fill="white" stroke={teal} strokeWidth={3}/><Dot x={338} y={143}/><Text x={195} y={116}>R</Text><Text x={279} y={236}>C</Text>
      <Text x={59} y={118}>IN</Text><Text x={367} y={118}>OUT</Text><Text x={59} y={341}>Return</Text>
      <Line d="M520 143H635 M635 119V167 M657 119V167 M657 143H877 M520 307H877 M802 143V188 M802 262V307"/>
      <rect x={787} y={188} width={30} height={74} fill="white" stroke={teal} strokeWidth={3}/><Dot x={802} y={143}/><Text x={638} y={99}>C</Text><Text x={833} y={232}>R</Text>
      <Text x={514} y={118}>IN</Text><Text x={825} y={118}>OUT</Text><Text x={514} y={341}>Return</Text>
    </>;
  }
  if (!drawing) return null;
  return <details className="border-t border-slate-200 bg-white px-5 py-4">
    <summary className="cursor-pointer text-base font-semibold text-slate-800">{title}</summary>
    <div className="mt-4 overflow-x-auto" role="region" tabIndex={0} aria-label={`${title}. Scroll horizontally on a narrow screen.`}>
      <svg viewBox="0 0 920 370" role="img" aria-label={caption} className="block h-auto w-full min-w-[840px]" style={{fontFamily:"Arial, Helvetica, sans-serif"}}><rect width={920} height={370} fill="#fffefa"/>{drawing}</svg>
    </div>
    <p className="mt-3 text-sm leading-relaxed text-slate-600">{caption}</p>
  </details>;
}

/** All content below is authored here; no learner text enters this SVG markup. */
export function getDrawerSenseCanvasMarkup(lessonId: string): string {
  const text = (x: number, y: number, label: string) => `<text x="${x}" y="${y}" fill="#64748b" stroke="none">${label}</text>`;
  const path = (d: string) => `<path d="${d}"/>`;
  const guides: Record<string, string> = {
    "2.0A": text(18,31,"Physical opening") + text(18,165,"Reminder") + path("M22 116H693 M22 267H693"),
    "2.0B": [[267,20,185,65],[22,195,148,83],[198,195,148,83],[374,195,148,83],[550,195,148,83]].map(([x,y,w,h],i)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/>` + text(x+12,y+25,["① Power","②","③","④","⑤"][i])).join(""),
    "2.1A": [0,350].map((dx,i)=>`<g transform="translate(${dx},0)">` + text(25,28,i===0?"ON: your contact and route":"OFF: your contact and route") + [[90,100],[260,169],[90,243]].map(([x,y],n)=>`<circle cx="${x}" cy="${y}" r="5"/>`+text(x-21,y-12,String(n+1))).join("")+"</g>").join(""),
    "2.1B": text(18,29,"VCC") + path("M25 48H695 M25 266H695") + text(18,299,"GND") + text(225,29,"Add loads, meter and current arrows"),
    "2.1C": text(18,29,"VCC") + path("M25 48H695 M25 266H695") + text(18,299,"GND") + text(225,29,"Add C1 and three local IC / capacitor pairs"),
    "2.1D": text(18,29,"Known values → SI units") + text(374,29,"Substitution, result and model limit") + path("M346 20V299 M18 89H315 M18 156H315 M18 223H315"),
    "2.1E": text(18,29,"Discharge loop; battery disconnected") + text(444,29,"Voltage") + path("M447 52V267H696") + text(653,296,"Time"),
    "2.1F": text(18,28,"Your corrected circuit and probe positions") + text(18,270,"Near: ____ V") + text(215,270,"Far: ____ V") + text(412,270,"Current limit: ____ mA") + text(18,306,"Switch states / OFF observation:"),
  };
  const guide = Object.hasOwn(guides, lessonId) ? guides[lessonId] : "";
  return guide ? `<g aria-hidden="true" pointer-events="none" font-family="Arial, Helvetica, sans-serif" font-size="17" fill="none" stroke="#bbc8d2" stroke-width="1.5" stroke-dasharray="5 6">${guide}</g>` : "";
}

/** Sparse, ungraded guides beneath the student's strokes in a 720 × 320 canvas. */
export function DrawerSenseCanvas({ lessonId }: { lessonId: string }) {
  return <g dangerouslySetInnerHTML={{ __html: getDrawerSenseCanvasMarkup(lessonId) }}/>;
}
