export type LessonSection = {
  stepId?: string;
  diagramId?: string;
  formativeCheckIds?: string[];
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LessonDiagram = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
};

export type ChoiceLessonQuiz = {
  kind: "choice";
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
  incorrectFeedback?: string;
  method: string[];
  explanation: string;
};

export type NumericLessonQuiz = {
  kind: "numeric";
  id: string;
  question: string;
  answer: number;
  tolerance: number;
  unit: string;
  placeholder: string;
  hint: string;
  incorrectFeedback?: string;
  method: string[];
  explanation: string;
};

export type LessonQuiz = ChoiceLessonQuiz | NumericLessonQuiz;

export type TutorGuidance = {
  hint: string;
  simpleExplanation: string;
  measurementPrompt: string;
};

export type LessonVideo = {
  videoSrc?: string;
  webmSrc?: string;
  posterSrc?: string;
  resourceKey?: string;
  protectedVideoSrc?: string;
  caption: string;
};

export type Lesson = {
  slug: string;
  section: string;
  title: string;
  duration: string;
  delivery: "Induction" | "Pre-recorded" | "Live checkpoint";
  summary: string;
  objectives: string[];
  sections: LessonSection[];
  checkpointAfterStepId?: string;
  checkpointTask?: string;
  practicalTask: string;
  video: LessonVideo;
  diagram?: LessonDiagram;
  quiz: LessonQuiz;
  microChecks?: ChoiceLessonQuiz[];
  tutor: TutorGuidance;
  humanReviewRequired?: boolean;
};

export type Course = {
  slug: string;
  title: string;
  shortTitle: string;
  theme: string;
  status: "Working" | "Upcoming" | "Planned";
  level: string;
  ageRange: string;
  duration: string;
  description: string;
  outcome: string;
  projectHref: string;
  lessons: Lesson[];
};

