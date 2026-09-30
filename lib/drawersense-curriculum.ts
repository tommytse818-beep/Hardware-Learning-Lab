/** Student-facing Rev G material. Answers and worked solutions live on the server. */
export type LessonId =
  | "2.0A"
  | "2.0B"
  | "2.1A"
  | "2.1B"
  | "2.1C"
  | "2.1D"
  | "2.1E"
  | "2.1F";

export type NumericResponse = { value: string; unit: string; conclusion?: string };
export type QuestionResponse = string | NumericResponse;

export interface Question {
  id: string;
  prompt: string;
  kind: "choice" | "numeric";
  choices?: string[];
  units?: { label: string; value: string; multiplier: number }[];
  quantity?: string;
  precision?: string;
  conclusion?: { prompt: string; choices: string[] };
  hint: string;
}

export interface Lesson {
  id: LessonId;
  title: string;
  section: "2.0" | "2.1";
  summary: string;
  concept: string[];
  givens?: { label: string; value: string }[];
  formula?: string;
  diagram: string;
  questions: Question[];
  drawingTask: string;
  workChecklist: string[];
  transfer: Question;
}

export type RecallId = "R1" | "R2" | "R3" | "R4" | "R5" | "R6" | "R7" | "R8";

export interface RecallCard {
  id: RecallId;
  title: string;
  body: string[];
  formula?: string;
  href?: string;
  coverageNote: string;
}

