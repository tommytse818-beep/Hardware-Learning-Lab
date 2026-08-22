export type LessonSection = {
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
  plannedPath?: string;
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
  practicalTask: string;
  video: LessonVideo;
  diagram?: LessonDiagram;
  quiz: LessonQuiz;
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
  title: "OpenGuard Mini: Electronics Product Design Foundations",
  shortTitle: "OpenGuard Mini",
  theme: "Smart living",
  status: "Working",
  level: "Foundation pathway",
  ageRange: "Recommended F4-F5 / ages 14-16",
  duration: "Section 0 and Week 1 now in development",
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
        "Recognise that OpenGuard Mini is a removable alert and reminder, not a lock or certified security device.",
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
        plannedPath:
          "/media/courses/open-guard-mini/section-0-school-induction.mp4",
        posterSrc:
          "/images/projects/open-guard-mini/open-guard-concept-poster.webp",
        caption:
          "Reserved for the 1.5-2 hour school induction recording. The page deliberately remains usable before that recording is uploaded.",
      },
      diagram: {
        src: "/images/projects/open-guard-mini/open-guard-system-map.webp",
        alt: "OpenGuard Mini input, process and output system map",
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
      slug: "input-process-output",
      section: "1.1",
      title: "Electronics is input, process and output",
      duration: "6 min video + 5 min check",
      delivery: "Pre-recorded",
      summary:
        "Use a repeatable method to investigate an everyday electronic product rather than treating it as a mysterious box.",
      objectives: [
        "Define input, process and output in plain engineering language.",
        "Separate information input from the power that supplies the system.",
        "Classify a new electronic product without copying the OpenGuard answer.",
      ],
      sections: [
        {
          heading: "A system receives, decides and responds",
          paragraphs: [
            "An input is a physical or electrical condition entering the system. Processing is the rule, comparison or circuit action that handles it. An output is the result that a user can see, hear, feel or receive.",
            "A battery supplies energy, but it is not normally the information input. For a thermometer, temperature is the input and the displayed number is the output.",
          ],
        },
        {
          heading: "Transfer to OpenGuard Mini",
          paragraphs: [
            "Door state and the arm control are inputs. Timing and logic form the process. The LED and buzzer are outputs. Later lessons explain the physical circuit behind each block.",
          ],
        },
      ],
      practicalTask:
        "Choose one product at home and draw three boxes labelled Input, Process and Output. Give each box one clear job.",
      video: {
        plannedPath:
          "/media/courses/open-guard-mini/week-1/lesson-1-1-input-process-output.mp4",
        posterSrc:
          "/images/projects/open-guard-mini/lessons/lesson-1-1-input-process-output.webp",
        caption:
          "Record one product example only. Keep the diagram on screen while defining the three blocks.",
      },
      diagram: {
        src: "/images/projects/open-guard-mini/lessons/lesson-1-1-input-process-output.webp",
        alt: "Input, process and output block diagram for an electronic system",
        width: 1995,
        height: 656,
        caption:
          "The image keeps its original aspect ratio. It is never stretched into a square or cropped.",
      },
      quiz: {
        kind: "choice",
        id: "open-guard-1-1-system",
        question:
          "A hand dryer starts when hands are placed below it. Which option correctly identifies input, process and output?",
        options: [
          "Input: electricity; Process: the cable; Output: the wall socket",
          "Input: detected hand presence; Process: decide that presence crosses the threshold; Output: moving warm air",
          "Input: warm air; Process: the user's hands; Output: the sensor",
          "Input: the motor; Process: electricity; Output: the button",
        ],
        correctIndex: 1,
        hint:
          "Ask what physical condition changes, what rule is applied and what the user finally observes.",
        method: [
          "Identify the sensed physical event: hands arrive below the dryer.",
          "State the decision: the sensor signal crosses a presence threshold.",
          "State the observable response: the motor and heater produce moving warm air.",
        ],
        explanation:
          "Power supports every block, but the information input is detected hand presence. The system processes that information and produces moving warm air as the user-facing output.",
      },
      tutor: {
        hint:
          "Use the questions: What changes? What rule is applied? What can the user observe?",
        simpleExplanation:
          "Input is what the system notices, process is what it decides, and output is what it does.",
        measurementPrompt:
          "No meter is required yet. Submit a labelled system diagram as evidence.",
      },
    },
    {
      slug: "safety-complete-circuit",
      section: "1.2",
      title: "Safety and the complete circuit loop",
      duration: "7 min video + 6 min check",
      delivery: "Pre-recorded",
      summary:
        "Identify a complete source-load-return path and apply the course safety routine before moving wires or using a meter.",
      objectives: [
        "Trace conventional current through a complete low-voltage loop.",
        "Explain why an open return path stops continuous current.",
        "Apply the power-off, compare, check and power-on routine.",
      ],
      sections: [
        {
          heading: "Current needs a return path",
          paragraphs: [
            "A component does not work simply because one lead touches a battery. Current requires a complete path from the source, through the load and back to the source.",
            "An open gap breaks the loop. Voltage may still exist across the gap even though current through the open path is approximately zero.",
          ],
          bullets: [
            "Battery-powered extra-low voltage only.",
            "Power off before rewiring or using continuity/resistance mode.",
            "Never place a meter in current mode directly across the battery.",
          ],
        },
      ],
      practicalTask:
        "On a simple battery-resistor-LED drawing, mark source, load, return path and the point where an open wire would stop current.",
      video: {
        plannedPath:
          "/media/courses/open-guard-mini/week-1/lesson-1-2-complete-circuit.mp4",
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
      duration: "8 min video + 7 min check",
      delivery: "Pre-recorded",
      summary:
        "Explain the three core circuit quantities and choose the correct measurement idea for each one.",
      objectives: [
        "State voltage as potential difference between two nodes.",
        "State current as charge flow through a path.",
        "State resistance as opposition relating voltage and current, checked with power removed.",
      ],
      sections: [
        {
          heading: "Use circuit language",
          paragraphs: [
            "Voltage does not flow. A voltmeter compares two selected points. Current passes through a path and is measured in amperes. Resistance is measured in ohms, normally with circuit power removed.",
            "Placing the black probe at circuit ground is a convenient node-voltage reference, not a universal rule for every possible measurement.",
          ],
        },
      ],
      practicalTask:
        "On a screenshot of a simple circuit, mark two probe points for a voltage measurement and write the expected unit beside the meter.",
      video: {
        plannedPath:
          "/media/courses/open-guard-mini/week-1/lesson-1-3-voltage-current-resistance.mp4",
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
      title: "Ohm's law and choosing an LED resistor",
      duration: "9 min video + 10 min check",
      delivery: "Pre-recorded",
      summary:
        "Calculate the resistor from supply voltage, LED forward voltage and target current, then choose a sensible standard value.",
      objectives: [
        "Use R = (VS - VF) / I for an LED series resistor.",
        "Convert milliamperes to amperes before substitution.",
        "Choose a standard resistor value without chasing maximum brightness.",
      ],
      sections: [
        {
          heading: "The resistor receives the remaining voltage",
          paragraphs: [
            "An LED does not safely choose its own current. The resistor voltage is the supply voltage minus the LED forward voltage, so the design equation is R = (VS - VF) / I.",
            "A slightly larger resistor gives lower current and is normally the safer first choice. LED forward voltage is a datasheet or measured value rather than a universal exact 2 V.",
          ],
        },
      ],
      practicalTask:
        "Write the calculation in four lines: known values, resistor voltage, equation and substitution, then the selected standard value.",
      video: {
        plannedPath:
          "/media/courses/open-guard-mini/week-1/lesson-1-4-led-resistor.mp4",
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
        placeholder: "Example: 550 or 0.55 kΩ",
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
      duration: "7 min video + 7 min check",
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
      ],
      practicalTask:
        "With power removed and teacher approval, move a magnet near and away from the protected reed sensor and record the two continuity observations.",
      video: {
        plannedPath:
          "/media/courses/open-guard-mini/week-1/lesson-1-5-reed-sensor-states.mp4",
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
      title: "Pull-up, pull-down and the danger of a floating input",
      duration: "8 min video + 8 min check",
      delivery: "Pre-recorded",
      summary:
        "Choose a pull-up or pull-down so an open switch still produces a deliberate and reliable digital state.",
      objectives: [
        "Explain why an unconnected digital input is not automatically zero.",
        "Choose a pull-up for released HIGH and pressed LOW with a switch to ground.",
        "Explain the current and noise trade-off when selecting the resistor value.",
      ],
      sections: [
        {
          heading: "An open switch needs a default",
          paragraphs: [
            "A floating input is not deliberately connected HIGH or LOW and may respond to noise, leakage or touch. A pull resistor creates a weak default that a switch can override strongly.",
            "A pull-up connects the signal node to VCC. With the switch open the node is HIGH; when the switch closes to ground the node becomes LOW and current is limited by the resistor.",
          ],
        },
      ],
      practicalTask:
        "Draw one pull-up and one pull-down example. Label the open-switch default state and the closed-switch active state for each one.",
      video: {
        plannedPath:
          "/media/courses/open-guard-mini/week-1/lesson-1-6-pull-resistors.mp4",
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
      duration: "9 min video + 10 min check",
      delivery: "Pre-recorded",
      summary:
        "Read the symbols and prove the behaviour of two-input AND, two-input OR and one-input NOT gates.",
      objectives: [
        "Identify input and output sides of the gate symbols.",
        "Complete all rows of AND, OR and NOT truth tables.",
        "Distinguish normal OR from exclusive OR.",
      ],
      sections: [
        {
          heading: "Choose from the requirement, not the symbol shape",
          paragraphs: [
            "AND is HIGH only when all required conditions are HIGH. OR is HIGH when at least one condition is HIGH, including the row where both are HIGH. NOT produces the opposite of its one input.",
            "A two-input truth table has four rows because every combination of A and B must be checked.",
          ],
        },
      ],
      practicalTask:
        "Complete AND, OR and NOT truth tables, then describe one row in words without using the gate symbol.",
      video: {
        plannedPath:
          "/media/courses/open-guard-mini/week-1/lesson-1-7-logic-gates.mp4",
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
          heading: "Start with behaviour, not a part number",
          paragraphs: [
            "Let A = 1 when the unit is armed. Let D = 1 when the delayed, cleaned door-open condition is true. Let Y = 1 when the alert driver should activate.",
            "The requirement is Y = A AND D. A truth table proves that the alert remains off when only one condition is true.",
          ],
        },
      ],
      practicalTask:
        "Submit the signal definitions, Boolean equation and four-row truth table. The teacher reviews the written reasoning after the webpage checks completeness.",
      video: {
        plannedPath:
          "/media/courses/open-guard-mini/week-1/lesson-1-8-boolean-requirement.mp4",
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
        "Defend the reed pull-up, ARM pull-down and AND relationship.",
        "Identify faults in a deliberately flawed input and logic design.",
        "Prepare the evidence pack for teacher review and Week 2 release.",
      ],
      sections: [
        {
          heading: "Use the live session for diagnosis, not a second lecture",
          paragraphs: [
            "The teacher reviews the requirement, system diagram, safety check, sensor state table, pull-resistor choices and Boolean truth table. Learners who need correction return to the exact micro-lesson rather than repeating everything.",
            "Completing the online check confirms preparation only. A teacher or authorised reviewer still owns the real Week 1 approval.",
          ],
          bullets: [
            "Rapid retrieval: complete loop, V/I/R units, pull-up default and AND rule.",
            "Find faults: floating input, wrong gate, missing LED resistor and ambiguous variables.",
            "Give a 30-second need-to-input-to-logic-to-output explanation.",
          ],
        },
      ],
      practicalTask:
        "Prepare a 60-90 word design defence explaining why OpenGuard uses a pull-up on the reed input, a pull-down on ARM and an AND relationship for the alert.",
      video: {
        plannedPath:
          "/media/courses/open-guard-mini/week-1/lesson-1-9-live-checkpoint-briefing.mp4",
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
          "The Week 1 logic target is alert HIGH only when ARMED and the cleaned delayed-open signal are both HIGH.",
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
  "esp32-inputs": "input-process-output",
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
