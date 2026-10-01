"use client";

import { useId, useState, type ReactNode } from "react";
import { BehaviourTracks, DrawerSenseConceptReference, DrawerSensePrediction, predictionDescriptions, RailInvestigation } from "./drawersense-prediction";
export { DrawerSenseCanvas, getDrawerSenseCanvasMarkup } from "./drawersense-prediction";

const ink = "#233747";
const teal = "#087f83";
const orange = "#b45309";
const muted = "#536575";

function Label({ x, y, children, anchor = "start", fill = ink, size = 22, weight = 500 }: {
  x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end";
  fill?: string; size?: number; weight?: number;
}) {
  return <text x={x} y={y} textAnchor={anchor} fill={fill} fontSize={size} fontWeight={weight}>{children}</text>;
}

function Wire({ d, color = teal, dashed = false }: { d: string; color?: string; dashed?: boolean }) {
  return <path d={d} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? "8 7" : undefined} />;
}

function Node({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={5} fill={teal} />;
}

function Capacitor({ x, top = 110, bottom = 350, centre = 223, polarised = false }: {
  x: number; top?: number; bottom?: number; centre?: number; polarised?: boolean;
}) {
  return <g>
    <Wire d={`M${x} ${top}V${centre - 10} M${x - 24} ${centre - 10}H${x + 24} M${x - 24} ${centre + 10}H${x + 24} M${x} ${centre + 10}V${bottom}`} />
    {polarised && <Label x={x - 42} y={centre - 20} fill={orange} size={28}>+</Label>}
    <Node x={x} y={top} /><Node x={x} y={bottom} />
  </g>;
}

function DownArrow({ x, y, color = orange }: { x: number; y: number; color?: string }) {
  return <path d={`M${x} ${y}v38m-7 -8 7 8 7 -8`} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />;
}

function RightArrow({ x, y, length = 32, color = orange }: { x: number; y: number; length?: number; color?: string }) {
  return <path d={`M${x} ${y}h${length}m-8 -7 8 7 -8 7`} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />;
}

function Functions() {
  const blocks = [
    { x: 90, label: "② Sense", detail: "open / closed" },
    { x: 285, label: "③ Wait / reset", detail: "elapsed time" },
    { x: 480, label: "④ Decide / mute", detail: "allow reminder?" },
    { x: 675, label: "⑤ Alert", detail: "output" },
  ];
  return <g>
    <Label x={44} y={45} weight={700} size={26}>One job per function</Label>
    <Label x={44} y={81} fill={teal} weight={700}>① Power: common supply</Label>
    <Wire d="M65 102H850 M65 399H850" />
    {blocks.map((block) => <g key={block.label}>
      <Wire d={`M${block.x + 78} 102V194 M${block.x + 78} 306V399`} />
      <Node x={block.x + 78} y={102} /><Node x={block.x + 78} y={399} />
      <rect x={block.x} y={194} width={166} height={112} rx={14} fill="#f1f7f7" stroke="#c0d6d6" strokeWidth={2} />
      <Label x={block.x + 83} y={238} anchor="middle" weight={700} size={22}>{block.label}</Label>
      <Label x={block.x + 83} y={275} anchor="middle" fill={muted} size={22}>{block.detail}</Label>
    </g>)}
    {[256, 451, 646].map((x) => <RightArrow key={x} x={x} y={252} length={27} />)}
    <Wire d="M214 194V151H602V194" color={orange} dashed />
    <path d="m595 184 7 10 7-10" fill="none" stroke={orange} strokeWidth={3} />
    <Label x={408} y={141} anchor="middle" fill={orange}>sense also informs the decision</Label>
    <Label x={44} y={437} fill={teal} weight={700}>Common return (GND)</Label>
    <RightArrow x={44} y={477} length={55} />
    <Label x={117} y={485} fill={orange}>Information direction</Label>
    <Wire d="M464 477H519" />
    <Label x={536} y={485} fill={teal}>Supply / return connections</Label>
  </g>;
}

function SwitchPath({ powered = true, testLoad = false }: { powered?: boolean; testLoad?: boolean }) {
  return <g>
    <Label x={44} y={45} weight={700} size={26}>{testLoad ? "Power-stage reference before adding other subsystems" : "Follow the moving contact"}</Label>
    <Label x={44} y={81} fill={muted}>JS102011CQN · reference electrical symbol</Label>
    <rect x={303} y={110} width={322} height={255} rx={18} fill="#f1f7f7" stroke="#c0d6d6" strokeWidth={2} />
    <Wire d={testLoad ? "M90 214V156H375 M90 278V429" : "M90 233V156H375 M90 255V429 M60 233H120 M75 255H105"} color={powered ? orange : muted} />
    {testLoad && <><circle cx={90} cy={246} r={32} fill="white" stroke={orange} strokeWidth={3}/><Label x={90} y={241} anchor="middle">+</Label><Label x={90} y={267} anchor="middle">−</Label></>}
    <Wire d="M90 429H835 M594 271H835V310 M835 384V429" />
    <Wire d="M384 334V374" color={powered ? muted : orange} />
    <Label x={64} y={136} fill={teal}>{testLoad ? "Source +" : "Battery +"}</Label>
    <Label x={701} y={244} fill={teal}>VCC rail</Label>
    <Label x={87} y={464} fill={teal}>{testLoad ? "Source − / GND" : "Battery − / GND"}</Label>
    <Label x={42} y={298} fill={ink}>3.0 V</Label>
    <Label x={800} y={353} anchor="end" fill={muted} size={testLoad ? 19 : 22}>{testLoad ? "Test" : "Board"}</Label>
    <Label x={800} y={382} anchor="end" fill={muted} size={testLoad ? 19 : 22}>{testLoad ? "load*" : "loads"}</Label>
    <rect x={816} y={310} width={38} height={74} fill="#fff" stroke={teal} strokeWidth={3} />
    <Capacitor x={676} top={271} bottom={429} centre={353} polarised />
    <Label x={703} y={321} size={20}>C1</Label><Label x={592} y={405} size={20}>100 µF</Label>
    <circle cx={384} cy={156} r={9} fill="white" stroke={ink} strokeWidth={3} />
    <circle cx={384} cy={325} r={9} fill="white" stroke={ink} strokeWidth={3} />
    <circle cx={584} cy={271} r={9} fill="white" stroke={ink} strokeWidth={3} />
    <Wire d={powered ? "M576 267L392 161" : "M575 273L393 323"} color={orange} />
    <Label x={360} y={141} weight={700}>1</Label>
    <Label x={597} y={257} weight={700}>2</Label>
    <Label x={591} y={306} weight={700} size={20}>common</Label>
    <Label x={353} y={319} weight={700}>3</Label>
    <Label x={430} y={powered ? 168 : 350} fill={orange} weight={700}>
      {powered ? "ON: 2 connects to 1" : "OFF: 2 connects to 3"}
    </Label>
    <rect x={365} y={374} width={38} height={37} fill="white" stroke={powered ? muted : orange} strokeWidth={3} />
    <Wire d="M384 411V429" color={powered ? muted : orange} />
    <Node x={384} y={429} />
    <Label x={417} y={400} fill={ink}>R17 · 1 kΩ</Label>
    <Label x={44} y={504} fill={muted}>
      {testLoad ? "*Tutor-approved load. Add local bypass parts when each checked IC is added." : powered ? "Source feeds VCC. Terminal 3 is disconnected from the common contact." : "Source feed is disconnected. VCC connects through R17 to GND."}
    </Label>
  </g>;
}

function ParallelLoads() {
  return <g>
    <Label x={44} y={46} weight={700} size={26}>Two branches, two shared nodes</Label>
    <Label x={44} y={83} fill={muted}>Given values for the ideal steady-current model</Label>
    <Wire d="M118 141H831 M118 388H831 M118 141V224 M118 306V388" />
    <circle cx={118} cy={265} r={41} fill="#f1f7f7" stroke={teal} strokeWidth={3} />
    <Label x={118} y={258} anchor="middle" size={28}>+</Label>
    <Label x={118} y={285} anchor="middle" size={28}>−</Label>
    <Label x={62} y={441} weight={700}>Source: 3.0 V</Label>
    <Label x={787} y={125} fill={teal}>VCC</Label>
    <Label x={787} y={425} fill={teal}>GND</Label>
    {[400, 660].map((x, index) => <g key={x}>
      <Wire d={`M${x} 141V210 M${x} 317V388`} />
      <rect x={x - 70} y={210} width={140} height={107} rx={12} fill="#f1f7f7" stroke={teal} strokeWidth={2} />
      <Label x={x} y={251} anchor="middle" weight={700}>Load {index + 1}</Label>
      <Label x={x} y={289} anchor="middle" fill={orange}>{index === 0 ? "2 mA" : "3 mA"}</Label>
      <Node x={x} y={141} /><Node x={x} y={388} />
      <DownArrow x={x + 94} y={242} />
    </g>)}
    <RightArrow x={210} y={115} length={76} />
    <Label x={217} y={190} fill={orange}>I source = 5 mA</Label>
    <Label x={320} y={441} fill={muted}>Voltage across each load = 3.0 V</Label>
    <Wire d="M820 141V234 M820 296V388" color={ink}/>
    <circle cx={820} cy={265} r={30} fill="white" stroke={ink} strokeWidth={3}/>
    <Label x={820} y={274} anchor="middle" weight={700}>V</Label>
    <Node x={820} y={141}/><Node x={820} y={388}/>
    <Label x={44} y={500} fill={muted}>The voltmeter spans VCC and GND; each branch has both endpoints.</Label>
  </g>;
}

function CapacitorJobs() {
  return <g>
    <Label x={44} y={45} weight={700} size={26}>Shared rail support and local bypass</Label>
    <Label x={44} y={83} fill={teal}>VCC rail</Label>
    <Wire d="M70 110H851 M70 350H851" />
    <Capacitor x={150} polarised />
    <Label x={124} y={176} anchor="end" weight={700}>C1</Label>
    <Label x={150} y={388} anchor="middle">100 µF</Label>
    {[310, 510, 710].map((x, index) => <g key={x}>
      <rect x={x - 46} y={138} width={181} height={190} rx={12} fill="#f1f7f7" />
      <Capacitor x={x} />
      <Label x={x - 15} y={182} anchor="end" weight={700}>C{index + 2}</Label>
      <Label x={x + 45} y={388} anchor="middle">100 nF</Label>
      <Wire d={`M${x + 90} 110V182 M${x + 90} 267V350`} />
      <Node x={x + 90} y={110} /><Node x={x + 90} y={350} />
      <rect x={x + 55} y={182} width={70} height={85} rx={6} fill="white" stroke={ink} strokeWidth={2} />
      <Label x={x + 90} y={231} anchor="middle" weight={700}>IC {index + 1}</Label>
    </g>)}
    <Label x={68} y={337} anchor="end" fill={teal}>GND</Label>
    <Label x={44} y={432} weight={700}>C1: 6.3 V rated voltage</Label>
    <Label x={44} y={467} fill={muted}>Bulk support across the rail.</Label>
    <Label x={450} y={432} weight={700}>C2–C4: local bypass</Label>
    <Label x={450} y={467} fill={muted}>Short paths to each IC’s supply pins.</Label>
    <Label x={44} y={508} fill={muted}>Schematic grouping shows location intent, not a PCB layout.</Label>
  </g>;
}

function DroopModel() {
  return <g>
    <Label x={44} y={45} weight={700} size={26}>A short pulse draws stored charge</Label>
    <Label x={44} y={82} fill={muted}>Assume constant current supplied by an ideal capacitor.</Label>
    <rect x={38} y={110} width={312} height={300} rx={16} fill="#f1f7f7" />
    <Label x={62} y={156} weight={700}>Given</Label>
    <Label x={62} y={207}>Current, I = 20 mA</Label>
    <Label x={62} y={255}>Pulse, Δt = 1 ms</Label>
    <Label x={62} y={304}>Maximum droop:</Label>
    <Label x={62} y={341} weight={700} fill={orange}>ΔV = 0.30 V</Label>
    <Label x={62} y={386} size={20}>C1 minimum: 80 µF</Label>
    <Wire d="M423 142V376H848" color={muted} />
    <Label x={415} y={126} fill={muted}>Rail voltage</Label>
    <Label x={764} y={410} fill={muted}>Time</Label>
    <Wire d="M433 187H505L748 288H844" />
    <Wire d="M505 187H800 M748 288H800 M505 187V376 M748 288V376 M505 309H844" color="#99a7b2" dashed />
    <Wire d="M807 187V288 M799 187H815 M799 288H815" color={orange} />
    <Label x={622} y={335} anchor="middle" fill={orange}>ΔV = 0.25 V</Label>
    <Label x={622} y={360} anchor="middle" fill={muted} size={19}>Below the 0.30 V limit</Label>
    <Label x={622} y={405} anchor="middle" fill={teal}>Δt = 1 ms</Label>
    <rect x={38} y={429} width={844} height={88} rx={13} fill="#fff6e8" />
    <Label x={63} y={467} size={26} weight={700} fill={orange}>C minimum ≈ 66.7 µF</Label>
    <Label x={63} y={501} size={21}>C ≥ I Δt / ΔV; at 80 µF, ΔV = I Δt / C</Label>
    <Label x={565} y={466} size={21}>Ideal capacitor-only result.</Label>
    <Label x={565} y={500} size={21}>Measure the real transient.</Label>
  </g>;
}

function Discharge() {
  const decay = Array.from({length:51}, (_, index) => {
    const t = index / 10;
    return `${index ? "L" : "M"}${628 + t * 44} ${349 - 191 * Math.exp(-t)}`;
  }).join(" ");
  return <g>
    <Label x={44} y={45} weight={700} size={26}>OFF: follow the stored charge</Label>
    <Label x={44} y={83} fill={muted}>Isolated RC model · battery feed disconnected</Label>
    <Wire d="M72 138H166 M227 138H450 M274 350H450V295 M450 214V138" />
    <circle cx={175} cy={138} r={7} fill="white" stroke={ink} strokeWidth={3} />
    <circle cx={220} cy={138} r={7} fill="white" stroke={ink} strokeWidth={3} />
    <Wire d="M181 133L218 108" color={orange} />
    <Label x={63} y={180} fill={muted}>Battery +</Label>
    <Label x={153} y={229} fill={orange}>open</Label>
    <Capacitor x={274} top={138} bottom={350} centre={254} polarised />
    <rect x={431} y={214} width={38} height={81} fill="white" stroke={teal} strokeWidth={3} />
    <Label x={294} y={213} weight={700}>C1</Label>
    <Label x={294} y={292}>100 µF</Label>
    <Label x={477} y={244} weight={700}>R17</Label>
    <Label x={477} y={279}>1 kΩ</Label>
    <DownArrow x={495} y={306} />
    <Label x={65} y={390} fill={teal}>Initial capacitor voltage: 3.0 V</Label>
    <Wire d="M619 143V349H860" color={muted} />
    <Wire d={decay} />
    <Wire d="M672 279V349 M619 279H672" color="#99a7b2" dashed/>
    <Label x={683} y={267} size={19}>≈1.10 V remains</Label>
    <Label x={672} y={377} anchor="middle" size={19}>0.10 s (1τ)</Label>
    <Label x={848} y={377} anchor="end" size={19}>0.50 s (5τ)</Label>
    <Label x={619} y={129} fill={muted}>Voltage</Label>
    <Label x={797} y={411} fill={muted}>Time</Label>
    <rect x={38} y={429} width={844} height={76} rx={13} fill="#fff6e8" />
    <Label x={63} y={475} weight={700} size={28} fill={orange}>I₀ = 3 mA</Label>
    <Label x={282} y={475} weight={700} size={28} fill={orange}>τ = 0.10 s</Label>
    <Label x={475} y={475}>After 5τ: below 1% in this model.</Label>
  </g>;
}

function BenchMeasurement() {
  return <g>
    <Label x={44} y={45} weight={700} size={26}>Measure voltage between two nodes</Label>
    <Label x={44} y={82} fill={muted}>Use the DC voltage setting and the V / COM sockets.</Label>
    <Wire d="M86 148H838 M86 369H838 M86 148V224 M86 294V369 M738 148V225 M738 294V369" />
    <circle cx={86} cy={259} r={35} fill="#f1f7f7" stroke={teal} strokeWidth={3} />
    <Label x={86} y={251} anchor="middle">+</Label>
    <Label x={86} y={279} anchor="middle">−</Label>
    <Label x={43} y={418}>DC source</Label>
    <Label x={762} y={134} fill={teal}>VCC</Label>
    <Label x={760} y={407} fill={teal}>GND</Label>
    <rect x={717} y={225} width={42} height={69} fill="white" stroke={teal} strokeWidth={3} />
    <Label x={778} y={270}>Load</Label>
    <rect x={337} y={188} width={249} height={151} rx={18} fill="#f1f7f7" stroke={ink} strokeWidth={2} />
    <rect x={359} y={204} width={205} height={56} rx={8} fill="white" stroke="#c0d6d6" />
    <Label x={461} y={243} anchor="middle" weight={700} size={26}>DC V · record</Label>
    <Label x={390} y={293} anchor="middle" fill={orange} weight={700}>V</Label>
    <Label x={528} y={293} anchor="middle" weight={700}>COM</Label>
    <circle cx={390} cy={314} r={8} fill={orange} /><circle cx={528} cy={314} r={8} fill={ink} />
    <Wire d="M390 322V347H284V148" color={orange} />
    <Wire d="M528 322V369H630" color={ink} />
    <Node x={284} y={148} /><Node x={630} y={369} />
    <Label x={254} y={131} fill={orange}>Red probe</Label>
    <Label x={454} y={405}>Black probe / return</Label>
    <Label x={44} y={467} weight={700}>Repeat at the near rail and the far rail; record both readings.</Label>
    <Label x={44} y={503} fill={muted}>Continuity checks use disconnected power and a discharged rail.</Label>
  </g>;
}

const diagrams: Record<string, { title: string; description: string; caption: string; drawing: ReactNode }> = {
  "2.0A": {
    title: "Physical opening and the resulting reminder tracks",
    description: "The reminder stays quiet for the five-second opening. For the long opening it begins at the twenty-second target, stops on closing, and starts a fresh wait after reopening.",
    caption: "Timing sketches are illustrative. The 20 s value is a design target, not a measured hardware delay.",
    drawing: <BehaviourTracks explanation />,
  },
  "2.0B": {
    title: "DrawerSense functional map with distinct information and power paths",
    description: "Sense passes information to wait/reset and directly to decide/mute. Wait/reset feeds decide/mute, which feeds alert. Each function has a separate connection to the common supply and return. Orange arrows show information; teal connections show power.",
    caption: "A functional map explains jobs and information. It does not specify detailed circuit wiring; shared power is drawn separately.",
    drawing: <Functions />,
  },
  "2.1A": {
    title: "Reference switch symbol showing one selected electrical path",
    description: "Terminal one is connected to battery positive. Terminal two connects to the board rail and moves between terminal one in board ON and terminal three in board OFF. Terminal three connects through R17 to ground. Only one position is connected at a time.",
    caption: "Electrical symbol; actual part photos to be added after continuity verification. Reference: JS102011CQN. Verify the actual part and viewing direction before wiring; the symbol does not indicate physical actuator direction.",
    drawing: <SwitchPath />,
  },
  "2.1B": {
    title: "Two ideal parallel loads on a 3.0 volt rail",
    description: "A 3.0 volt source feeds two branches that share both rail and ground nodes. Given branch currents of two and three milliamps add to a five milliamp source current. Each load has 3.0 volts across it. A voltmeter spans rail and ground in parallel.",
    caption: "Ideal steady-state example. Current arrows show conventional current direction; branch values are given, not measurements.",
    drawing: <ParallelLoads />,
  },
  "2.1C": {
    title: "Bulk and local bypass capacitors across the supply",
    description: "Polarised C1 is 100 microfarads with its positive plate at VCC. It has a rated voltage of 6.3 volts. C2, C3 and C4 are each 100 nanofarads and each sits beside its own integrated circuit supply and return connections.",
    caption: "Capacitors connect across supply and return. The 6.3 V label is C1’s voltage rating. Physical layout must keep local bypass paths short.",
    drawing: <CapacitorJobs />,
  },
  "2.1D": {
    title: "Ideal capacitance calculation with given current, duration and maximum droop",
    description: "For 20 milliamps over one millisecond and maximum droop of 0.30 volts, the ideal minimum capacitance is approximately 66.7 microfarads. At C1's minimum actual 80 microfarads, predicted droop is 0.25 volts, within the limit. Real transient measurements remain necessary.",
    caption: "Ideal charge-balance model, not a measured waveform. Actual behaviour also depends on the source, component tolerance, ESR and wiring.",
    drawing: <DroopModel />,
  },
  "2.1E": {
    title: "Isolated capacitor discharge after disconnecting the battery",
    description: "The source feed is open. A 100 microfarad capacitor initially at 3.0 volts discharges through one kilohm. Initial current is three milliamps and the isolated RC time constant is 0.10 seconds. About 1.10 volts remains after one time constant; after five time constants, less than one percent remains.",
    caption: "Isolated RC approximation. The OFF discharge time constant is a different quantity from the reminder delay; other board loads can affect real discharge.",
    drawing: <Discharge />,
  },
  "2.1F": {
    title: "DC voltmeter connected across the supply rail and return",
    description: "A meter set to DC volts has its red lead in the V socket and its black lead in COM. The red probe connects to VCC and the black probe to ground, in parallel with the load. Record readings at both near and far rail positions.",
    caption: "Measurement schematic, not a breadboard photograph or build sign-off. Physical inspection and tutor-approved bench settings remain necessary.",
    drawing: <BenchMeasurement />,
  },
};

export function DrawerSenseDiagram({ lessonId, variant = "prediction" }: { lessonId: string; variant?: "prediction" | "explanation" }) {
  const instanceId = useId();
  const [switchOn, setSwitchOn] = useState(true);
  const explanation = variant === "explanation";
  const diagram = explanation ? diagrams[lessonId] : predictionDescriptions[lessonId];
  if (!diagram) return null;
  const isSwitchDiagram = explanation && lessonId === "2.1A";
  const switchDescription = switchOn
    ? "ON state: moving common terminal 2 connects to source-positive terminal 1 and supplies the board VCC rail. Terminal 3 and its R17 discharge branch are disconnected from the common contact."
    : "OFF state: moving common terminal 2 connects to terminal 3, placing R17 between the VCC rail and GND. Source-positive terminal 1 is disconnected. There is no direct connection from source positive to GND.";

  return <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800">
    {isSwitchDiagram && <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
      <p className="text-sm font-semibold text-slate-900">Choose one electrical contact state</p>
      <div className="mt-3 flex flex-wrap gap-3" role="group" aria-label="Switch electrical state">
        {[{ powered: true, label: "ON" }, { powered: false, label: "OFF" }].map((state) => <button
          key={state.label}
          type="button"
          aria-pressed={switchOn === state.powered}
          aria-controls={`${instanceId}-diagram`}
          onClick={() => setSwitchOn(state.powered)}
          className={`min-w-24 rounded-xl border px-5 py-3 text-base font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${switchOn === state.powered ? "border-amber-700 bg-amber-100 text-amber-950" : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"}`}
        >{state.label}</button>)}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">Reference terminals: 1 = source positive; 2 = common / VCC; 3 = R17 to GND.</p>
      <p role="status" aria-live="polite" className="mt-2 text-sm leading-6 text-slate-600">
        {switchOn ? "ON selected: the common contact touches terminal 1 only." : "OFF selected: the common contact touches terminal 3 only."}
        {" "}Orange marks the selected connection. The drawing shows electrical contacts, not lever direction.
      </p>
    </div>}
    <div
      className="overflow-x-auto overscroll-x-contain focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-teal-600"
      tabIndex={0}
      role="region"
      aria-label={`${diagram.title}. Scroll horizontally on a narrow screen.`}
    >
      <svg
        id={`${instanceId}-diagram`}
        viewBox="0 0 920 534"
        role="img"
        aria-labelledby={`${instanceId}-title ${instanceId}-description`}
        className="block h-auto w-full min-w-[840px]"
        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
      >
        <title id={`${instanceId}-title`}>{`${diagram.title}${isSwitchDiagram ? `: ${switchOn ? "ON" : "OFF"}` : ""}`}</title>
        <desc id={`${instanceId}-description`}>{isSwitchDiagram ? switchDescription : diagram.description}</desc>
        <rect width={920} height={534} fill="#fffefa" />
        {!explanation ? <DrawerSensePrediction lessonId={lessonId}/> : isSwitchDiagram ? <SwitchPath powered={switchOn} /> : diagrams[lessonId].drawing}
      </svg>
    </div>
    <figcaption className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-relaxed text-slate-600">
      {diagram.caption}
      <span className="mt-1 block text-xs text-slate-500">On smaller screens, scroll the diagram sideways to keep labels readable.</span>
    </figcaption>
    <DrawerSenseConceptReference lessonId={lessonId}/>
    {explanation && lessonId === "2.1F" && <div className="overflow-x-auto border-t border-slate-200" tabIndex={0} role="region" aria-label="Near and far rail investigation. Scroll horizontally on a narrow screen.">
      <svg viewBox="0 0 920 534" role="img" aria-label="Near and far rail measurements must be recorded separately. A possible split or missing link is tested with power disconnected." className="block h-auto w-full min-w-[840px]" style={{fontFamily:"Arial, Helvetica, sans-serif"}}><rect width={920} height={534} fill="#fffefa"/><RailInvestigation explanation/></svg>
    </div>}
    {explanation && lessonId === "2.1F" && <details className="border-t border-slate-200 px-5 py-4"><summary className="cursor-pointer text-base font-semibold">Power-stage circuit to compare with your drawing</summary><div className="mt-4 overflow-x-auto" tabIndex={0} role="region" aria-label="Power-stage reference. Scroll horizontally on a narrow screen."><svg viewBox="0 0 920 534" role="img" aria-label="A 3 volt source supplies the selected ON switch path, a polarised 100 microfarad C1 and a tutor-approved test load. The other throw goes through R17 to ground. No loose ICs are included." className="block h-auto w-full min-w-[840px]" style={{fontFamily:"Arial, Helvetica, sans-serif"}}><rect width={920} height={534} fill="#fffefa"/><SwitchPath testLoad/></svg></div><p className="mt-3 text-sm leading-relaxed text-slate-600">Build with power removed. Use the tutor’s regulated source and current limit for the first test. This reference symbol does not replace checking the actual switch view, polarity, breadboard conductors or physical build.</p></details>}
  </figure>;
}