// R1–R8 are Rev G refresher identifiers, not historical website lesson numbers.
// Link to the prerequisite explanations in lib/courses.ts; recorded videos are
// separate resources and are not implied by these text-and-diagram links.
export const recallCards: Record<RecallId, RecallCard> = {
  R1: {
    id: "R1",
    title: "A circuit needs a return",
    body: [
      "Trace a complete route from source positive, through a load and back to source negative. A load is a part that uses electrical energy, such as a lamp.",
      "A closed electrical contact conducts; an open contact breaks that route. Zero current through an open contact does not mean the source voltage is zero.",
      "Describe drawer position and electrical contact state separately. A drawing or a verified sensor test must tell you how one corresponds to the other.",
    ],
    href: "/courses/open-guard-mini/lessons/safety-complete-circuit",
    coverageNote: "Revisit Week 1 section 1.2 for the complete circuit loop and power-off checking routine.",
  },
  R2: {
    id: "R2",
    title: "Trace nodes before naming the connection",
    body: [
      "A node is one continuously connected conductor. Follow the wires: nearby points on a page or breadboard are not necessarily connected.",
      "Series elements share a route with no branch between them, so the same current flows through both. Parallel branches connect to the same two endpoint nodes, so they have the same voltage.",
      "At a junction, total incoming current equals total outgoing current. Separate practice: 0.5 mA + 1.5 mA = 2 mA. The later check uses different values.",
    ],
    formula: "Iₛ = I₁ + I₂",
    href: "/courses/open-guard-mini/lessons/voltage-current-resistance",
    coverageNote: "Week 1 section 1.3 develops series, parallel and junction current. Start with the node-tracing practice in 1.2 if the endpoints are unclear.",
  },
  R3: {
    id: "R3",
    title: "Voltage, current and resistance",
    body: [
      "Voltage is a difference between two points, measured in volts (V). Current is the rate of charge flow through a path, measured in amperes (A). Resistance relates voltage to current and is measured in ohms (Ω).",
      "Ohm's law is V = IR. To find current, divide both sides by R: I = V/R. Separate practice: 4 V across 2 kΩ gives 4/2000 A = 0.002 A = 2 mA.",
      "A voltmeter connects across two points. A current measurement needs the correct series connection, sockets and range with tutor guidance. Never place a current-mode meter straight across the supply.",
    ],
    formula: "V = IR    ·    I = V/R",
    href: "/courses/open-guard-mini/lessons/ohms-law-led-resistor",
    coverageNote: "Week 1 section 1.4 applies Ohm's law and mA-to-A conversion to an LED resistor. Here we reuse the relation for the power block.",
  },
  R4: {
    id: "R4",
    title: "Convert units and show the arithmetic",
    body: [
      "A prefix changes the size of a unit: kilo (k) means ×1000, milli (m) means ÷1000, micro (µ) means ÷1,000,000, and nano (n) means ÷1,000,000,000.",
      "Separate practice: 25 mA = 0.025 A; 4 ms = 0.004 s; 47 µF = 0.000047 F. Write the equation first, substitute values in base units, calculate, then convert the result to a convenient unit.",
      "A −20% tolerance leaves 80%: multiply by 0.80. Separate practice: 220 µF × 0.80 = 176 µF. Component tolerance describes physical variation; a quiz's rounding allowance is different.",
      "Keep calculator digits during the working and round at the end. Leading zeros do not count as significant figures: 0.00470 has three. Always include a unit; V, A, Ω, F and s describe different quantities.",
    ],
    href: "/courses/open-guard-mini/lessons/ohms-law-led-resistor",
    coverageNote: "Week 1 section 1.4 introduces prefixes, units, rounding and component tolerance before separate LED and charge examples. Use this card as a quick reminder.",
  },
  R5: {
    id: "R5",
    title: "Capacitance connects charge and voltage",
    body: [
      "A capacitor has two conducting plates separated by an insulator. Connecting it in a circuit can leave equal and opposite charge on the plates. It stores finite electrical energy.",
      "Q is charge in coulombs (C), C is capacitance in farads (F), and V is voltage in volts. In Q = CV, the letter C means capacitance; the unit symbol C after a charge value means coulombs.",
      "Separate practice: a 10 µF capacitor at 2 V has Q = CV = 20 µC. For a change, ΔQ = CΔV. The symbol Δ means 'change in'.",
      "A constant current I flowing for a time Δt transfers charge ΔQ = IΔt. Match the two expressions to get CΔV = IΔt. Then divide by ΔV to find capacitance. This is the method; your assessed values come later.",
    ],
    formula: "Q = CV    ·    ΔQ = CΔV = IΔt",
    href: "/courses/open-guard-mini/lessons/ohms-law-led-resistor",
    coverageNote: "Use the separate capacitor-charge stages and drawing practice in Week 1 section 1.4 before applying the model to the power block.",
  },
  R6: {
    id: "R6",
    title: "An RC discharge takes time",
    body: [
      "After the source is disconnected, a charged capacitor can drive current through a connected resistor. As capacitor voltage falls, resistor current falls too.",
      "The time constant τ, pronounced 'tau', is resistance × capacitance. Use Ω and F so the result is in seconds. Separate practice: 4.7 kΩ × 10 µF = 4700 × 0.000010 = 0.047 s.",
      "After one time constant, about 37% of the starting voltage remains. After five, about 0.67% remains. Sketch a smooth falling curve; the capacitor does not suddenly reach zero at τ.",
      "This rule describes an isolated ideal resistor-capacitor loop. Extra loads and actual component values change the observed curve. You do not need to derive the exponential equation for this lesson.",
    ],
    formula: "τ = RC",
    href: "/courses/open-guard-mini/lessons/pull-resistors-floating-input",
    coverageNote: "Week 1 section 1.6 includes a separate isolated-RC example and a discharge-curve drawing task. Revisit that stage before applying it to the OFF path.",
  },
  R7: {
    id: "R7",
    title: "Low-pass and high-pass depend on the output",
    body: [
      "First name the input, output and common return. A filter changes which rates of signal variation reach the output. 'Low' and 'high' refer to frequency, not simply to a low or high voltage.",
      "In a simple unloaded RC low-pass, the input goes through a series resistor and the output is measured across a capacitor to return. Slow changes and steady DC can remain at the output; rapid changes are reduced.",
      "In a simple unloaded RC high-pass, the input goes through a series capacitor and the output is measured across a resistor to return. Changing signals can pass; steady DC falls away after settling.",
      "C1 bulk support and the local IC bypass capacitors have power-supply jobs. Do not assign the whole supply network one simple signal-filter cutoff just because it contains capacitors. The later sensor-filter lesson is still being developed.",
    ],
    href: "/courses/open-guard-mini/lessons/pull-resistors-floating-input",
    coverageNote: "Week 1 section 1.6 compares two named RC connections with separate input/output diagrams. The later DrawerSense sensing and filter design in 2.2 is still in preparation.",
  },
  R8: {
    id: "R8",
    title: "Gates decide; counters track cycles",
    body: [
      "A digital signal has two defined states. AND is true only when both required conditions are true. NOT reverses a binary condition. A truth table lists every input combination.",
      "An oscillator produces repeating cycles. A counter counts those cycles. Together they can track a wait, while reset clears the count. The detailed timing circuit belongs to a later lesson.",
      "A transistor can switch a circuit path. A BJT uses base current; a MOSFET responds to gate-to-source voltage. Real drive limits and pinouts matter, but choosing those later parts is not required to draw today's five-function map.",
    ],
    href: "/courses/open-guard-mini/lessons/logic-gates-truth-tables",
    coverageNote: "Week 1 section 1.7 covers logic and introduces the jobs of clocks, counters and transistor switches. Component selection and the later timing/driver designs remain draft material.",
  },
};

