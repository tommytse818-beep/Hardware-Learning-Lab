import type { ReactNode } from "react";
import styles from "./week-one-foundation-diagram.module.css";

const ink = "#0f172a";
const wire = "#047857";
const muted = "#475569";
const accent = "#4338ca";
const current = "#b45309";

function Text({ x, y, children, anchor = "start", color = ink, size = 22, bold = false }: { x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end"; color?: string; size?: number; bold?: boolean }) {
  return <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontWeight={bold ? 700 : 500}>{children}</text>;
}
function Wire({ d }: { d: string }) { return <path d={d} fill="none" stroke={wire} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />; }
function Node({ x, y }: { x: number; y: number }) { return <circle cx={x} cy={y} r={5.5} fill={wire} />; }
function Arrow({ x, y, direction = "right", length = 52 }: { x: number; y: number; direction?: "right" | "down"; length?: number }) {
  return <path d={`M${x} ${y}h${length}m-10 -7 10 7 -10 7`} transform={direction === "down" ? `rotate(90 ${x} ${y})` : undefined} fill="none" stroke={current} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />;
}
function Source({ x, y }: { x: number; y: number }) {
  return <g><circle cx={x} cy={y} r={32} fill="#fff" stroke={wire} strokeWidth={3.5} /><Text x={x} y={y - 4} anchor="middle" color={wire} size={25}>+</Text><Text x={x} y={y + 22} anchor="middle" color={wire} size={25}>−</Text></g>;
}
function Resistor({ x, y, vertical = false }: { x: number; y: number; vertical?: boolean }) {
  return <rect x={x} y={y} width={vertical ? 32 : 100} height={vertical ? 70 : 32} fill="#fff7ed" stroke={wire} strokeWidth={3.5} />;
}

function CompleteLoop() {
  return <g>
    <Text x={32} y={42} color={accent} bold>Source → closed contact → load → return</Text>
    <Wire d="M80 188V120H260 M260 120H360 M360 120H570V185 M570 255V340H80V252" />
    <Source x={80} y={220} /><Node x={260} y={120} /><Node x={360} y={120} />
    <Resistor x={554} y={185} vertical />
    <Text x={310} y={90} anchor="middle" size={20}>Closed contact</Text>
    <Text x={618} y={226}>Load R</Text>
    <Text x={135} y={282} size={19}>Source</Text>
    <Arrow x={166} y={166} /><Arrow x={626} y={280} direction="down" length={30} />
    <Text x={350} y={218} anchor="middle" color={current} size={20}>Conventional current</Text>
    <Text x={350} y={250} anchor="middle" color={muted} size={19}>leaves + through the external loop</Text>
    <Text x={350} y={385} anchor="middle" color={wire} size={20}>Return conductor reaches the − terminal.</Text>
  </g>;
}

function LedLoop() {
  return <g>
    <Text x={32} y={42} color={accent} bold>A resistor and LED share one current path</Text>
    <Wire d="M80 188V110H350 M450 110H600V195 M600 245V340H80V252" />
    <Source x={80} y={220} /><Resistor x={350} y={94} />
    <path d="M579 195H621L600 239Z M577 245H623" fill="#eef2ff" stroke={wire} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M634 206l30 -30m-11 0h11v11 M645 232l30 -30m-11 0h11v11" fill="none" stroke={accent} strokeWidth={2.5} strokeLinecap="round" />
    <Arrow x={210} y={78} /><Text x={274} y={86} color={current} size={20}>I</Text>
    <Text x={400} y={78} anchor="middle">R</Text><Text x={400} y={158} anchor="middle" color={accent}>V_R</Text>
    <Text x={135} y={227} color={accent}>V_S</Text>
    <Text x={560} y={225} anchor="end" color={accent}>V_F</Text>
    <Text x={634} y={282} size={19}>Cathode bar</Text>
    <Text x={600} y={168} anchor="middle" size={19}>Anode</Text>
    <Text x={680} y={150} anchor="middle" color={accent} size={19}>Light out</Text>
    <Text x={135} y={287} size={19}>Source</Text>
    <Text x={370} y={280} anchor="middle" color={muted} size={20}>The resistor limits current.</Text>
    <Text x={400} y={395} anchor="middle" color={accent} bold>V_S = V_R + V_F</Text>
  </g>;
}

function LogicSymbols() {
  return <g>
    <Text x={32} y={42} color={accent} bold>Inputs enter from the left; outputs leave to the right.</Text>
    <Text x={154} y={89} anchor="middle" bold>AND</Text>
    <Text x={385} y={89} anchor="middle" bold>OR</Text>
    <Text x={607} y={89} anchor="middle" bold>NOT</Text>
    <path d="M100 120H150C230 120 230 230 150 230H100Z M330 120Q400 120 445 175Q400 230 330 230Q360 175 330 120 M560 120L650 175L560 230Z" fill="#eef2ff" stroke={accent} strokeWidth={3} strokeLinejoin="round" />
    <circle cx={661} cy={175} r={11} fill="#fff" stroke={accent} strokeWidth={3} />
    <Wire d="M46 150H100 M46 200H100 M210 175H250 M285 150H342 M285 200H342 M445 175H482 M516 175H560 M672 175H730" />
    <Text x={34} y={158} anchor="end" size={19}>A</Text><Text x={34} y={208} anchor="end" size={19}>B</Text>
    <Text x={271} y={158} anchor="end" size={19}>A</Text><Text x={271} y={208} anchor="end" size={19}>B</Text>
    <Text x={504} y={183} anchor="end" size={19}>A</Text>
    <Text x={154} y={282} anchor="middle" color={muted} size={20}>Two inputs</Text>
    <Text x={385} y={282} anchor="middle" color={muted} size={20}>Two inputs</Text>
    <Text x={607} y={282} anchor="middle" color={muted} size={20}>One input</Text>
    <Text x={400} y={345} anchor="middle" color={accent} size={20}>The small output circle on NOT means inversion.</Text>
    <Text x={400} y={384} anchor="middle" color={muted} size={19}>Normal OR has one curved input boundary.</Text>
  </g>;
}

function Series() {
  return <g>
    <Text x={32} y={44} color={accent} bold>One route through both resistors</Text>
    <Wire d="M80 188V120H230 M330 120H470 M570 120H700V310H80V252" />
    <Source x={80} y={220} />
    <Resistor x={230} y={104} /><Resistor x={470} y={104} />
    <Node x={170} y={120} /><Node x={400} y={120} /><Node x={655} y={310} />
    <Text x={170} y={157} anchor="middle" color={wire} bold>A</Text>
    <Text x={400} y={157} anchor="middle" color={wire} bold>B</Text>
    <Text x={655} y={346} anchor="middle" color={wire} bold>C · return</Text>
    <Text x={280} y={90} anchor="middle">R₁</Text><Text x={520} y={90} anchor="middle">R₂</Text>
    <Text x={135} y={286} size={19}>Source</Text>
    <Arrow x={145} y={78} /><Text x={205} y={86} color={current} size={20}>I</Text>
    <Text x={400} y={223} anchor="middle" bold>No third branch at B</Text>
    <Text x={400} y={259} anchor="middle" color={muted} size={20}>The same current passes through R₁ and R₂.</Text>
    <Text x={400} y={392} anchor="middle" color={muted} size={20}>Trace the full loop back to the source.</Text>
  </g>;
}

function Parallel() {
  return <g>
    <Text x={32} y={42} color={accent} bold>Two branches share the same two nodes</Text>
    <Wire d="M80 178V100H705 M80 242V340H705 M320 100V180 M320 250V340 M590 100V180 M590 250V340" />
    <Source x={80} y={210} />
    <Resistor x={304} y={180} vertical /><Resistor x={574} y={180} vertical />
    {[320, 590].map((x) => <g key={x}><Node x={x} y={100} /><Node x={x} y={340} /></g>)}
    <Text x={729} y={108} color={wire} bold>A</Text><Text x={729} y={348} color={wire} bold>B</Text>
    <Text x={278} y={224} anchor="end">R₁</Text><Text x={548} y={224} anchor="end">R₂</Text>
    <Text x={135} y={268} size={19}>Source</Text>
    <Arrow x={170} y={73} /><Text x={235} y={81} color={current} size={19}>I_source</Text>
    <Arrow x={363} y={143} direction="down" /><Text x={382} y={181} color={current} size={20}>I₁</Text>
    <Arrow x={633} y={143} direction="down" /><Text x={652} y={181} color={current} size={20}>I₂</Text>
    <Text x={455} y={288} anchor="middle" color={muted} size={20}>Same voltage</Text>
    <Text x={455} y={318} anchor="middle" color={muted} size={20}>across both branches</Text>
    <Text x={400} y={393} anchor="middle" color={accent} bold>I_source = I₁ + I₂</Text>
  </g>;
}

function SeparatedCharge() {
  return <g>
    <Text x={32} y={42} color={accent} bold>Separated charge creates a voltage</Text>
    <rect x={344} y={116} width={112} height={188} rx={12} fill="#eef2ff" />
    <Wire d="M105 218H330 M470 218H695 M330 108V308 M470 108V308" />
    <Node x={105} y={218} /><Node x={695} y={218} />
    <Text x={290} y={89} anchor="middle" color={current} bold>+Q</Text>
    <Text x={510} y={89} anchor="middle" color={accent} bold>−Q</Text>
    {[143, 190, 237, 284].map((y) => <g key={y}><Text x={306} y={y} anchor="middle" color={current} size={28}>+</Text><Text x={494} y={y} anchor="middle" color={accent} size={28}>−</Text></g>)}
    <Text x={400} y={179} anchor="middle" color={accent} size={19}>Insulator</Text>
    <Text x={400} y={212} anchor="middle" color={accent} size={18}>between</Text>
    <Text x={400} y={242} anchor="middle" color={accent} size={18}>the plates</Text>
    <Text x={105} y={260} anchor="middle" size={20}>Terminal A</Text>
    <Text x={695} y={260} anchor="middle" size={20}>Terminal B</Text>
    <Text x={400} y={353} anchor="middle" color={muted} size={20}>No conducting path through the ideal insulator.</Text>
    <Text x={400} y={397} anchor="middle" color={accent} bold>Q = C × V · V is measured between A and B</Text>
  </g>;
}

function Discharge() {
  const curve = Array.from({ length: 81 }, (_, index) => {
    const t = index / 20;
    return `${index === 0 ? "M" : "L"}${430 + 80 * t} ${350 - 240 * Math.exp(-t)}`;
  }).join(" ");
  const afterTau = 350 - 240 / Math.E;
  return <g>
    <Text x={32} y={42} color={accent} bold>Ideal isolated discharge</Text>
    <Text x={32} y={80} color={muted} size={20}>Source disconnected</Text>
    <Wire d="M130 110H295V184 M295 254V350H130V232 M130 110V208 M101 208H159 M101 232H159" />
    <Resistor x={279} y={184} vertical />
    <Text x={337} y={228}>R</Text><Text x={82} y={228} anchor="end">C</Text>
    <Text x={103} y={191} color={current}>+</Text><Text x={103} y={262} color={accent}>−</Text>
    <Arrow x={181} y={147} length={63} /><Text x={190} y={184} color={current} size={19}>I(t)</Text>
    <Text x={207} y={395} anchor="middle" color={accent} bold>τ = R × C</Text>
    <Text x={596} y={69} anchor="middle" color={accent} bold>Capacitor voltage</Text>
    <path d="M430 99V350H766" fill="none" stroke={muted} strokeWidth={2.5} />
    <Text x={414} y={117} anchor="end" size={19}>V₀</Text><Text x={414} y={356} anchor="end" size={19}>0</Text>
    {[1, 2, 3, 4].map((n) => <g key={n}><path d={`M${430 + n * 80} 350v7`} stroke={muted} strokeWidth={2} /><Text x={430 + n * 80} y={384} anchor="middle" size={19}>{n === 1 ? "τ" : `${n}τ`}</Text></g>)}
    <Text x={761} y={419} anchor="end" color={muted} size={19}>Time, t</Text>
    <path d={`M430 ${afterTau}H510V350`} fill="none" stroke={accent} strokeWidth={2} strokeDasharray="6 6" />
    <path d={curve} fill="none" stroke={wire} strokeWidth={4} />
    <circle cx={510} cy={afterTau} r={6} fill={accent} />
    <Text x={530} y={242} color={accent} size={20} bold>≈37% of V₀</Text>
  </g>;
}

function SignalFilter({ highPass }: { highPass: boolean }) {
  return <g>
    <Text x={32} y={42} color={accent} bold>{highPass ? "High-pass · output across R" : "Low-pass · output across C"}</Text>
    <Wire d={highPass ? "M80 120H238 M258 120H690 M238 90V150 M258 90V150 M490 120V205 M490 275V350 M80 350H690" : "M80 120H220 M320 120H690 M490 120V215 M460 215H520 M460 239H520 M490 239V350 M80 350H690"} />
    {highPass ? <Resistor x={474} y={205} vertical /> : <Resistor x={220} y={104} />}
    {[{ x: 80, y: 120 }, { x: 80, y: 350 }, { x: 490, y: 120 }, { x: 490, y: 350 }, { x: 690, y: 120 }, { x: 690, y: 350 }].map(({ x, y }) => <Node key={`${x}-${y}`} x={x} y={y} />)}
    <Text x={80} y={88} anchor="middle" color={wire} bold>IN</Text><Text x={690} y={88} anchor="middle" color={accent} bold>OUT</Text>
    <Text x={highPass ? 248 : 270} y={78} anchor="middle">{highPass ? "C" : "R"}</Text>
    <Text x={536} y={246}>{highPass ? "R" : "C"}</Text>
    <Text x={80} y={224} anchor="middle" size={20} color={muted}>V_in</Text>
    <path d="M80 165V190 M80 255V310 M73 173 80 165 87 173 M73 302 80 310 87 302" fill="none" stroke={muted} strokeWidth={2} />
    <Text x={672} y={227} anchor="middle" size={20} color={accent}>V_out</Text>
    <Text x={672} y={260} anchor="middle" size={20} color={accent}>{highPass ? "= V_R" : "= V_C"}</Text>
    <Text x={270} y={387} anchor="middle" color={wire} size={20}>Common reference · GND</Text>
    <Text x={400} y={428} anchor="middle" color={muted} size={19}>Both input and output voltages use the same reference.</Text>
  </g>;
}

const figures = {
  "complete-loop": {
    title: "Trace a complete, current-limited loop", height: 420, drawing: <CompleteLoop />,
    description: "A source has its positive terminal at the top and negative terminal at the bottom. The external loop runs from positive through a closed switch and resistor load, then back to negative. Conventional current arrows follow that direction.",
    caption: "The resistor load stays in the loop. If the contact opens, the continuous path stops; voltage may still exist across the gap. Use only the tutor-approved extra-low-voltage source.",
  },
  "led-loop": {
    title: "Read the LED loop before using numbers", height: 430, drawing: <LedLoop />,
    description: "The source positive terminal connects through a series resistor to the LED anode. The LED cathode bar connects to the source negative return. Light arrows point outwards. Source voltage is the sum of resistor voltage and LED forward voltage.",
    caption: "This symbolic teaching circuit uses V_S, V_R and V_F rather than the assessed values. Identify the LED anode and cathode from its actual datasheet before building; light arrows point out of an LED symbol.",
  },
  "logic-symbols": {
    title: "Recognise the three basic logic symbols", height: 420, drawing: <LogicSymbols />,
    description: "AND has a flat input edge and rounded output edge. OR has one curved input boundary and a pointed output. NOT is a triangle with a small inversion circle at its output. The two-input gates have two separate input wires; NOT has one.",
    caption: "Use these symbols to draw your own tables. The extra input-side curve used by XOR is deliberately absent from the OR symbol here; the NOT output circle means inversion.",
  },
  "series-circuit": {
    title: "Follow one complete current path", height: 430, drawing: <Series />,
    description: "An ideal source connects to resistor R1, node B, resistor R2 and the return conductor. Node B has no third branch, so both resistors carry the same current.",
    caption: "Trace A → R₁ → B → R₂ → C and back through the source. Component positions on the page do not define series: the unbranched connection does.",
  },
  "parallel-circuit": {
    title: "Identify both endpoints of each branch", height: 430, drawing: <Parallel />,
    description: "R1 and R2 each connect between top node A and bottom node B. The source maintains the voltage between those nodes. Source current splits into I1 and I2, then rejoins on the return conductor.",
    caption: "Every point on the upper conductor is node A; every point on the lower conductor is node B. Each branch has the same voltage between A and B.",
  },
  "separated-charge": {
    title: "See what the capacitor stores", height: 430, drawing: <SeparatedCharge />,
    description: "Two conducting plates have equal and opposite charge, plus Q and minus Q. An insulator separates them. Each plate connects to its own external terminal; there is no conducting path through the ideal insulator.",
    caption: "Charge is separated on the plates, with finite energy stored in the electric field. V is the voltage between the terminals; a printed voltage rating is a limit, not a generated supply.",
  },
  "rc-discharge": {
    title: "Watch stored voltage fall through a resistor", height: 450, drawing: <Discharge />,
    description: "A charged capacitor and resistor form a closed discharge loop with the source disconnected. The voltage starts at V0 and decays exponentially toward zero. At one time constant tau equals R times C, approximately 37 percent of the initial voltage remains.",
    caption: "This ideal example has only C and its discharge resistor R. After one time constant, voltage is about 37% of its starting value, not zero. It does not define the product’s reminder time.",
  },
  "low-pass": {
    title: "Place the output across C", height: 460, drawing: <SignalFilter highPass={false} />,
    description: "Low-pass topology: input goes through a series resistor to the output node. A capacitor joins the output node to ground. Input and output are both measured relative to the same ground, so output voltage is the voltage across the capacitor.",
    caption: "For an ideal unloaded RC low-pass circuit, slow input changes pass more readily and rapid changes are reduced. OUT is the R–C junction; V_out is measured across C to GND.",
  },
  "high-pass": {
    title: "Place the output across R", height: 460, drawing: <SignalFilter highPass />,
    description: "High-pass topology: input goes through a series capacitor to the output node. A resistor joins the output node to ground. Input and output use the same ground, so output voltage is the voltage across the resistor.",
    caption: "For an ideal unloaded RC high-pass circuit, slow changes are reduced and faster changes pass more readily. OUT is the C–R junction; V_out is measured across R to GND.",
  },
};

export type WeekOneDiagramId = keyof typeof figures | "boolean-practice";

const legacyDiagramIds: Record<string, WeekOneDiagramId> = {
  "Current needs a return path": "complete-loop",
  "The resistor receives the remaining voltage": "led-loop",
  "Choose from the requirement, not the symbol shape": "logic-symbols",
  "Series: one route through both elements": "series-circuit",
  "Parallel: the same two endpoint nodes": "parallel-circuit",
  "A capacitor stores separated charge": "separated-charge",
  "Isolated RC discharge: a separate power-off example": "rc-discharge",
  "Low-pass: take the output across the capacitor": "low-pass",
  "High-pass: take the output across the resistor": "high-pass",
  "Start with behaviour, not a part number": "boolean-practice",
};

function isWeekOneDiagramId(value: string): value is WeekOneDiagramId {
  return value === "boolean-practice" || value in figures;
}

export function WeekOneFoundationDiagram({ diagramId, sectionHeading }: { diagramId?: string; sectionHeading?: string }) {
  let resolvedId: WeekOneDiagramId | undefined = sectionHeading ? legacyDiagramIds[sectionHeading] : undefined;
  if (diagramId && !isWeekOneDiagramId(diagramId)) {
    throw new Error(`Unknown Week 1 diagram ID: ${diagramId}`);
  }
  if (diagramId) resolvedId = diagramId as WeekOneDiagramId;
  if (resolvedId === "boolean-practice") {
    return <figure className={styles.figure}>
      <div className={styles.heading}><span>YOUR PAPER TASK</span><strong>Complete every input combination</strong></div>
      <table className={styles.practiceTable}>
        <caption>A = armed; D = delayed open condition; Y = your predicted output</caption>
        <thead><tr><th scope="col">A</th><th scope="col">D</th><th scope="col">Y</th></tr></thead>
        <tbody>{[[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, d]) => <tr key={`${a}${d}`}><td>{a}</td><td>{d}</td><td><span aria-label="Your answer">______</span></td></tr>)}</tbody>
      </table>
      <figcaption className={styles.caption}>Copy this foundation practice table, fill Y and explain each row before the checkpoint. The ARM exercise is separate from the full DrawerSense design.</figcaption>
    </figure>;
  }
  const figure = resolvedId ? figures[resolvedId] : undefined;
  if (!figure) return null;
  return <figure className={styles.figure}>
    <div className={styles.heading}><span>READ THE CIRCUIT</span><strong>{figure.title}</strong></div>
    <div className={styles.scroll} role="region" aria-label={`${figure.title}; scroll horizontally if needed`} tabIndex={0}>
      <svg className={styles.diagram} viewBox={`0 0 800 ${figure.height}`} role="img" aria-label={`${figure.title}. ${figure.description}`}>
        <title>{figure.title}</title><desc>{figure.description}</desc>{figure.drawing}
      </svg>
    </div>
    <figcaption className={styles.caption}>{figure.caption}<span className={styles.scrollHint}>On a narrow screen, scroll the diagram sideways to keep the labels readable.</span></figcaption>
  </figure>;
}
