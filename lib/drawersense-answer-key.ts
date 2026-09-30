import "server-only";

import { getDrawerSenseLesson, type LessonId } from "./drawersense-curriculum";

type Answer =
  | { kind: "choice"; index: number }
  | { kind: "numeric"; siValue: number; tolerance: number; conclusionIndex?: number };

// Keep keys and solutions out of client bundles and static public resources.
const answerKey: Record<LessonId, Record<string, Answer>> = {
  "2.0A": {
    "0A1": { kind: "choice", index: 1 },
    "0A2": { kind: "choice", index: 0 },
    "2.0AT": { kind: "choice", index: 1 },
  },
  "2.0B": {
    "0B1": { kind: "choice", index: 1 },
    "0B2": { kind: "choice", index: 1 },
    "2.0BT": { kind: "choice", index: 0 },
  },
  "2.1A": {
    "1A1": { kind: "choice", index: 1 },
    "1A2": { kind: "choice", index: 1 },
    "2.1AT": { kind: "choice", index: 0 },
  },
  "2.1B": {
    "1B1": { kind: "numeric", siValue: 3, tolerance: 0.000001 },
    "1B2": { kind: "numeric", siValue: 0.005, tolerance: 0.000000001 },
    "2.1BT": { kind: "numeric", siValue: 3, tolerance: 0.000001 },
  },
  "2.1C": {
    "1C1": { kind: "choice", index: 0 },
    "1C2": { kind: "choice", index: 1 },
    "2.1CT": { kind: "choice", index: 1 },
  },
  "2.1D": {
    "1D1": { kind: "numeric", siValue: 0.020 * 0.001 / 0.30, tolerance: 0.0000005 },
    "1D2": { kind: "numeric", siValue: 0.25, tolerance: 0.0005 },
    "2.1DT": { kind: "numeric", siValue: 0.375, tolerance: 0.0005, conclusionIndex: 1 },
  },
  "2.1E": {
    "1E1": { kind: "numeric", siValue: 0.003, tolerance: 0.000000001 },
    "1E2": { kind: "numeric", siValue: 0.1, tolerance: 0.000001 },
    "2.1ET": { kind: "choice", index: 0 },
  },
  "2.1F": {
    "1F1": { kind: "choice", index: 0 },
    "1F2": { kind: "choice", index: 1 },
    "2.1FT": { kind: "choice", index: 1 },
  },
};

// These walkthroughs cover the two initial checks. Transfer answers are deliberately
// excluded so the changed situation still requires the student's own reasoning.
const workedSolutions: Record<LessonId, string[]> = {
  "2.0A": [
    "Draw a closed baseline, raise the position track for 5 s, then lower it. Since 5 s is shorter than the 20 s target, the reminder track stays low.",
    "Start a separate long-opening trial at t = 0. Mark the ideal 20 s boundary and raise the reminder track there while the drawer remains open. This is the design target, not evidence of exact real timing.",
    "At closing, lower the reminder track and clear the elapsed wait. Label both STOP and RESET. Reopening starts a new wait from zero.",
    "Mute controls sound only: during a timed reminder, the light can stay on while the buzzer is muted. Switching the whole board off is a separate action.",
    "Compare your drawing's labels and events with this reasoning. Equivalent clear layouts are valid; ask the tutor to review an ambiguous diagram.",
  ],
  "2.0B": [
    "Draw Sense, Wait/reset, Decide/mute and Alert in order. Their jobs are to recognise, wait, decide and indicate.",
    "Connect Sense to Wait/reset and also directly to Decide/mute. Add the elapsed-time signal from Wait/reset to Decide/mute: the decision needs to know both that enough time has passed and that the drawer is still open.",
    "Draw Power above the four active blocks and label supply AND return. Signal arrows do not place the loads in a series battery circuit.",
    "The hardware reference makes the reminder without firmware. The printed QR link is read by the phone. A functional map still needs to become a complete, checked wiring diagram.",
  ],
  "2.1A": [
    "In the defined JS102011CQN symbol, terminal 2 is common. Keep the same terminal positions in both sketches; verify the actual part and physical view with its datasheet and continuity test.",
    "For ON, connect 2 to 1. Trace source positive → switch → VCC → load → GND → source negative. Terminal 3 is unselected.",
    "For OFF, connect 2 to 3. Leave the source feed visibly open and trace VCC → R17 → GND. The resistor limits the discharge current from stored rail charge; source positive is never shorted to GND.",
    "These are electrical contact states. A sketch cannot prove which way the physical actuator points on a particular part.",
  ],
  "2.1B": [
    "Draw a VCC node and a GND node. Both loads connect between these same two nodes, so each has the full maintained 3 V across it.",
    "At the junction, Iₛ = I₁ + I₂ = 2 mA + 3 mA = 5 mA = 0.005 A. Different branch currents can share the same voltage.",
    "Place the voltmeter across VCC and GND. The given currents are exercise values, not measured product consumption. An ammeter across the source would be the wrong connection.",
  ],
  "2.1C": [
    "Add C1 as a parallel branch between VCC and GND. Label positive at VCC and negative at GND; the source-to-load path does not run through the capacitor in series.",
    "Label 100 µF as capacitance and 6.3 V separately as rated voltage. The supply sets the operating rail. Low operating voltage does not remove a polarised capacitor's polarity requirement.",
    "Draw one 100 nF capacitor beside each IC's supply/return connection. Each short local loop supports that IC. The schematic's shared nodes do not make physical placement irrelevant.",
    "A charge sketch can show +Q and −Q on the capacitor plates with Q = CV. Keep this explanatory plate sketch separate from the circuit wires.",
  ],
  "2.1D": [
    "State the model first: the capacitor alone supplies a constant extra current. Convert 20 mA = 0.020 A and 1 ms = 0.001 s; the allowed voltage change is 0.30 V.",
    "Cmin = IΔt/ΔVmax = (0.020 × 0.001)/0.30 = 0.0000667 F ≈ 66.7 µF. This is an ideal lower bound within the stated model.",
    "At −20% tolerance, C1 can be 100 µF × 0.80 = 80 µF = 0.000080 F. Then ΔV = (0.020 × 0.001)/0.000080 = 0.25 V.",
    "Since 0.25 V is below 0.30 V, this ideal 20 mA exercise passes at the tolerance minimum. Measure the actual brief voltage change: a real capacitor and source have unwanted internal resistance, and temperature and the connected loads also affect the result. A calculation alone does not prove the real design meets the limit.",
    "For the transfer check, keep the capacitance and pulse duration fixed and substitute the new current yourself. Compare the resulting droop with the same limit.",
  ],
  "2.1E": [
    "Draw the selected OFF path with a visible gap to source positive. Trace current from charged C1 through R17 and back to C1. Other board loads are omitted in this isolated model.",
    "Convert R17 = 1 kΩ = 1000 Ω. The initial current is I₀ = V₀/R = 3/1000 = 0.003 A = 3 mA. It decreases as the capacitor voltage falls.",
    "Convert C1 = 100 µF = 0.000100 F. Then τ = RC = 1000 × 0.000100 = 0.10 s = 100 ms. This is the short OFF-discharge time constant, not the approximately 20 s reminder delay.",
    "Sketch the exponential curve through about 1.10 V at one time constant and about 0.020 V at five time constants. One time constant does not mean zero voltage. Actual loads and tolerances change the observed curve; follow the supervised 2 s OFF wait during startup checks.",
  ],
  "2.1F": [
    "A reading of 3.0 V near the source and 0 V at the far rail suggests a split rail or missing connection. This is a fault example, not a reading from your own board.",
    "Disconnect power, verify continuity between the intended nodes, correct the connection, inspect the wiring, then restore tutor-approved power and repeat the voltage measurements.",
    "Unexpected warmth, current limiting or voltage collapse calls for disconnection and tutor inspection. Increasing the voltage or current limit does not fix the wiring fault.",
    "Keep actual source/current-limit settings, both rail voltages, switch continuity states, the OFF-observation method, the corrected circuit and a board photograph. A tutor must inspect and sign off the physical build before the sensing stage.",
  ],
};