const lessonRecallIds: Record<LessonId, RecallId[]> = {
  "2.0A": ["R1"],
  "2.0B": ["R1", "R8"],
  "2.1A": ["R1", "R3"],
  "2.1B": ["R2", "R3"],
  "2.1C": ["R4", "R5", "R7"],
  "2.1D": ["R4", "R5"],
  "2.1E": ["R3", "R4", "R6"],
  "2.1F": ["R1", "R2", "R3"],
};

export function getLessonRecall(id: LessonId): RecallCard[] {
  return (lessonRecallIds[id] ?? []).map((recallId) => recallCards[recallId]);
}

const voltageUnits = [
  { label: "V", value: "V", multiplier: 1 },
  { label: "mV", value: "mV", multiplier: 0.001 },
];
const currentUnits = [
  { label: "mA", value: "mA", multiplier: 0.001 },
  { label: "A", value: "A", multiplier: 1 },
  { label: "µA", value: "uA", multiplier: 0.000001 },
];
const capacitanceUnits = [
  { label: "µF", value: "uF", multiplier: 0.000001 },
  { label: "nF", value: "nF", multiplier: 0.000000001 },
  { label: "F", value: "F", multiplier: 1 },
];
const timeUnits = [
  { label: "s", value: "s", multiplier: 1 },
  { label: "ms", value: "ms", multiplier: 0.001 },
];