const openGuardMiniCourse: Course = {
  slug: "open-guard-mini",
  title: "DrawerSense Mini: Electronics Product Design Foundations",
  shortTitle: "DrawerSense Mini",
  theme: "Smart living",
  status: "Working",
  level: "Foundation pathway",
  ageRange: "Recommended F4-F5 / ages 14-16",
  duration: "Three-week programme · lessons released in stages",
  description:
    "Learn to investigate an electronic product as a system, build reliable circuit reasoning and prove logic before the later breadboard and KiCad stages.",
  outcome:
    "A reviewed Week 1 system definition: requirement, input-process-output model, safety evidence, sensor states, pull-resistor choices and Boolean logic.",
  projectHref: "/projects/open-guard-mini",
  lessons: [
    {
      slug: "induction-readiness",
      section: "0",
      title: "School induction and readiness check",
      duration: "90-120 min live or school-approved recording",
      delivery: "Induction",
      summary:
        "Understand the programme, the honest product boundary, safety expectations, evidence requirements and how the online lessons connect to the practical workshop.",
      objectives: [
        "Describe the three-week learning journey and what evidence learners will create.",
        "Recognise that DrawerSense Mini is a removable reminder, not a lock or certified security device.",
        "Know how to ask the teacher for the approved induction recording when the live session was missed.",
      ],
      sections: [
        {
          heading: "Complete this before Section 1",
          paragraphs: [
            "Your school begins the programme with a 1.5-2 hour induction delivered live, online or through a school-approved recording. It introduces the project, safety boundaries, learning platform, assessment evidence and practical-work expectations.",
            "The short public animation shows the idea, but it does not replace the induction. If you have not attended or watched the approved recording, stop here and ask your teacher or programme coordinator for access.",
          ],
          bullets: [
            "Battery-powered extra-low-voltage work only.",
            "No mains wiring, motorised lock or lithium charging in the foundation project.",
            "AI can give hints, but a human owns safety, practical approval and manufacturing decisions.",
          ],
        },
      ],
      practicalTask:
        "Write down the name of your teacher or programme contact and where your school stores the induction recording and workshop schedule.",
      video: {
        resourceKey: "section-0-school-induction-video",
        posterSrc:
          "/images/projects/open-guard-mini/open-guard-concept-poster.webp",
        caption:
          "Reserved for the 1.5-2 hour school induction recording. The page deliberately remains usable before that recording is uploaded.",
      },
      diagram: {
        src: "/images/projects/open-guard-mini/open-guard-system-map.webp",
        alt: "Foundation input, process and output system map for the DrawerSense Mini course",
        width: 1995,
        height: 656,
        caption:
          "The induction introduces the complete system at block level without revealing every final design answer.",
      },
      quiz: {
        kind: "choice",
        id: "open-guard-induction-ready",
        question:
          "Have you attended the school induction or watched the school-approved recording?",
        options: [
          "Yes - I have completed the induction",
          "Not yet - I need the live session or recording",
        ],
        correctIndex: 0,
        hint:
          "The public project preview is not the full induction. Think about whether your teacher has explained safety, the course journey and the evidence you must submit.",
        incorrectFeedback:
          "Stop here and ask your teacher or programme coordinator for the induction recording or the next live induction session. Section 1 should begin only after that preparation.",
        method: [
          "Confirm that you attended the live induction or watched the school-approved recording.",
          "Keep the teacher contact, workshop date and safety instructions available.",
        ],
        explanation:
          "The induction is the shared starting point for the online lessons and the practical workshop. It prevents students from entering technical tasks without the project boundary and safety context.",
      },
      tutor: {
        hint:
          "Ask what part of the induction you completed: programme overview, safety, evidence, practical schedule or platform use.",
        simpleExplanation:
          "Section 0 makes sure everyone starts with the same expectations before technical lessons begin.",
        measurementPrompt:
          "No electrical measurement is required in Section 0. Ask the teacher before handling powered hardware.",
      },
      humanReviewRequired: true,
    },
    {
      slug: "user-need-engineering-requirement",
      section: "1.1",
      title: "From a user need to an engineering requirement",
      duration: "6 min video + 8 min activity",
      delivery: "Pre-recorded",
      summary:
        "Turn a vague user idea into behaviour and constraints that can be checked by a pass/fail test.",
      objectives: [
        "Distinguish a user need, engineering requirement, feature and non-goal.",
        "Replace vague words with a state, condition, timing, dimension or observable result.",
        "Write testable DrawerSense Mini requirements without choosing component values too early.",
        "State honest product boundaries without claiming locking, theft prevention or security certification.",
      ],
      sections: [
        {
          heading: "Why vague ideas fail",
          paragraphs: [
            "Engineers cannot design from a sentence such as 'make it smart'. A useful requirement states when the product acts, what it must do and how the result can be checked.",
            "A user need explains why the product should exist. It is written in human language before component names are introduced.",
          ],
        },
        {
          heading: "Four statement types",
          paragraphs: [
            "Need: the human problem. Requirement: testable behaviour or constraint. Feature: added value that is not always part of the minimum purpose. Non-goal: a deliberate boundary or unsupported claim that the product does not make.",
          ],
        },
        {
          heading: "Worked transfer example",
          paragraphs: [
            "For a bicycle light, the need is to find the bicycle in a dark garage. A requirement is that the light turns on when a button is pressed. A feature is that it stays on for 20 seconds. A non-goal is GPS tracking.",
            "Exact resistor and capacitor values are later design choices, not user requirements.",
          ],
        },
        {
          heading: "Transfer to DrawerSense Mini",
          paragraphs: [
            "The user wants a reminder when a drawer remains open beyond an agreed target wait. A brief opening should stay quiet; closing should stop the reminder and reset the wait. These behaviours can be tested before choosing component values.",
            "DrawerSense Mini is a reminder. It does not physically lock a drawer, prevent theft or claim security certification. A sound-mute control is separate from switching the whole circuit off.",
          ],
        },
      ],
      practicalTask:
        "Rewrite 'make a cool door gadget' as three testable requirements and one honest non-goal. Each requirement must contain a state, condition, dimension, timing or observable pass/fail result.",
      video: {
        resourceKey: "lesson-1-1-user-need-engineering-requirement-video",
        posterSrc:
          "/images/projects/open-guard-mini/lessons/lesson-1-1-input-process-output.webp",
        caption:
          "Record this as one concise concept video. The reasoning is revealed inside the same lesson after correct micro-check answers; do not create a separate solution video.",
      },
      diagram: {
        src: "/images/projects/open-guard-mini/lessons/lesson-1-1-input-process-output.webp",
        alt: "Transformation from the vague phrase make it smart to a testable engineering requirement",
        width: 1000,
        height: 560,
        caption:
          "Ask when the product acts, what it must do and how the result will be tested. Keep the statement observable, testable and honest about the product boundary.",
      },
      quiz: {
        kind: "choice",
        id: "open-guard-1-1-requirement",
        question: "For a practice alert design, which statement is an engineering requirement?",
        options: [
          "The product should look impressive.",
          "The output shall stay off while the unit is disarmed.",
          "The enclosure should look modern.",
          "Choose a specific resistor before comparing alternatives.",
        ],
        correctIndex: 1,
        hint: "Ask which statement can be checked with a pass/fail test.",
        method: [
          "Look for observable behaviour rather than appearance or an early component choice.",
          "Set the unit to disarmed, create the opening condition and observe whether the output stays off.",
        ],
        explanation:
          "The disarmed-output statement is functional and testable. 'Impressive' and 'modern' do not define a pass/fail test here; choosing a component is a later design action.",
      },
      microChecks: [
        {
          kind: "choice",
          id: "open-guard-1-1-requirement",
          question: "For a practice alert design, which statement is an engineering requirement?",
          options: [
            "The product should look impressive.",
            "The output shall stay off while the unit is disarmed.",
            "The enclosure should look modern.",
            "Choose a specific resistor before comparing alternatives.",
          ],
          correctIndex: 1,
          hint: "Ask which statement can be checked with a pass/fail test.",
          method: [
            "Look for observable behaviour rather than appearance or an early component choice.",
            "Set the unit to disarmed, create the opening condition and observe whether the output stays off.",
          ],
          explanation:
            "The disarmed-output statement is functional and testable. 'Impressive' and 'modern' do not define a pass/fail test here; choosing a component is a later design action.",
        },
        {
          kind: "choice",
          id: "open-guard-1-1-claim-boundary",
          question: "Why should 'prevents theft' not be a Course 1 requirement?",
          options: [
            "Because students are not allowed to use buzzers.",
            "Because the device does not physically secure property and is not certified as a security product.",
            "Because theft prevention always requires Wi-Fi.",
            "Because requirements cannot describe real-life use.",
          ],
          correctIndex: 1,
          hint: "Ask whether an alert can physically stop a person opening a door and whether the product has been security-certified.",
          method: [
            "Separate an alert from a physical lock or access-control system.",
            "Make only claims that the prototype and course evidence can demonstrate responsibly.",
          ],
          explanation:
            "DrawerSense Mini can remind a user, but it does not stop entry, secure property or meet a security certification standard.",
        },
        {
          kind: "choice",
          id: "open-guard-1-1-installation",
          question: "Which statement is a measurable installation requirement?",
          options: [
            "The product shall be easy to install.",
            "The enclosure shall look tidy.",
            "The magnet shall operate within the validated maximum gap stated in millimetres in the installation guide.",
            "The product shall work anywhere.",
          ],
          correctIndex: 2,
          hint: "Look for a gap, dimension, power condition, attachment method or another observable pass/fail category.",
          method: [
            "Replace subjective words such as easy, tidy or anywhere with a measurable condition.",
            "Use the validated gap value and a stated unit so installation can be checked.",
          ],
          explanation:
            "A maximum operating gap stated in millimetres creates a measurable installation test. The exact number should come from prototype validation rather than being invented before testing.",
        },
      ],
      tutor: {
        hint:
          "Ask whether the statement can be tested pass/fail, whether the product can physically support the claim, and whether a number, state or observable result can be added.",
        simpleExplanation:
          "A need explains why. A requirement says what must happen and how we can check it. A feature adds value. A non-goal says what the product does not promise.",
        measurementPrompt:
          "No electrical measurement is required yet. Use prototype evidence later to set any timing or installation number rather than inventing it now.",
      },
    },
    {
      slug: "safety-complete-circuit",
      section: "1.2",
      title: "Safety and the complete circuit loop",
      duration: "Self-paced concept and drawing practice",
      delivery: "Pre-recorded",
      summary:
        "Identify a complete source-load-return path and apply the course safety routine before moving wires or using a meter.",
      objectives: [
        "Trace conventional current through a complete low-voltage loop.",
        "Explain why an open return path stops continuous current.",
        "Trace connected nodes and distinguish a physical switch from its electrical contact state.",
        "Apply the power-off, compare, check and power-on routine.",
      ],
      sections: [
        {
          diagramId: "complete-loop",
          heading: "Current needs a return path",
          paragraphs: [
            "A component does not work simply because one lead touches a battery. Current requires a complete path from the source, through the load and back to the source.",
            "An open gap breaks the loop. Voltage may still exist across the gap even though current through the open path is approximately zero.",
          ],
          bullets: [
            "Use only the tutor-approved extra-low-voltage source. The supervised bench supply and battery are alternatives, never connected together.",
            "Power off before rewiring or using continuity/resistance mode.",
            "Never place a meter in current mode directly across the battery.",
          ],
        },
        {
          heading: "Trace a node before naming a connection",
          paragraphs: [
            "A node is a set of points joined by conducting wire with no component between them. In this ideal circuit model those points have the same voltage. Follow the whole conductor, not just one dot on the drawing.",
            "A wire crossing is not a connection unless the drawing marks a junction. On a breadboard, hidden metal strips determine which holes connect; the printed red or blue line is not proof that an entire rail is continuous.",
          ],
          bullets: [
            "On paper, highlight each continuously connected node in a different colour and also give it a letter.",
            "On the real board, remove power before the tutor-approved continuity check.",
          ],
        },
        {
          heading: "A switch picture is not a continuity result",
          paragraphs: [
            "The actuator is the part you move; the terminals connect to wires. A closed electrical contact conducts, while an open contact breaks that route. A physically closed drawer and a closed contact are separate descriptions.",
            "Keep the source, load and return in the same positions in two sketches, then change only the switch contact. A real part's contact numbering must come from its exact datasheet and a power-off continuity test, not from guessed lever direction or a generic photograph.",
          ],
        },
        {
          heading: "Pause and trace before the check",
          paragraphs: [
            "Make your own drawing first. Point to every segment of the loop and predict what changes when one contact opens. Keep this attempt for your tutor; the multiple-choice check is only one part of the evidence.",
          ],
          bullets: [
            "Draw the source, switch, resistor load and return as one complete loop.",
            "Copy it with one contact open. Mark the gap without moving the other parts.",
            "Write one sentence distinguishing a voltage between points from current through a path.",
          ],
        },
      ],
      practicalTask:
        "Before answering, draw closed-contact and open-contact versions of one source-switch-resistor-return loop. Label its nodes, trace the current path and explain where the route stops. Keep the drawing for the Week 1 review.",
      video: {
        resourceKey: "lesson-1-2-complete-circuit-video",
        posterSrc:
          "/images/projects/open-guard-mini/lessons/lesson-1-2-complete-circuit.webp",
        caption:
          "Use an unpowered diagram for the fault. Never demonstrate a deliberate battery short.",
      },
      diagram: {
        src: "/images/projects/open-guard-mini/lessons/lesson-1-2-complete-circuit.webp",
        alt: "Complete source, load and return circuit loop",
        width: 760,
        height: 428,
        caption:
          "A complete path is required: source to load and back to the source.",
      },
      quiz: {
        kind: "choice",
        id: "open-guard-1-2-loop",
        question:
          "A battery, resistor and LED are connected in one line, but the final LED lead is not connected back to the battery. Will the LED light continuously?",
        options: [
          "Yes, because one LED lead touches the supply",
          "Yes, because voltage always means current is flowing",
          "No, because the missing return lead leaves an open circuit",
          "No, because every LED requires a microcontroller",
        ],
        correctIndex: 2,
        hint:
          "Trace a path from the positive terminal and ask whether you can return to the negative terminal without jumping a gap.",
        method: [
          "Start at the positive terminal.",
          "Trace through the resistor and LED.",
          "Notice that the route stops before returning to the negative terminal.",
        ],
        explanation:
          "The open end breaks the loop, so there is no continuous current path through the LED. Voltage and current are related but they are not the same statement.",
      },
      tutor: {
        hint:
          "Follow one continuous loop with your finger and identify the first physical gap.",
        simpleExplanation:
          "Electric charge must have a complete route around the circuit. One missing return wire stops the flow.",
        measurementPrompt:
          "For routine checks use DC voltage mode across two points. Current mode is teacher-led in this foundation stage.",
      },
    },
    {
      slug: "voltage-current-resistance",
      section: "1.3",
      title: "Voltage, current and resistance without memorising blindly",
      duration: "Self-paced quantities and connection practice",
      delivery: "Pre-recorded",
      summary:
        "Explain voltage, current and resistance, then use connected nodes to distinguish series and parallel circuits.",
      objectives: [
        "State voltage as potential difference between two nodes.",
        "State current as charge flow through a path.",
        "State resistance as opposition relating voltage and current, checked with power removed.",
        "Identify series and parallel connections from their endpoints rather than their position on the page.",
        "Add branch currents and place a voltmeter across the named nodes.",
      ],
      sections: [
        {
          heading: "Use circuit language",
          paragraphs: [
            "Voltage does not flow. A voltmeter compares two selected points. Current passes through a path and is measured in amperes. Resistance is measured in ohms, normally with circuit power removed.",
            "Placing the black probe at circuit ground is a convenient node-voltage reference, not a universal rule for every possible measurement.",
          ],
        },
        {
          diagramId: "series-circuit",
          formativeCheckIds: ["hll-f-13-series"],
          heading: "Series: one route through both elements",
          paragraphs: [
            "Draw two resistors one after the other in one complete loop. Their shared connection has no other branch, so the same current passes through both. The supply voltage is shared across the resistors; it is not necessarily shared equally.",
            "For a paper example with two equal ideal resistors across 4 V, each has 2 V across it. If the resistor values differ, the voltage shares differ. These are practice values, not a supply instruction for the DrawerSense board.",
          ],
        },
        {
          diagramId: "parallel-circuit",
          formativeCheckIds: ["hll-f-13-parallel"],
          heading: "Parallel: the same two endpoint nodes",
          paragraphs: [
            "Now draw an upper supply node and a lower return node. Connect each resistor between those same two nodes. Both branches have the same voltage across them, although their currents can differ.",
            "In a paper example with an ideal maintained 4 V source, each parallel branch has 4 V across it. Rotating or moving a resistor symbol on the page does not change this relationship if its endpoints stay the same.",
          ],
        },
        {
          formativeCheckIds: ["hll-f-13-current-sum"],
          heading: "Current entering a junction must leave it",
          paragraphs: [
            "Put one current arrow into the supply junction and one down each branch. In this model, source current equals the sum of the branch currents: Iₛ = I₁ + I₂.",
            "Separate rehearsal: 0.5 mA + 1.5 mA = 2 mA. This arithmetic example is not measured product consumption. A voltmeter goes across two nodes; a current measurement requires a checked series connection and tutor guidance.",
          ],
        },
        {
          stepId: "1-3-neither-topology",
          formativeCheckIds: ["hll-f-13-neither"],
          heading: "Some pairs are neither series nor parallel",
          paragraphs: [
            "Sharing one node does not automatically make two components series, because another branch may leave that node. Sharing only one endpoint also does not make them parallel; parallel components share both endpoint nodes.",
            "Trace every endpoint before choosing a label. A network can contain component pairs that meet neither simple definition.",
          ],
        },
        {
          heading: "Draw the endpoints before choosing an answer",
          paragraphs: [
            "Prepare the series and parallel sketches below, then use the online check to confirm the quantity and meter language. The check does not automatically assess your node drawing.",
          ],
          bullets: [
            "Label the series shared node and confirm that no extra branch leaves it.",
            "Label both endpoints of each parallel load, then add source and branch-current arrows.",
            "Draw a voltmeter across one branch and write V beside its reading. Explain why an ammeter across the supply would be the wrong connection.",
          ],
        },
      ],
      practicalTask:
        "Before answering, draw two resistors in series and then in parallel. Label every node, the current arrows and a voltmeter's two probe points. Write the current-sum equation beside the parallel drawing and keep both sketches for tutor review.",
      video: {
        resourceKey: "lesson-1-3-voltage-current-resistance-video",
        posterSrc:
          "/images/projects/open-guard-mini/lessons/lesson-1-3-meter-v-i-r.webp",
        caption:
          "Keep the multimeter selector and input sockets readable in the recording.",
      },
      diagram: {
        src: "/images/projects/open-guard-mini/lessons/lesson-1-3-meter-v-i-r.webp",
        alt: "Multimeter guidance for voltage, continuity and current modes",
        width: 1995,
        height: 931,
        caption:
          "Voltage is measured across two points; resistance and continuity are checked only with power removed.",
      },
      quiz: {
        kind: "choice",
        id: "open-guard-1-3-measurement",
        question:
          "Which statement correctly matches the quantity, unit and measurement idea?",
        options: [
          "Voltage - amperes - measured through a path",
          "Current - volts - measured across two points",
          "Resistance - ohms - normally checked with power removed",
          "Voltage - ohms - measured with one probe",
        ],
        correctIndex: 2,
        hint:
          "A voltmeter compares two nodes; an ammeter becomes part of a path; an ohmmeter supplies its own small test signal.",
        method: [
          "Match voltage with volts and a two-point comparison.",
          "Match current with amperes and a series path.",
          "Match resistance with ohms and power removed.",
        ],
        explanation:
          "Resistance is measured in ohms and is normally checked with circuit power removed. Voltage uses volts across two points, while current uses amperes through a path.",
      },
      tutor: {
        hint:
          "First match each symbol V, I and R to volt, ampere and ohm, then decide whether the meter goes across or through the circuit.",
        simpleExplanation:
          "Voltage compares two places, current moves through a route, and resistance opposes that current.",
        measurementPrompt:
          "For a node voltage, place the black probe at circuit GND and the red probe at the named node, with the meter in DC voltage mode.",
      },
    },
    {
      slug: "ohms-law-led-resistor",
      section: "1.4",
      title: "Ohm's law, charge and circuit calculations",
      duration: "Self-paced maths and charge practice",
      delivery: "Pre-recorded",
      summary:
        "Keep units and physical meaning beside the arithmetic: calculate an LED resistor, then connect capacitance, charge and voltage.",
      objectives: [
        "Use R = (VS - VF) / I for an LED series resistor.",
        "Convert milliamperes to amperes before substitution.",
        "Choose a standard resistor value without chasing maximum brightness.",
        "Convert kΩ, mA, ms, µF and nF, and interpret a stated percentage tolerance.",
        "Use Q = CV and ΔQ = IΔt with stated quantities before applying them to a design.",
      ],
      sections: [
        {
          stepId: "1-4-units",
          formativeCheckIds: ["hll-f-14-prefix"],
          heading: "Start with the quantity and its unit",
          paragraphs: [
            "Write what you know, what you need to find and the unit for each quantity. Voltage uses volts (V), current amperes (A), resistance ohms (Ω), capacitance farads (F) and time seconds (s). A number alone is not a complete electrical answer.",
            "kilo means ×1000, milli means ÷1000, micro means ÷1,000,000 and nano means ÷1,000,000,000. Separate practice: 2.2 kΩ = 2200 Ω, 6 mA = 0.006 A, 4 ms = 0.004 s and 47 µF = 0.000047 F. Also, 100 nF = 0.1 µF.",
          ],
          bullets: [
            "Write the equation before entering numbers into a calculator.",
            "Substitute consistent base units, calculate, then convert the result to a convenient unit.",
            "Keep calculator digits during the working and round at the end. Leading zeros do not count as significant figures: 0.00470 has three.",
          ],
        },
        {
          stepId: "1-4-ohms-law",
          heading: "Rearrange Ohm's law for the question",
          paragraphs: [
            "For a resistor, V = IR. Divide both sides by R to get I = V/R, or by I to get R = V/I. The equation is the same relationship used to find a different unknown.",
            "Separate rehearsal: a 2 kΩ resistor with 4 V across it carries I = 4/2000 = 0.002 A = 2 mA. These values demonstrate the method; the assessed LED problem has different givens.",
          ],
        },
        {
          stepId: "1-4-led-voltage",
          diagramId: "led-loop",
          heading: "The resistor receives the remaining voltage",
          paragraphs: [
            "An LED does not safely choose its own current. The resistor voltage is the supply voltage minus the LED forward voltage, so the design equation is R = (VS - VF) / I.",
            "A slightly larger resistor gives lower current and is normally the safer first choice. LED forward voltage is a datasheet or measured value rather than a universal exact 2 V.",
          ],
        },
        {
          stepId: "1-4-led-attempt",
          heading: "Pause: draw the LED loop",
          paragraphs: [
            "Before moving to capacitors, draw the source, LED, resistor and return. Label the supply voltage, LED voltage and target current from the later LED question. Write your equation and attempt the calculation on paper before checking it online.",
            "The next short practice sequence introduces a different component. Keep its drawing on a separate page so charge and LED-current calculations do not become one unexplained formula list.",
          ],
        },
        {
          stepId: "1-4-capacitor-charge",
          diagramId: "separated-charge",
          formativeCheckIds: ["hll-f-14-charge"],
          heading: "A capacitor stores separated charge",
          paragraphs: [
            "Sketch two conducting plates separated by an insulator. Connecting a capacitor in a circuit can leave equal and opposite charge on the plates. It stores finite electrical energy; it is not an unlimited source.",
            "Q = CV links charge Q in coulombs, capacitance C in farads and voltage V in volts. The letter C in this equation means capacitance. The unit symbol C after a charge value means coulombs.",
            "Separate rehearsal: 10 µF at 2 V gives Q = 0.000010 × 2 = 0.000020 C = 20 µC. Increasing capacitance stores more charge at the same voltage. A capacitor's voltage rating is a limit, not a voltage it generates; a polarised part also needs its correct terminal orientation.",
          ],
        },
        {
          stepId: "1-4-charge-current",
          heading: "Connect a current pulse to a charge change",
          paragraphs: [
            "Current is charge flow per unit time. For a constant current over an interval, the transferred charge is ΔQ = IΔt. The symbol Δ means 'change in'. A capacitor's charge change is also ΔQ = CΔV.",
            "When both expressions describe the same transferred charge, CΔV = IΔt. Divide by C to find the voltage change, or by ΔV to find the capacitance. This ideal estimate prepares the later power-support calculation; real source and capacitor behaviour must still be measured.",
          ],
        },
        {
          stepId: "1-4-tolerance",
          formativeCheckIds: ["hll-f-14-minimum-capacitance"],
          heading: "A printed value is a nominal value",
          paragraphs: [
            "A ±20% capacitance tolerance allows variation around the label. The minimum is 80% of nominal: multiply by 0.80. Separate rehearsal: 220 µF × 0.80 = 176 µF. A quiz's numerical rounding allowance is not the component's physical tolerance.",
          ],
        },
        {
          stepId: "1-4-capacitor-attempt",
          heading: "Pause: sketch and calculate charge",
          paragraphs: [
            "Keep this capacitor page for the tutor. It is supporting practice, not another automatically marked quiz. Use different values from the demonstrations and explain the result in words.",
          ],
          bullets: [
            "On the capacitor page, sketch the two plates and calculate charge for 22 µF at 2.0 V using Q = CV.",
            "Write one sentence explaining why a 6.3 V rating does not make a capacitor generate a 6.3 V supply.",
            "Find the minimum capacitance of a 47 µF ±20% part. Show the percentage multiplier and keep µF beside the result.",
          ],
        },
      ],
      checkpointAfterStepId: "1-4-led-attempt",
      checkpointTask:
        "Draw the LED loop and write the given values with units, resistor voltage, equation and substitution. Attempt the raw resistance calculation before checking it online.",
      practicalTask:
        "After the LED feedback, keep a second practice page showing capacitor plates and Q = CV for 22 µF at 2.0 V. Record any correction and explain what each number means.",
      video: {
        resourceKey: "lesson-1-4-led-resistor-video",
        posterSrc:
          "/images/projects/open-guard-mini/lessons/lesson-1-4-led-resistor.webp",
        caption:
          "Pause visibly on the mA-to-A conversion because it is the most common numerical error.",
      },
      diagram: {
        src: "/images/projects/open-guard-mini/lessons/lesson-1-4-led-resistor.webp",
        alt: "LED resistor circuit and Ohm's law calculation",
        width: 942,
        height: 384,
        caption:
          "The diagram is displayed at its real aspect ratio so symbols and annotations remain readable.",
      },
      quiz: {
        kind: "numeric",
        id: "open-guard-1-4-resistor",
        question:
          "A blue LED has VF = 2.8 V, the supply is 5.0 V and the target current is 4 mA. What raw resistance is calculated in ohms?",
        answer: 550,
        tolerance: 1,
        unit: "ohms",
        placeholder: "Enter resistance, e.g. 1.2 kΩ",
        hint:
          "First calculate the resistor voltage VS - VF, then convert 4 mA to 0.004 A before dividing.",
        method: [
          "Voltage across the resistor: VR = 5.0 - 2.8 = 2.2 V.",
          "Convert the current: 4 mA = 0.004 A.",
          "R = VR / I = 2.2 / 0.004 = 550 ohms.",
          "For a real build, 560 ohms is the nearest expected standard choice; 680 ohms is also a safe dimmer choice when lower current is preferred.",
        ],
        explanation:
          "The raw calculated resistance is 550 ohms. A designer then selects a real standard value and verifies current, visibility and component ratings.",
      },
      tutor: {
        hint:
          "Ask for the voltage remaining across the resistor and the current written in amperes before checking arithmetic.",
        simpleExplanation:
          "Subtract the LED's voltage first. The resistor controls the remaining voltage and therefore the current.",
        measurementPrompt:
          "Later, measure the real voltage across the LED and resistor and compare their sum with the supply voltage.",
      },
    },
    {
      slug: "reed-sensor-states",
      section: "1.5",
      title: "Reed sensors and reliable digital states",
      duration: "Self-paced sensor and drawing practice",
      delivery: "Pre-recorded",
      summary:
        "Connect magnet position, reed contact state, physical door state and the chosen digital signal polarity.",
      objectives: [
        "Explain what normally open means for the selected reed contact.",
        "Map magnet near and far to contact closed and open.",
        "Define D_RAW = 0 for the closed-door state and D_RAW = 1 for the open-door state.",
      ],
      sections: [
        {
          heading: "Physical open and electrical open are different ideas",
          paragraphs: [
            "The selected normally-open reed closes when the magnet is near. In the installation, a closed door places the magnet near the sensor, so the electrical contact is closed.",
            "When the door opens, the magnet moves away and the reed contact opens. The pull-up then makes the raw digital node HIGH.",
          ],
        },
        {
          heading: "Follow the signal node to one of two voltages",
          paragraphs: [
            "For this example, connect a resistor from the supply VCC to the signal node, and the reed from that node to ground. The digital input observes the node voltage relative to ground. The next lesson explains this pull-up arrangement in more detail.",
            "With the reed open, the resistor gives the input a HIGH default. With the reed closed, the contact connects the input to ground, giving LOW, while the resistor limits current from VCC. Do not replace that resistor with a wire.",
          ],
        },
        {
          heading: "Pause: draw and record both sensor states",
          paragraphs: [
            "Draw the same resistor, reed and signal node twice. Change only the reed contact. Predict the contact and signal states, then compare them with the tutor-approved power-off continuity demonstration before selecting an answer.",
          ],
          bullets: [
            "Use separate columns for physical closure, magnet position, contact state and D_RAW.",
            "Explain why an open drawer can correspond to an open electrical contact, while HIGH describes the resulting signal voltage.",
            "Record the exact sensor and tested magnet position; a generic picture is not a measured operating gap.",
          ],
        },
      ],
      practicalTask:
        "Before answering, draw both contact states and predict D_RAW for each. With power removed and teacher approval, move a magnet near and away from the protected reed sensor, record the two continuity observations and correct your state table if needed.",
      video: {
        resourceKey: "lesson-1-5-reed-sensor-states-video",
        posterSrc:
          "/images/projects/open-guard-mini/lessons/lesson-1-5-reed-state.webp",
        caption:
          "Use a protected or pre-wired reed sensor for student handling and show magnet orientation clearly.",
      },
      diagram: {
        src: "/images/projects/open-guard-mini/lessons/lesson-1-5-reed-state.webp",
        alt: "Reed sensor, magnet and digital state diagram",
        width: 1125,
        height: 529,
        caption:
          "Magnet near closes the reed and gives D_RAW = 0; magnet away opens it and the pull-up gives D_RAW = 1.",
      },
      quiz: {
        kind: "choice",
        id: "open-guard-1-5-reed",
        question:
          "Using the course polarity, which sequence is correct when the magnet is near the reed sensor?",
        options: [
          "Contact open, D_RAW = 1",
          "Contact closed, D_RAW = 0",
          "Contact closed, D_RAW is floating",
          "Contact open, D_RAW = 0 because the door is closed",
        ],
        correctIndex: 1,
        hint:
          "The selected reed connects the signal node to ground when the magnet is near.",
        method: [
          "Magnet near activates the selected normally-open reed.",
          "The reed contact closes and connects the node to ground.",
          "Ground is represented by logic 0, so D_RAW = 0.",
        ],
        explanation:
          "Magnet near means the reed contact is closed and the node is pulled to ground, giving D_RAW = 0. The physical door can be closed at the same time as the electrical contact is closed.",
      },
      tutor: {
        hint:
          "Separate the physical door state from the electrical contact state, then follow the node to ground.",
        simpleExplanation:
          "Close door means magnet near; magnet near closes the reed; the closed reed pulls the input LOW.",
        measurementPrompt:
          "Use continuity mode only with power removed and record the reliable operating gap rather than guessing it visually.",
      },
    },
    {
      slug: "pull-resistors-floating-input",
      section: "1.6",
      title: "Defined inputs and a first look at RC circuits",
      duration: "Self-paced input and RC drawing practice",
      delivery: "Pre-recorded",
      summary:
        "Give an open switch a defined digital state, then explore capacitor timing and two simple RC signal connections in separate paper examples.",
      objectives: [
        "Explain why an unconnected digital input is not automatically zero.",
        "Choose a pull-up for released HIGH and pressed LOW with a switch to ground.",
        "Choose a pull-down for released LOW and pressed HIGH with a switch to VCC.",
        "Explain the current and noise trade-off when selecting the resistor value.",
        "Explain one isolated RC time constant without confusing it with the reminder delay.",
        "Identify the input, output and return in simple low-pass and high-pass RC examples.",
      ],
      sections: [
        {
          stepId: "1-6-floating-input",
          heading: "An open switch needs a default",
          paragraphs: [
            "A floating input is not deliberately connected HIGH or LOW and may respond to noise, leakage or touch. A pull resistor creates a weak default that a switch can override strongly.",
            "A pull-up connects the signal node to VCC. With the switch open the node is HIGH; when the switch closes to ground the node becomes LOW and current is limited by the resistor.",
          ],
        },
        {
          stepId: "1-6-pull-down",
          heading: "A pull-down gives the opposite default",
          paragraphs: [
            "Connect a resistor from the signal node to ground and a switch from that node to VCC. With the switch open, the resistor holds the input LOW. With the switch closed, the input becomes HIGH and the resistor limits the current to ground.",
            "This is the ARM input used in the Week 1 practice logic: released means not armed. It is a foundation example, not an extra switch to add to the later DrawerSense design.",
          ],
        },
        {
          stepId: "1-6-resistor-tradeoff",
          heading: "Choose the resistor for its job",
          paragraphs: [
            "A smaller pull resistor draws more current when the switch overrides it. A larger one draws less, but leakage and interference can more easily disturb the default voltage. Choose from the input's actual limits and the environment; there is no universal value that proves every design.",
          ],
        },
        {
          stepId: "1-6-input-attempt",
          heading: "Pause: trace both switch defaults",
          paragraphs: [
            "Draw a pull-up and a pull-down before the online input check. For each, label VCC, ground and the signal node. Write the open-switch state first, then trace the complete resistor current path when the switch closes.",
            "Finish these two drawings before starting the separate RC practice below. The online question checks a pull-resistor choice; your tutor reviews the additional RC sketches.",
          ],
        },
        {
          stepId: "1-6-rc-charge",
          heading: "A capacitor voltage changes over time",
          paragraphs: [
            "Recall that changing capacitor voltage requires transferring charge. A resistor limits how quickly charge moves. In a simple resistor-capacitor circuit, the product τ = RC is the time constant: use ohms and farads to obtain seconds. The Greek letter τ is pronounced tau.",
            "For an ideal capacitor initially at 0 V, charged through a resistor from a fixed voltage source, one time constant reaches about 63% of the final voltage. This describes a curved change, not a straight line and not an instant switch.",
          ],
        },
        {
          stepId: "1-6-rc-discharge",
          diagramId: "rc-discharge",
          heading: "Isolated RC discharge: a separate power-off example",
          paragraphs: [
            "Now disconnect the source and leave a charged capacitor connected only across a resistor. Charge flows through that resistor and the capacitor voltage falls. After one time constant, about 37% of its starting voltage remains; after five, less than 1% remains in this ideal model.",
            "Separate rehearsal: 4.7 kΩ × 10 µF = 4700 × 0.000010 = 0.047 s. This is a discharge example, not the DrawerSense reminder time. Other connected loads would change the discharge route, so the full board must be measured separately.",
          ],
        },
        {
          stepId: "1-6-rc-attempt",
          formativeCheckIds: ["hll-f-16-tau"],
          heading: "Pause: sketch a discharge curve",
          paragraphs: [
            "Draw the source disconnected and show the remaining resistor-capacitor loop. Beside it, sketch capacitor voltage against time, falling steeply at first and then more slowly. Mark the start, one time constant and five time constants.",
            "For separate practice, calculate τ for 2.2 kΩ and 10 µF. Keep the units and explain what doubling only the resistance would change. This is tutor-reviewed preparation; the later assessed power circuit has different givens.",
          ],
        },
        {
          stepId: "1-6-low-pass",
          diagramId: "low-pass",
          formativeCheckIds: ["hll-f-16-lowpass-dc"],
          heading: "Low-pass: take the output across the capacitor",
          paragraphs: [
            "Draw a signal input, a series resistor, then an output node. Connect a capacitor from that output node to the shared return. Measure output between the node and return, so it is across the capacitor.",
            "With an ideal source and no significant output load, a steady input eventually appears at the output. Faster changes are reduced. That is why this connection is called low-pass: it passes steady and slowly changing signals more readily.",
          ],
          bullets: [
            "Pause and draw the input, output and return before reading the next connection.",
            "Predict the settled output for a constant input. The circuit connection, not the capacitor alone, gives this behaviour.",
          ],
        },
        {
          stepId: "1-6-high-pass",
          diagramId: "high-pass",
          formativeCheckIds: ["hll-f-16-highpass-dc"],
          heading: "High-pass: take the output across the resistor",
          paragraphs: [
            "Draw a signal input, a series capacitor, then an output node. Connect a resistor from that node to the shared return. The output is now across the resistor. Keep this as a new drawing, rather than silently changing the previous one.",
            "In this ideal, unloaded example, an input change can create a temporary output. With a constant input, the output settles back to zero. This high-pass connection responds to changing signals and removes steady DC after settling.",
          ],
          bullets: [
            "Pause and label the different component order and output measurement points.",
            "Compare the two settled outputs in words. A capacitor placed across a power rail is a different job; do not assign an entire power block one simple signal-filter cutoff.",
          ],
        },
      ],
      checkpointAfterStepId: "1-6-input-attempt",
      checkpointTask:
        "Draw a pull-up and pull-down with both switch states. Label VCC, ground and the signal node, then attempt the existing input checkpoint before beginning the separate RC practice.",
      practicalTask:
        "After the input feedback, keep separate practice sketches for isolated RC discharge and the low-pass and high-pass connections. Label every input, output and return, calculate the practice time constant and save the pages for the tutor; the online pull-up answer alone does not assess these drawings.",
      video: {
        resourceKey: "lesson-1-6-pull-resistors-video",
        posterSrc:
          "/images/projects/open-guard-mini/lessons/lesson-1-6-pull-up.webp",
        caption:
          "Do not encourage learners to touch powered circuit nodes. Use a protected demonstration for floating-input behaviour.",
      },
      diagram: {
        src: "/images/projects/open-guard-mini/lessons/lesson-1-6-pull-up.webp",
        alt: "Reed sensor input with a pull-up resistor",
        width: 1125,
        height: 529,
        caption:
          "The pull-up defines the open-contact state; the closed reed overrides it by connecting the node to ground.",
      },
      quiz: {
        kind: "choice",
        id: "open-guard-1-6-pull-up",
        question:
          "A switch connects an input to ground when pressed. You want released = HIGH and pressed = LOW. Where should the pull resistor connect?",
        options: [
          "From the signal node to VCC - a pull-up",
          "From the signal node to ground - a pull-down",
          "Directly across the battery with no resistance",
          "In series after the digital input pin",
        ],
        correctIndex: 0,
        hint:
          "Ask what voltage the input needs while the switch is open, before the switch can override it by connecting to ground.",
        method: [
          "Released means the switch is open, so the resistor must create HIGH.",
          "A resistor from the signal node to VCC creates that weak HIGH default.",
          "When pressed, the switch connects the node strongly to ground, giving LOW while the resistor limits current.",
        ],
        explanation:
          "Use a pull-up resistor to VCC. It defines the released state as HIGH, while the closed switch overrides it and pulls the input LOW.",
      },
      tutor: {
        hint:
          "State the desired open-switch voltage first; only then choose the resistor direction.",
        simpleExplanation:
          "A pull-up gently holds the input high until the switch pulls it down to ground.",
        measurementPrompt:
          "Later compare the node voltage with the switch open and closed. Record both voltage and logic name.",
      },
    },
    {
      slug: "logic-gates-truth-tables",
      section: "1.7",
      title: "AND, OR and NOT gates: inputs, outputs and truth tables",
      duration: "Self-paced logic and function practice",
      delivery: "Pre-recorded",
      summary:
        "Read the symbols and prove the behaviour of two-input AND, two-input OR and one-input NOT gates.",
      objectives: [
        "Identify input and output sides of the gate symbols.",
        "Complete all rows of AND, OR and NOT truth tables.",
        "Distinguish normal OR from exclusive OR.",
        "Distinguish a logic decision, an oscillator, a counter and a transistor switch by their jobs.",
      ],
      sections: [
        {
          diagramId: "logic-symbols",
          formativeCheckIds: ["hll-f-17-and", "hll-f-17-not"],
          heading: "Choose from the requirement, not the symbol shape",
          paragraphs: [
            "AND is HIGH only when all required conditions are HIGH. OR is HIGH when at least one condition is HIGH, including the row where both are HIGH. NOT produces the opposite of its one input.",
            "A two-input truth table has four rows because every combination of A and B must be checked.",
          ],
        },
        {
          heading: "Pause: complete every truth-table row",
          paragraphs: [
            "Draw a symbol and a blank truth table for AND, OR and NOT. Fill in one input combination at a time and explain each output in a short phrase before checking the online question. A two-input table has four rows; a one-input NOT table has two.",
            "Optional paper extension: NAND means NOT-AND. Invert an AND output, then invert it again and compare the full table. This explores an equivalent logic function; it is not an instruction to add another IC to the project.",
          ],
        },
        {
          formativeCheckIds: ["hll-f-17-counter"],
          heading: "A clock makes events; a counter counts them",
          paragraphs: [
            "An oscillator repeatedly changes its output, giving a sequence of clock events. A counter remembers how many relevant events have occurred and reset returns it to a defined starting state. A static open-door signal alone does not tell us how long the door has been open.",
            "Sketch a few clock pulses and mark the counted edges. The chosen counter's datasheet must define which edge, reset state and output are used. A first output transition is not automatically one whole output cycle. Detailed reminder timing remains a later, planned lesson.",
          ],
        },
        {
          formativeCheckIds: ["hll-f-17-transistor"],
          heading: "A transistor controls a current path",
          paragraphs: [
            "A transistor can let a logic signal control another current path. In a simple BJT switch, base current controls conduction through the collector-emitter path. In a MOSFET, gate-to-source voltage controls its channel; charging the gate still requires charge during switching.",
            "The control signal and the load supply do different jobs. A transistor is not automatically an AND gate, a timer or a source of energy. Exact pins, current limits and required drive come from the selected part's datasheet; this overview does not certify a buzzer driver.",
          ],
          bullets: [
            "Make four labelled boxes: logic decision, oscillator, counter and transistor switch.",
            "Write one job beneath each and distinguish the information arrow from the source-load-return path.",
          ],
        },
      ],
      practicalTask:
        "Before answering, complete AND, OR and NOT truth tables and explain one row in words. On a separate small sketch, distinguish a logic decision, a clock, a counter and a transistor-controlled load path. Keep the sketches for discussion; later circuit stages are still planned.",
      video: {
        resourceKey: "lesson-1-7-logic-gates-video",
        posterSrc:
          "/images/projects/open-guard-mini/lessons/lesson-1-7-logic-gates.webp",
        caption:
          "Keep the gate diagram and truth table visible together. Animate one row at a time rather than revealing every answer immediately.",
      },
      diagram: {
        src: "/images/projects/open-guard-mini/lessons/lesson-1-7-logic-gates.webp",
        alt: "AND, OR and NOT logic-gate symbols",
        width: 1995,
        height: 850,
        caption:
          "AND and OR use two inputs in this lesson; NOT uses one input and produces its opposite.",
      },
      quiz: {
        kind: "choice",
        id: "open-guard-1-7-gates",
        question:
          "A study lamp should turn on when it is dark OR when the user presses a manual override. Which gate and output sequence for inputs 00, 01, 10, 11 are correct?",
        options: [
          "AND; 0, 0, 0, 1",
          "OR; 0, 1, 1, 1",
          "XOR; 0, 1, 1, 0",
          "NOT; 1, 0, 0, 1",
        ],
        correctIndex: 1,
        hint:
          "The word OR means either condition is enough, and the 11 row remains HIGH for normal OR.",
        method: [
          "Check 00: neither condition is true, so the lamp is OFF.",
          "Check 01 and 10: one condition is true, so the lamp is ON.",
          "Check 11: at least one condition is still true, so normal OR remains ON.",
        ],
        explanation:
          "Use OR. Its outputs for 00, 01, 10 and 11 are 0, 1, 1 and 1. Normal OR is also HIGH when both inputs are HIGH.",
      },
      tutor: {
        hint:
          "Ask whether all conditions are required or whether at least one condition is enough.",
        simpleExplanation:
          "AND needs every yes; OR needs one or more yes answers; NOT flips its answer.",
        measurementPrompt:
          "When the logic is built later, verify each input separately before checking the output row.",
      },
    },
    {
      slug: "boolean-requirement",
      section: "1.8",
      title: "Turn a product requirement into a Boolean equation",
      duration: "8 min video + 10 min design task",
      delivery: "Pre-recorded",
      summary:
        "Define unambiguous variables, write a Boolean equation and test every case before choosing an IC.",
      objectives: [
        "Define what logic 0 and 1 mean for every variable.",
        "Translate only-when and and language into Y = A.D.",
        "Complete and interpret the full four-row truth table.",
      ],
      sections: [
        {
          diagramId: "boolean-practice",
          heading: "Start with behaviour, not a part number",
          paragraphs: [
            "This foundation exercise uses an ARM input to practise a two-input AND rule. It is not the full DrawerSense wiring plan. In the later project, still-open and time-elapsed form the reminder condition, while mute controls sound separately.",
            "Let A = 1 when the unit is armed. Let D = 1 when the delayed, cleaned door-open condition is true. Let Y = 1 when the alert driver should activate.",
            "The requirement is Y = A AND D. A truth table proves that the alert remains off when only one condition is true.",
          ],
        },
      ],
      practicalTask:
        "Submit the signal definitions, Boolean equation and four-row truth table. The teacher reviews the written reasoning after the webpage checks completeness.",
      video: {
        resourceKey: "lesson-1-8-boolean-requirement-video",
        posterSrc:
          "/images/projects/open-guard-mini/lessons/lesson-1-8-truth-table.webp",
        caption:
          "Do not reveal the final IC number before the equation is complete. The lesson is requirements-to-logic, not part-number memorisation.",
      },
      diagram: {
        src: "/images/projects/open-guard-mini/lessons/lesson-1-8-truth-table.webp",
        alt: "Two-input AND and OR truth tables",
        width: 1832,
        height: 855,
        caption:
          "The truth table proves every input combination rather than only the expected operating case.",
      },
      quiz: {
        kind: "choice",
        id: "open-guard-1-8-boolean",
        question:
          "For A = 1 when armed and D = 1 when the delayed open condition is true, which equation and output sequence for 00, 01, 10, 11 match the requirement?",
        options: [
          "Y = A OR D; 0, 1, 1, 1",
          "Y = NOT A; 1, 1, 0, 0",
          "Y = A AND D; 0, 0, 0, 1",
          "Y = A XOR D; 0, 1, 1, 0",
        ],
        correctIndex: 2,
        hint:
          "The alert must stay off when only the system is armed and when only an unarmed door is open. There is exactly one HIGH row.",
        method: [
          "Define A and D with both meaning and polarity.",
          "Translate 'only when armed and open' into an AND relationship.",
          "Check 00, 01 and 10: at least one required condition is missing, so Y = 0.",
          "Check 11: both conditions are true, so Y = 1.",
        ],
        explanation:
          "Y = A AND D = A.D gives outputs 0, 0, 0 and 1. The circuit should use the cleaned digital door state, not the slowly changing analogue timing voltage.",
      },
      tutor: {
        hint:
          "Test one truth-table row at a time and compare it with the original requirement sentence.",
        simpleExplanation:
          "The alert needs two yes answers at the same time: armed and open long enough.",
        measurementPrompt:
          "Later test all four rows physically. Never assume that one successful operating case proves the whole logic.",
      },
    },
    {
      slug: "week-one-design-checkpoint",
      section: "1.9",
      title: "Live design checkpoint: prove the idea before adding timing",
      duration: "50-55 min live review",
      delivery: "Live checkpoint",
      summary:
        "Combine the Week 1 ideas into a reviewed system definition before the later timing, breadboard and PCB stages begin.",
      objectives: [
        "Defend the reed pull-up, ARM pull-down and AND relationship in the Week 1 foundation exercise.",
        "Identify faults in a deliberately flawed input and logic design.",
        "Explain the node, charge, RC and signal-filter sketches needed for the published Week 2 power lessons.",
        "Prepare the evidence pack for teacher review and Week 2 release.",
      ],
      sections: [
        {
          heading: "Use the live session for diagnosis, not a second lecture",
          paragraphs: [
            "The teacher reviews the requirement, system diagram, safety check, sensor state table, pull-resistor choices and Boolean truth table, alongside the short prerequisite sketches below. Learners who need correction return to the exact explanation rather than repeating everything.",
            "The ARM example checks your understanding of input defaults and AND logic. Keep it separate from the later DrawerSense requirement: a continuous opening reaches a wait target, closing resets it, and mute affects sound only.",
            "Completing the online check confirms preparation only. A teacher or authorised reviewer still owns the real Week 1 approval.",
          ],
          bullets: [
            "Rapid retrieval: trace a complete loop and both parallel endpoints, name the V/I/R units, then explain a pull-up default and one AND row.",
            "Find faults: floating input, wrong gate, missing LED resistor, ambiguous variables and a voltmeter placed in the wrong route.",
            "Give a 30-second need-to-input-to-logic-to-output explanation.",
          ],
        },
        {
          heading: "Bring the attempts, not only the final answers",
          paragraphs: [
            "Keep the original attempt and a clearly marked correction where needed. The tutor asks you to explain what the diagram or number means. A correct multiple-choice response does not prove a physical connection or the reasoning on a separate page.",
          ],
          bullets: [
            "1.2–1.3: open and closed loops, node-labelled series and parallel drawings, current arrows and voltmeter probe points.",
            "1.4: LED resistor working with units; capacitor plate sketch; the separate Q = CV and minimum-capacitance practice calculations.",
            "1.5–1.6: reed state table; pull-up and pull-down defaults; isolated discharge loop, curve and practice time constant; labelled low-pass and high-pass input/output/return sketches.",
            "1.7–1.8: complete truth tables, explicit signal meanings and a short explanation of clock, counter and transistor roles.",
            "State what is still a prediction and what has actually been observed. Hardware release remains a human decision.",
          ],
        },
      ],
      practicalTask:
        "Bring the labelled drawings and calculations listed above, including corrections. Prepare a 60–90 word explanation of the Week 1 foundation example: why its reed input uses a pull-up, its ARM input uses a pull-down and its alert uses an AND relationship. Explain the capacitor and RC practice separately when the tutor asks; passing the online check does not replace this review.",
      video: {
        resourceKey: "lesson-1-9-live-checkpoint-briefing-video",
        posterSrc:
          "/images/projects/open-guard-mini/lessons/lesson-1-9-design-checkpoint.webp",
        caption:
          "Optional short briefing only. The core checkpoint is a live teacher-led review, not another full pre-recorded lecture.",
      },
      diagram: {
        src: "/images/projects/open-guard-mini/lessons/lesson-1-9-design-checkpoint.webp",
        alt: "Week 1 logic checkpoint showing ARM, delayed open and AND output",
        width: 1055,
        height: 614,
        caption:
          "In this foundation logic exercise, alert is HIGH only when ARMED and the cleaned delayed-open signal are both HIGH. The full DrawerSense architecture is developed in Week 2.",
      },
      quiz: {
        kind: "choice",
        id: "open-guard-1-9-defence",
        question:
          "Which explanation correctly defends the Week 1 input and logic choices?",
        options: [
          "Any resistor direction is acceptable; the gate can be OR because the buzzer will still work",
          "The reed pull-up creates a defined HIGH when its contact opens, the ARM pull-down keeps ARM safely LOW when its switch is open, and AND activates the alert only when both required conditions are HIGH",
          "The pull-down is used only to reduce battery voltage, and the transistor performs the AND logic",
          "The input should be left floating so it can detect small changes more easily",
        ],
        correctIndex: 1,
        hint:
          "Describe the desired default state of each open switch, then connect both defined inputs to the single truth-table row that activates Y.",
        method: [
          "Reed contact open must become a deliberate HIGH, so use a pull-up.",
          "ARM switch open must remain a deliberate LOW, so use a pull-down.",
          "The alert requirement needs both conditions together, so AND implements the rule.",
          "Take the complete evidence pack to the live teacher review.",
        ],
        explanation:
          "The pull resistors define safe and predictable open-switch states, while AND matches the one truth-table row that should activate the alert. Passing this online check does not replace the teacher's approval.",
      },
      tutor: {
        hint:
          "Begin with the open-switch default for each input and finish with the one output row where both conditions are true.",
        simpleExplanation:
          "Each input must have a known default, and the alert needs both inputs to say yes.",
        measurementPrompt:
          "The live review should compare the written states with later measured voltages. Human approval remains required before Week 2 practical release.",
      },
      humanReviewRequired: true,
    },
  ],
};