export function gradeQuestion(
  lessonId: LessonId,
  questionId: string,
  response: unknown,
): { correct: boolean; hint?: string } {
  const lesson = getDrawerSenseLesson(lessonId);
  const question = lesson && [...lesson.questions, lesson.transfer].find((item) => item.id === questionId);
  if (!lesson || !question) return { correct: false, hint: "Choose a question from the current lesson." };
  const answer = answerKey[lesson.id][question.id];

  if (answer.kind === "choice") {
    const correct = typeof response === "string" && response === String(answer.index);
    return correct ? { correct: true } : { correct: false, hint: question.hint };
  }

  if (typeof response !== "object" || response === null || Array.isArray(response)) {
    return { correct: false, hint: "Enter a number and select its unit." };
  }
  const candidate = response as { value?: unknown; unit?: unknown; conclusion?: unknown };
  if (typeof candidate.value !== "string" || typeof candidate.unit !== "string") {
    return { correct: false, hint: "Enter a number and select its unit." };
  }

  const rawValue = candidate.value.trim();
  // Accept decimal/scientific notation, not parseFloat's partially parsed strings,
  // hexadecimal, NaN, Infinity, embedded units or multiplication expressions.
  if (rawValue.length > 64 || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(rawValue)) {
    return { correct: false, hint: "Use a decimal number (for example 0.012) or scientific notation (1.2e-2), and choose the unit separately." };
  }
  // A unit must belong to this quantity. Do not accept a client-supplied multiplier.
  const unit = question.units?.find((option) => option.value === candidate.unit);
  if (!unit) return { correct: false, hint: "Select one of the units provided for this quantity." };
  const siValue = Number(rawValue) * unit.multiplier;
  if (!Number.isFinite(siValue) || siValue <= 0) {
    return { correct: false, hint: "This quantity needs a finite positive value. Check your calculation and units." };
  }
  const correct = Math.abs(siValue - answer.siValue) <= answer.tolerance;
  if (!correct) return { correct: false, hint: question.hint };
  if (answer.conclusionIndex !== undefined && candidate.conclusion !== String(answer.conclusionIndex)) {
    return {
      correct: false,
      hint: "Your numerical result is correct. Compare that voltage drop with 0.30 V, then select what it means for the limit.",
    };
  }
  return { correct: true };
}

/** Call only after the route verifies the initial checks and saved work. */
export function getWorkedSolution(lessonId: LessonId): string[] {
  return getDrawerSenseLesson(lessonId) ? [...workedSolutions[lessonId]] : [];
}