export const drawerSenseLessons: Lesson[] = [
  {
    id: "2.0A",
    title: "What should DrawerSense do?",
    section: "2.0",
    summary: "Predict a useful reminder before choosing any components.",
    concept: [
      "DrawerSense should let someone open a drawer briefly without sounding. A continuous opening that reaches the target wait should start the reminder.",
      "Closing has two jobs: stop the reminder and reset the wait. Reopening starts a fresh interval. Separate short openings do not add together.",
      "Keep three controls distinct: the position sensor reports open or closed, the power switch supplies the circuit, and mute controls whether sound is allowed. When a timed reminder is active, muting suppresses the buzzer while the reminder light remains on. A physical opening and an electrically open contact are different descriptions.",
      "About 20 s is the product timing target. The diagram is an ideal behaviour model; actual timing must be measured later.",
    ],
    givens: [{ label: "Target wait in this exercise", value: "20 s" }],
    diagram: "2.0A",
    questions: [
      {
        id: "0A1",
        kind: "choice",
        prompt: "The drawer opens for 5 s, then closes. The target wait is 20 s. What should happen?",
        choices: ["Sound immediately", "Stay quiet and reset on closing", "Keep the 5 s for next time"],
        hint: "Compare the duration of this opening with the target, then consider what closing should reset.",
      },
      {
        id: "0A2",
        kind: "choice",
        prompt: "The drawer closes while the reminder is active, then opens again. What should happen?",
        choices: ["Stop and begin a new wait on reopening", "Keep sounding until power is switched off", "Resume from the previous elapsed time"],
        hint: "Closing has two jobs. Consider the reminder output and the elapsed wait separately.",
      },
    ],
    drawingTask: "Draw two horizontal tracks: drawer position and reminder output. Include a brief opening, a long opening, closing and reopening. Label 20 s as a target, not a measurement.",
    workChecklist: [
      "Label the time axis and both tracks.",
      "Show when the reminder starts and stops.",
      "Explain what resets when the drawer closes.",
    ],
    transfer: {
      id: "2.0AT",
      kind: "choice",
      prompt: "Now change the target to 15 s. Compare a 10 s opening and a separate continuous 18 s opening in the ideal model.",
      choices: ["Both stay quiet", "The first stays quiet; the second reaches the reminder", "Both remind immediately"],
      hint: "Start a fresh wait for each trial and compare each duration with the new target.",
    },
  },
  {
    id: "2.0B",
    title: "Give each function one job",
    section: "2.0",
    summary: "Separate the information chain from the supply and return paths.",
    concept: [
      "The reference has five jobs: ① Power, ② Sense, ③ Wait/reset, ④ Decide/mute and ⑤ Alert. Sense recognises opening; wait/reset tracks elapsed time; decide combines conditions; alert produces light and sound.",
      "The decision needs both 'still open' from Sense and 'time elapsed' from Wait/reset. An open-state signal by itself cannot say how long the drawer has been open.",
      "Information arrows describe signals. Each active subsystem also needs a supply connection and a return to the source. A functional map is a guide to these jobs, not a complete wiring schematic.",
      "This reference uses hardware logic, an oscillator/counter and transistors. A phone reads the printed QR link. You only need to explain each block's job at this stage; the detailed circuits come later.",
      "Week 1 develops the underlying ideas. Week 2 uses sketches, calculations and measurements to build working breadboard blocks and combine them. Week 3 takes the corrected circuit into a KiCad schematic, then a PCB layout.",
      "This learning sequence currently covers the system brief (2.0) and power block (2.1). Section 2.2 onward is a planned continuation, not completed lesson material or evidence of a working whole product.",
    ],
    diagram: "2.0B",
    questions: [
      {
        id: "0B1",
        kind: "choice",
        prompt: "Does the information chain mean the four active subsystems must be wired in series to the battery?",
        choices: ["Yes: the same wire must visit each box in order", "No: information flow and power wiring are different"],
        hint: "Which arrows describe information, and which connections must make a complete current path?",
      },
      {
        id: "0B2",
        kind: "choice",
        prompt: "Which statement describes the DrawerSense reference?",
        choices: ["An MCU is required to read the printed QR code", "The phone reads the QR code; the reminder uses hardware logic"],
        hint: "Separate the printed link from the circuit that creates the reminder.",
      },
    ],
    drawingTask: "Draw ① Power above ② Sense, ③ Wait/reset, ④ Decide/mute and ⑤ Alert. Show the signal routes, including Sense to Decide, and annotate the common supply and return separately.",
    workChecklist: [
      "Give each of the five blocks one clear job.",
      "Show both 'still open' and 'time elapsed' entering the decision.",
      "Label supply and return as a pair of power connections.",
    ],
    transfer: {
      id: "2.0BT",
      kind: "choice",
      prompt: "Why does the system need the wait/reset function?",
      choices: ["An open-state signal alone does not tell elapsed time", "It supplies all other blocks in series", "It reads the printed QR link"],
      hint: "Consider how the system distinguishes a 5 s opening from a 25 s opening.",
    },
  },
  {
    id: "2.1A",
    title: "A switch gives the source a path",
    section: "2.1",
    summary: "Trace the source and return in both stable switch positions.",
    concept: [
      "A conducting switch contact is electrically closed. An open contact breaks that route, although voltage can still exist across the gap. Current through a load requires a complete return path.",
      "VCC names the switched positive supply rail: points joined to that supply connection. GND is the common return and the reference for these voltage measurements. Here, GND means the circuit return; it does not require a connection to Earth.",
      "The reference switch is SPDT: single pole, double throw. One moving common contact selects one of two other contacts. For the specified C&K JS102011CQN, common is terminal 2; it connects to terminal 1 or terminal 3.",
      "Confirm the actual switch and drawing view with its datasheet and a power-off continuity test. Neither a generic picture nor the lever direction proves which terminals are connected.",
      "Connect terminal 1 to source positive, terminal 2 to the switched VCC rail, and terminal 3 through R17 to GND. The ON state feeds VCC; the OFF state disconnects the source and gives stored rail charge a resistor-limited discharge route.",
      "The product reference uses a nominal 3 V primary CR2 cell. Start practical work with a tutor-approved current-limited 3.0 V bench source in place of the battery; never connect the two sources together. The reference includes no charger or boost converter. Do not charge the primary cell or substitute a different supply without review.",
    ],
    givens: [
      { label: "Reference switch", value: "JS102011CQN, SPDT ON–ON" },
      { label: "R17", value: "1 kΩ" },
      { label: "Bench source", value: "3.0 V, current limit set by tutor" },
    ],
    diagram: "2.1A",
    questions: [
      {
        id: "1A1",
        kind: "choice",
        prompt: "In the specified JS102011CQN reference symbol, which terminal is common?",
        choices: ["1", "2", "3"],
        hint: "Find the moving electrical contact, then read its terminal number.",
      },
      {
        id: "1A2",
        kind: "choice",
        prompt: "In the board OFF state, which route is correct?",
        choices: ["Battery positive directly to ground", "Rail through R17 to ground, with the battery feed disconnected", "All three terminals joined"],
        hint: "Trace stored rail charge through the limiting resistor while leaving a gap to source positive.",
      },
    ],
    drawingTask: "Draw both stable switch states using the same terminal positions: 1 = source positive, 2 = VCC, 3 = R17 to GND. Label the source return and the selected route in each state.",
    workChecklist: [
      "Keep the terminal numbering and drawing view consistent.",
      "Trace ON from source, through the load, back to the source.",
      "Show the disconnected source feed and resistor-limited route in OFF.",
    ],
    transfer: {
      id: "2.1AT",
      kind: "choice",
      prompt: "How can an ON–ON switch act as the board's ON–OFF control?",
      choices: ["Wire one throw to the source and the other to the rail discharge path", "A third terminal automatically means there is a middle OFF position"],
      hint: "The board behaviour depends on what each of the two selected routes connects to.",
    },
  },
  {
    id: "2.1B",
    title: "Series and parallel are connections",
    section: "2.1",
    summary: "Use shared endpoint nodes to calculate voltage and source current.",
    concept: [
      "A node is one continuously connected conductor. Components drawn close together need not share a node. Follow their actual endpoints.",
      "Series elements share an unbranched route, so the same current passes through them. Parallel branches connect across the same two nodes, so they share the same voltage; their currents can differ.",
      "The source current is the sum of the branch currents. The exercise currents below are supplied assumptions, not measurements of DrawerSense.",
      "Measure voltage across two nodes with a voltmeter: black lead at GND and red lead at VCC, with the correct meter setting. Never connect an ammeter directly across the supply.",
    ],
    givens: [
      { label: "Maintained ideal supply", value: "3 V" },
      { label: "Branch current I₁", value: "2 mA" },
      { label: "Branch current I₂", value: "3 mA" },
    ],
    formula: "Iₛ = I₁ + I₂",
    diagram: "2.1B",
    questions: [
      {
        id: "1B1",
        kind: "numeric",
        prompt: "Two ideal loads connect across the same 3 V rail and GND. What voltage is across each load?",
        quantity: "Voltage across each load",
        units: voltageUnits,
        precision: "Enter one voltage value that applies to each load, then choose its unit.",
        hint: "Find the two endpoint nodes of each branch. Voltage is the difference between those nodes.",
      },
      {
        id: "1B2",
        kind: "numeric",
        prompt: "The two steady branch currents are 2 mA and 3 mA. Calculate the total source current.",
        quantity: "Source current",
        units: currentUnits,
        precision: "A value in mA or an equivalent value in A or µA is accepted.",
        hint: "Apply conservation of current at the junction and keep the unit consistent.",
      },
    ],
    drawingTask: "Draw two loads between VCC and GND. Add a voltmeter across these nodes, a source-current arrow and two branch-current arrows. Show your source-current calculation.",
    workChecklist: [
      "Trace the same two endpoint nodes for both loads.",
      "Label voltage in V and current in A or mA.",
      "Place the voltmeter across the rails; do not put an ammeter there.",
    ],
    transfer: {
      id: "2.1BT",
      kind: "numeric",
      prompt: "One parallel load is disconnected while the ideal source still maintains 3 V. What voltage remains across the other load?",
      quantity: "Remaining branch voltage",
      units: voltageUnits,
      precision: "Enter a value and a voltage unit.",
      hint: "Trace the remaining load's endpoints after removing the other branch.",
    },
  },
  {
    id: "2.1C",
    title: "Capacitors need a job and a location",
    section: "2.1",
    summary: "Distinguish bulk support, local bypass, capacitance and voltage rating.",
    concept: [
      "A capacitor stores separated charge on two conducting plates with an insulator between them. The relation Q = CV connects charge in coulombs, capacitance in farads and voltage in volts. Open the charge refresher if this relation is new.",
      "Bulk support means supplying some charge when the load briefly asks for extra current. C1 connects across VCC and GND for this job. Its stored charge is finite, so it cannot hold the voltage perfectly or support extra current indefinitely.",
      "C1 is polarised: connect its positive end to VCC and negative end to GND. Identify polarity from the actual component markings and datasheet before power. An illustration is not proof of the markings on your part.",
      "The selected C1 is 100 µF, rated 6.3 V, with ±20% capacitance tolerance. The source establishes the operating rail voltage. A component's voltage rating is a limit, not a voltage generator.",
      "An IC is an integrated circuit, a chip with several circuit functions inside. C2, C3 and C4 are 100 nF local bypass capacitors. Each provides a short nearby path for brief current changes at its own IC supply and return pins. Placement matters even when the schematic shows shared nodes.",
      "A signal filter needs a named input, output and surrounding network. Review the separate low-pass and high-pass refresher examples before comparing their jobs with bulk support and local bypass.",
    ],
    givens: [
      { label: "C1 bulk capacitor", value: "100 µF, ±20%, rated 6.3 V, polarised" },
      { label: "C2, C3 and C4", value: "100 nF each, local to their ICs" },
      { label: "Nominal rail", value: "3 V" },
    ],
    formula: "Q = CV",
    diagram: "2.1C",
    questions: [
      {
        id: "1C1",
        kind: "choice",
        prompt: "Where does the polarised C1 connect?",
        choices: ["Positive to VCC and negative to GND, in parallel", "In series with every load", "Either direction because the rail is low voltage"],
        hint: "Check both capacitor endpoints and its polarity.",
      },
      {
        id: "1C2",
        kind: "choice",
        prompt: "What does the selected capacitor's 6.3 V marking mean?",
        choices: ["It forces the rail to 6.3 V", "It is the capacitor's rated voltage, not the rail setpoint"],
        hint: "Separate the component's operating limit from the voltage supplied to it.",
      },
    ],
    drawingTask: "Add C1 across VCC and GND, with its polarity, capacitance and voltage rating. Add three local 100 nF capacitors beside their IC supply connections. Label each capacitor's job.",
    workChecklist: [
      "Place C1 in parallel with the supply and label its positive end.",
      "Keep the capacitance and voltage-rating labels separate.",
      "Show a short bypass path beside each IC.",
    ],
    transfer: {
      id: "2.1CT",
      kind: "choice",
      prompt: "Where should each local bypass capacitor be placed physically?",
      choices: ["All together beside the battery", "Near its own IC supply and return pins"],
      hint: "Consider the length of the small current loop each bypass capacitor supports.",
    },
  },
  {
    id: "2.1D",
    title: "Turn a voltage-change limit into capacitance",
    section: "2.1",
    summary: "Calculate with units, then check the capacitor's tolerance minimum.",
    concept: [
      "Droop means a fall in the supply voltage. In this model, the capacitor alone supplies a constant extra current during a short pulse. The current, pulse duration and allowed voltage fall are exercise assumptions, not a measured result.",
      "Δ means 'change in'. For constant current, transferred charge is ΔQ = IΔt. A capacitor's charge change is ΔQ = CΔV. Both expressions describe the same charge, so CΔV = IΔt. Divide by the largest allowed ΔV to find the minimum C.",
      "For a known capacitance, divide CΔV = IΔt by C to get ΔV = IΔt/C. A smaller capacitance gives a larger voltage drop for the same pulse.",
      "Convert quantities before substituting: 1 mA = 0.001 A, 1 ms = 0.001 s and 1 µF = 0.000001 F. Keep units beside each line and round the final result rather than every intermediate step.",
      "Separate rehearsal: 10 mA for 1 ms with a 0.20 V limit needs C = (0.010 × 0.001)/0.20 = 0.000050 F = 50 µF in the ideal model. The assessed task uses different current and voltage-limit values; do that calculation yourself.",
      "A 100 µF ±20% capacitor can be as low as 80 µF. Use that minimum for the largest voltage fall in this model. A real capacitor and supply also have internal resistance, and real current pulses can have a different shape. Test the actual voltage change before relying on the design.",
    ],
    givens: [
      { label: "Extra pulse current I", value: "20 mA" },
      { label: "Pulse duration Δt", value: "1 ms" },
      { label: "Maximum ideal droop ΔVmax", value: "0.30 V" },
      { label: "Selected C1", value: "100 µF ±20%; minimum 80 µF" },
    ],
    formula: "C ≥ IΔt / ΔVmax    ·    ΔV = IΔt / C",
    diagram: "2.1D",
    questions: [
      {
        id: "1D1",
        kind: "numeric",
        prompt: "For 20 mA over 1 ms, calculate the minimum ideal capacitance that limits the voltage drop to 0.30 V.",
        quantity: "Minimum ideal capacitance",
        units: capacitanceUnits,
        precision: "Use 2–3 significant figures. Equivalent units are accepted.",
        hint: "Convert mA to A and ms to s. Divide the transferred charge by the allowed voltage change.",
      },
      {
        id: "1D2",
        kind: "numeric",
        prompt: "Use C1's minimum actual capacitance of 80 µF. Calculate the ideal voltage drop for the same 20 mA, 1 ms pulse.",
        quantity: "Ideal voltage drop",
        units: voltageUnits,
        precision: "Use 2–3 significant figures. Compare your result with 0.30 V in your working.",
        hint: "Use ΔV = IΔt/C with the tolerance minimum, converted from µF to F.",
      },
    ],
    drawingTask: "List the given quantities and SI conversions. Calculate the minimum capacitance and the droop at 80 µF. Compare with 0.30 V, explain the ideal model, and name one real measurement still needed.",
    workChecklist: [
      "Show the equation, substituted values and units for each calculation.",
      "Use the minimum actual capacitance when checking the retained C1.",
      "State whether this exercise envelope passes, and distinguish prediction from measurement.",
    ],
    transfer: {
      id: "2.1DT",
      kind: "numeric",
      prompt: "Increase only the extra current to 30 mA for 1 ms. With 80 µF actual capacitance, calculate the ideal voltage drop, then compare it with the 0.30 V limit.",
      quantity: "Voltage drop at the stronger pulse",
      units: voltageUnits,
      precision: "Use 3 significant figures. Keep C and Δt unchanged.",
      conclusion: {
        prompt: "What does your calculated drop mean for the 0.30 V limit?",
        choices: ["Within the 0.30 V limit", "Above the 0.30 V limit"],
      },
      hint: "Recalculate IΔt/C using the new current. More current removes more charge in the same time.",
    },
  },
  {
    id: "2.1E",
    title: "What happens after OFF?",
    section: "2.1",
    summary: "Predict initial discharge current and the short power-rail time constant.",
    concept: [
      "Immediately after OFF, the source feed is disconnected but C1 still stores charge. Trace the selected discharge loop from C1 through R17 and back to C1. The battery lies outside this loop.",
      "In I₀ = V₀/R, the small 0 means 'at the start'. Use the capacitor's starting voltage V₀ and the resistor value R to find starting current I₀. As voltage falls, current falls too; it is not a constant drain from the disconnected battery.",
      "For an isolated RC discharge, the time constant τ (tau) is R × C. Use resistance in Ω and capacitance in F to obtain seconds. The RC refresher demonstrates this multiplication with different values.",
      "After one time constant about 37% of the initial voltage remains; after five, less than 1% remains. Draw a smooth falling curve. You do not need to derive an exponential equation to explain this behaviour.",
      "This short discharge interval serves a different job from the approximately 20 s reminder timer. Loads, other capacitors and tolerances affect the real board. Follow the retained supervised 2 s OFF wait for startup checks; a slow multimeter may miss the transition.",
    ],
    givens: [
      { label: "Initial capacitor voltage V₀", value: "3 V" },
      { label: "OFF resistor R17", value: "1 kΩ" },
      { label: "Nominal C1", value: "100 µF" },
      { label: "Model", value: "Isolated R17–C1 discharge; source disconnected" },
    ],
    formula: "I₀ = V₀ / R    ·    τ = RC",
    diagram: "2.1E",
    questions: [
      {
        id: "1E1",
        kind: "numeric",
        prompt: "C1 starts at 3 V and R17 is 1 kΩ. Calculate the initial discharge current through R17.",
        quantity: "Initial discharge current",
        units: currentUnits,
        precision: "Enter a value and current unit. Remember that this is the initial current.",
        hint: "Convert kΩ to Ω, then divide initial voltage by resistance.",
      },
      {
        id: "1E2",
        kind: "numeric",
        prompt: "For 1 kΩ and 100 µF, calculate the nominal isolated RC time constant.",
        quantity: "RC time constant",
        units: timeUnits,
        precision: "Use 2 significant figures if helpful; trailing zeros are optional.",
        hint: "Convert resistance to Ω and capacitance to F, then multiply R by C.",
      },
    ],
    drawingTask: "Draw C1 and R17 as a discharge loop with the source disconnected. Show both calculations and sketch voltage falling smoothly. Mark one time constant and explain why it is not the reminder delay.",
    workChecklist: [
      "Keep the source outside the selected OFF loop.",
      "Show the current and time-constant calculations with units.",
      "Label the remaining voltage after one time constant and explain the model's limits.",
    ],
    transfer: {
      id: "2.1ET",
      kind: "choice",
      prompt: "If only the OFF resistor doubles, what does the isolated model predict?",
      choices: ["Double the time constant and halve the initial current", "Halve the time constant and double the initial current", "Neither quantity changes"],
      hint: "Compare where R appears in τ = RC and I₀ = V₀/R.",
    },
  },
  {
    id: "2.1F",
    title: "Prove the power block at the bench",
    section: "2.1",
    summary: "Match the drawn nodes to the real board and record physical evidence.",
    concept: [
      "A breadboard's hidden metal strips define its nodes. Long rails may be split, and the centre trench separates the two sides. With power removed, map continuity before assuming coloured rail markings mean a continuous conductor.",
      "Build the checked switch, R17 and C1 with a tutor-approved test load first. Verify switch contacts, source polarity and capacitor polarity. Add each logic IC and its local bypass capacitor only when its connections have been checked; the tutor must ensure unused logic inputs have a defined electrical state before power.",
      "The tutor sets the regulated 3.0 V source and a suitable current limit. Measure VCC relative to GND near the source and at the far end. Unexpected current limiting, warmth or collapsed voltage means disconnect power and ask the tutor to inspect the build.",
      "Record real readings, the corrected diagram, switch continuity and a clear board photograph. Agree an OFF-observation method with the tutor; a fast transient may need an oscilloscope. Fit the primary CR2 only after supervised checks, and never charge it. Online completion cannot certify the physical build: human inspection and measurement sign-off are required before sensing.",
    ],
    givens: [
      { label: "Supervised source setting", value: "3.0 V" },
      { label: "Current limit", value: "Chosen and recorded with the tutor" },
      { label: "Fault example only", value: "Near rail 3.0 V; far rail 0 V" },
    ],
    diagram: "2.1F",
    questions: [
      {
        id: "1F1",
        kind: "choice",
        prompt: "The source end reads 3.0 V but the far rail reads 0 V. After switching power off, what should you check first?",
        choices: ["Whether the breadboard rail is split or a jumper is missing", "Whether a bigger battery makes it work", "Whether removing R17 fixes everything"],
        hint: "Check the conductor between the two probe positions with power removed.",
      },
      {
        id: "1F2",
        kind: "choice",
        prompt: "A part warms unexpectedly during the power-stage test. What should you do?",
        choices: ["Continue to collect data", "Disconnect power and ask the tutor to inspect the wiring", "Use a higher current limit"],
        hint: "Treat an unexpected symptom as a stop condition before collecting more readings.",
      },
    ],
    drawingTask: "Record the source and tutor-chosen current limit, near- and far-rail voltages, switch continuity states and OFF-observation method. Keep the corrected circuit and board photograph for the live tutor review. Do not invent measurements.",
    workChecklist: [
      "Record actual settings and readings, with units and probe locations.",
      "Keep the switch continuity record and a clear board photograph.",
      "Identify work still awaiting tutor inspection and physical sign-off.",
    ],
    transfer: {
      id: "2.1FT",
      kind: "choice",
      prompt: "Can a correct online quiz certify an actual breadboard build?",
      choices: ["Yes, automatically", "No; physical inspection and measurements are still required"],
      hint: "A quiz evaluates your answer. Consider what evidence is needed for the actual wires and components.",
    },
  },
];

export function getDrawerSenseLesson(id: string): Lesson | undefined {
  return drawerSenseLessons.find((lesson) => lesson.id === id);
}
