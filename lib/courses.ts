export type LessonSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LessonQuiz = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type TutorGuidance = {
  hint: string;
  simpleExplanation: string;
  measurementPrompt: string;
};

export type Lesson = {
  slug: string;
  number: number;
  title: string;
  duration: string;
  summary: string;
  objectives: string[];
  sections: LessonSection[];
  practicalTask: string;
  videoEmbedUrl?: string;
  quiz: LessonQuiz;
  tutor: TutorGuidance;
};

export type Course = {
  slug: string;
  title: string;
  level: string;
  ageRange: string;
  duration: string;
  description: string;
  outcome: string;
  lessons: Lesson[];
};

const smartDoorCourse: Course = {
  slug: "smart-door-lab",
  title: "Smart Door Lab",
  level: "Foundation pathway",
  ageRange: "Ages 13–16",
  duration: "4 prototype lessons",
  description:
    "Learn low-voltage electronics, logic, ESP32 firmware and PCB checking through one useful door-alarm product.",
  outcome:
    "A working low-voltage door alarm and a clear pathway towards a personalized PCB capstone.",
  lessons: [
    {
      slug: "safe-circuits",
      number: 1,
      title: "Safe low-voltage circuits",
      duration: "25 minutes",
      summary:
        "Understand voltage, current, resistance and why an LED needs a current-limiting resistor.",
      objectives: [
        "Identify voltage, current and resistance in a simple circuit.",
        "Explain why the platform begins with USB 5 V and ESP32 3.3 V systems.",
        "Connect an LED with a suitable series resistor.",
      ],
      sections: [
        {
          heading: "What makes a complete circuit?",
          paragraphs: [
            "Current flows only when there is a complete path from the source, through the components and back to the source.",
            "In this course, student-accessible circuits remain at extra-low voltage. Mains electricity is outside the beginner pathway.",
          ],
        },
        {
          heading: "Why the resistor matters",
          paragraphs: [
            "An LED does not safely limit its own current. A series resistor reduces the current to a level that the LED and controller output can tolerate.",
          ],
          bullets: [
            "Check the LED polarity before powering the circuit.",
            "Place the resistor in series with the LED.",
            "Power off before moving wires.",
          ],
        },
      ],
      practicalTask:
        "Draw a 3.3 V source, resistor and LED in one series loop. Mark the direction of conventional current.",
      quiz: {
        id: "safe-circuits-q1",
        question: "What is the main job of the resistor in series with an LED?",
        options: [
          "Increase the supply voltage",
          "Limit the current through the LED",
          "Store the program",
          "Make the LED act as a switch",
        ],
        correctIndex: 1,
        explanation:
          "The series resistor limits current. Without it, excessive current can damage the LED or the controller output.",
      },
      tutor: {
        hint:
          "Think about what would happen if the LED were connected directly across a source that can provide much more current than the LED needs.",
        simpleExplanation:
          "The resistor acts like a restriction in the current path. It stops too much current flowing through the LED.",
        measurementPrompt:
          "With power off, first check the resistor value. With power on, measure the voltage across the LED rather than placing the meter directly across the supply in current mode.",
      },
    },
    {
      slug: "door-alarm-logic",
      number: 2,
      title: "Door-alarm logic",
      duration: "30 minutes",
      summary:
        "Turn a product requirement into Boolean logic and a truth table.",
      objectives: [
        "Translate an everyday requirement into logic variables.",
        "Complete a two-input truth table.",
        "Explain why an AND gate suits an armed door alarm.",
      ],
      sections: [
        {
          heading: "Define the signals first",
          paragraphs: [
            "Let A = 1 when the alarm is armed. Let D = 1 when the door is open. Let Y = 1 when the buzzer should sound.",
            "The required behaviour is Y = A AND D. The buzzer sounds only when both conditions are true.",
          ],
        },
        {
          heading: "Truth table",
          paragraphs: [
            "A truth table checks every possible input combination. This prevents us from designing only for the one situation we expect to see.",
          ],
          bullets: [
            "A = 0, D = 0 → Y = 0",
            "A = 0, D = 1 → Y = 0",
            "A = 1, D = 0 → Y = 0",
            "A = 1, D = 1 → Y = 1",
          ],
        },
      ],
      practicalTask:
        "Write one sentence explaining why OR would produce an unwanted alarm in this system.",
      quiz: {
        id: "door-logic-q1",
        question:
          "The alarm is armed (A = 1) but the door is closed (D = 0). For Y = A AND D, what is Y?",
        options: ["0", "1", "It alternates", "It cannot be determined"],
        correctIndex: 0,
        explanation:
          "An AND output is 1 only when every input is 1. Because D = 0, the buzzer output Y is 0.",
      },
      tutor: {
        hint:
          "For an AND gate, ask whether every required condition is true at the same time.",
        simpleExplanation:
          "The system needs two yes answers: armed and open. One yes and one no gives no alarm.",
        measurementPrompt:
          "When you build the circuit, measure or observe A and D separately before checking Y. This tells you whether the fault is at an input or the output.",
      },
    },
    {
      slug: "esp32-inputs",
      number: 3,
      title: "ESP32 inputs and outputs",
      duration: "35 minutes",
      summary:
        "Rebuild the same door-alarm behaviour in firmware using a digital input, output and internal pull-up.",
      objectives: [
        "Explain the purpose of a pull-up resistor.",
        "Recognize that a switch connected to ground can read LOW when active.",
        "Implement the door-alarm condition with clear Boolean logic.",
      ],
      sections: [
        {
          heading: "Avoid a floating input",
          paragraphs: [
            "A disconnected digital input can pick up noise and randomly change state. A pull-up holds it at a known HIGH level until the switch connects it to ground.",
            "This means the active switch state may be LOW. The software should use clear names such as doorOpen rather than assuming HIGH always means active.",
          ],
        },
        {
          heading: "Firmware logic",
          paragraphs: [
            "Read the arm switch and door sensor, convert them into meaningful Boolean variables, then calculate alarmOn = armed && doorOpen.",
          ],
          bullets: [
            "Configure the sensor pin with INPUT_PULLUP when appropriate.",
            "Keep the buzzer off during startup.",
            "Use Serial output to inspect input states during debugging.",
          ],
        },
      ],
      practicalTask:
        "Write pseudocode that reads two inputs and switches on the buzzer only when the system is armed and the door is open.",
      quiz: {
        id: "esp32-input-q1",
        question:
          "With INPUT_PULLUP and a switch connected from the GPIO pin to GND, what does the input normally read when the switch is pressed?",
        options: ["HIGH", "LOW", "Analogue only", "Undefined by design"],
        correctIndex: 1,
        explanation:
          "The pressed switch connects the pin to ground, so it reads LOW. The internal pull-up holds it HIGH when the switch is open.",
      },
      tutor: {
        hint:
          "Follow the electrical path after the switch closes: the GPIO pin becomes connected to ground.",
        simpleExplanation:
          "Open switch: the pull-up holds the pin HIGH. Pressed switch: the switch pulls the pin down to LOW.",
        measurementPrompt:
          "Use Serial output or a voltmeter referenced to GND. Expect about 3.3 V when open and close to 0 V when pressed.",
      },
    },
    {
      slug: "pcb-capstone",
      number: 4,
      title: "PCB capstone checks",
      duration: "35 minutes",
      summary:
        "Understand the difference between schematic electrical checks and PCB layout-rule checks before fabrication.",
      objectives: [
        "Explain what KiCad ERC and DRC each check.",
        "Recognize that passing checks does not guarantee successful assembly.",
        "Prepare a constrained student board for human approval.",
      ],
      sections: [
        {
          heading: "ERC before layout",
          paragraphs: [
            "Electrical Rules Check examines the schematic for issues such as unconnected required pins, conflicting pin types and missing power information.",
          ],
        },
        {
          heading: "DRC before fabrication",
          paragraphs: [
            "Design Rules Check examines the PCB layout against rules such as clearance, track width and unconnected items.",
            "Passing ERC and DRC increases confidence, but the finished board still requires assembly inspection and physical testing.",
          ],
        },
      ],
      practicalTask:
        "Write a two-line release statement: one line for automated checks and one line for the physical test still required.",
      quiz: {
        id: "pcb-check-q1",
        question: "Which statement is correct?",
        options: [
          "ERC alone proves the assembled PCB works",
          "DRC checks only the firmware",
          "ERC checks schematic rules and DRC checks PCB layout rules",
          "Passing DRC means no physical test is required",
        ],
        correctIndex: 2,
        explanation:
          "ERC focuses on schematic electrical rules, while DRC focuses on PCB layout rules. Neither replaces assembly inspection and physical testing.",
      },
      tutor: {
        hint:
          "Separate the design into two representations: the logical electrical schematic and the physical copper layout.",
        simpleExplanation:
          "ERC checks the circuit drawing. DRC checks how the board is physically laid out.",
        measurementPrompt:
          "Before first power-up, inspect for shorts and reversed parts. Then use a current-limited supply and verify the power rails before testing functions.",
      },
    },
  ],
};

const courses: Course[] = [smartDoorCourse];

export function getAllCourses() {
  return courses;
}

export function getCourse(courseSlug: string) {
  return courses.find((course) => course.slug === courseSlug);
}

export function getLesson(courseSlug: string, lessonSlug: string) {
  return getCourse(courseSlug)?.lessons.find(
    (lesson) => lesson.slug === lessonSlug,
  );
}

export function getAdjacentLessons(course: Course, lessonSlug: string) {
  const index = course.lessons.findIndex(
    (lesson) => lesson.slug === lessonSlug,
  );

  return {
    previous: index > 0 ? course.lessons[index - 1] : undefined,
    next:
      index >= 0 && index < course.lessons.length - 1
        ? course.lessons[index + 1]
        : undefined,
  };
}