const courses = [openGuardMiniCourse];

const courseAliases: Record<string, string> = {
  "smart-door-lab": "open-guard-mini",
};

const lessonAliases: Record<string, string> = {
  "safe-circuits": "safety-complete-circuit",
  "door-alarm-logic": "boolean-requirement",
  "input-process-output": "user-need-engineering-requirement",
  "esp32-inputs": "user-need-engineering-requirement",
  "pcb-capstone": "week-one-design-checkpoint",
};

export function normalizeCourseSlug(slug: string) {
  return courseAliases[slug] ?? slug;
}

export function normalizeLessonSlug(slug: string) {
  return lessonAliases[slug] ?? slug;
}

export function getCourses() {
  return courses;
}

export function getCourse(slug: string) {
  const canonicalSlug = normalizeCourseSlug(slug);
  return courses.find((course) => course.slug === canonicalSlug);
}

export function getLesson(courseSlug: string, lessonSlug: string) {
  const course = getCourse(courseSlug);
  const canonicalLessonSlug = normalizeLessonSlug(lessonSlug);
  return course?.lessons.find((lesson) => lesson.slug === canonicalLessonSlug);
}

export function getAdjacentLessons(course: Course, lessonSlug: string) {
  const canonicalLessonSlug = normalizeLessonSlug(lessonSlug);
  const index = course.lessons.findIndex(
    (lesson) => lesson.slug === canonicalLessonSlug,
  );

  return {
    previous: index > 0 ? course.lessons[index - 1] : undefined,
    next:
      index >= 0 && index < course.lessons.length - 1
        ? course.lessons[index + 1]
        : undefined,
  };
}
