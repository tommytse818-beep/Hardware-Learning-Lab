import "server-only";

type ChoiceFormativeCheck = {
  kind: "choice";
  id: string;
  lessonSlug: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  hint: string;
  feedback: string;
};

type NumericFormativeCheck = {
  kind: "numeric";
  id: string;
  lessonSlug: string;
  prompt: string;
  unit: string;
  answer: number;
  tolerance: number;
  domain: "positive" | "nonnegative";
  hint: string;
  feedback: string;
};

export type FormativeCheckDefinition = ChoiceFormativeCheck | NumericFormativeCheck;

const checks: FormativeCheckDefinition[] = [
  { kind: "choice", id: "hll-f-13-series", lessonSlug: "voltage-current-resistance", prompt: "R1 joins A to B and R2 joins B to C, with no other branch at B. How do their currents compare?", options: ["They are equal.", "The second is zero.", "Each is half the source current.", "Their names make them different."], correctIndex: 0, hint: "Count how many routes leave node B.", feedback: "There is no branch at B, so the same loop current passes through both resistors." },
  { kind: "choice", id: "hll-f-13-parallel", lessonSlug: "voltage-current-resistance", prompt: "R1 and R2 both connect between nodes A and B. A is held 4 V above B. What is true?", options: ["Each has 2 V.", "Each has 4 V, but their currents may differ.", "They are series.", "The larger resistor has more voltage."], correctIndex: 1, hint: "Compare both endpoints of each resistor.", feedback: "Both branches share the same two nodes, so they have the same voltage while their currents may differ." },
  { kind: "numeric", id: "hll-f-13-current-sum", lessonSlug: "voltage-current-resistance", prompt: "Two branches draw 0.8 mA and 1.7 mA. What current enters their junction in amperes?", unit: "A", answer: 0.0025, tolerance: 1e-8, domain: "positive", hint: "Add in mA first, then divide by 1000.", feedback: "The branch sum is 2.5 mA, which is 0.0025 A." },
  { kind: "choice", id: "hll-f-13-neither", lessonSlug: "voltage-current-resistance", prompt: "R1 connects A-B, R2 connects B-C, and R3 connects B-D. Are R1 and R2 simple series or parallel?", options: ["Series", "Parallel", "Neither", "Every pair must be one"], correctIndex: 2, hint: "Check for a branch at B and then compare both endpoints.", feedback: "The branch at B prevents simple series, and the two resistors do not share both endpoints." },
  { kind: "numeric", id: "hll-f-14-prefix", lessonSlug: "ohms-law-led-resistor", prompt: "Convert 3 mA to amperes.", unit: "A", answer: 0.003, tolerance: 1e-9, domain: "positive", hint: "Milli means one thousandth.", feedback: "3 mA is 3/1000 A, or 0.003 A." },
  { kind: "numeric", id: "hll-f-14-charge", lessonSlug: "ohms-law-led-resistor", prompt: "A 22 µF capacitor has 2.0 V across it. Find Q in coulombs.", unit: "C", answer: 4.4e-5, tolerance: 1e-8, domain: "positive", hint: "Convert microfarads to farads, then use Q = CV.", feedback: "Q = 22×10⁻⁶ × 2 = 44×10⁻⁶ C." },
  { kind: "numeric", id: "hll-f-14-minimum-capacitance", lessonSlug: "ohms-law-led-resistor", prompt: "A capacitor is 47 µF ±20%. What is its minimum capacitance in farads?", unit: "F", answer: 3.76e-5, tolerance: 1e-8, domain: "positive", hint: "The minimum is 80% of nominal.", feedback: "47 µF × 0.80 = 37.6 µF = 0.0000376 F." },
  { kind: "numeric", id: "hll-f-16-tau", lessonSlug: "pull-resistors-floating-input", prompt: "An isolated RC example uses 2.2 kΩ and 10 µF. Find τ in seconds.", unit: "s", answer: 0.022, tolerance: 1e-6, domain: "positive", hint: "Convert both prefixes before multiplying R by C.", feedback: "2200 × 0.000010 = 0.022 s. This is not the reminder delay." },
  { kind: "numeric", id: "hll-f-16-lowpass-dc", lessonSlug: "pull-resistors-floating-input", prompt: "An ideal unloaded low-pass receives a constant 2 V input. What is OUT after it fully settles?", unit: "V", answer: 2, tolerance: 1e-6, domain: "positive", hint: "At steady DC, consider the voltage across the capacitor.", feedback: "The ideal settled output across C approaches the constant input: 2 V." },
  { kind: "numeric", id: "hll-f-16-highpass-dc", lessonSlug: "pull-resistors-floating-input", prompt: "An ideal unloaded high-pass receives a constant 2 V input. What is OUT after it fully settles?", unit: "V", answer: 0, tolerance: 1e-6, domain: "nonnegative", hint: "The temporary response decays; consider the voltage across R at steady DC.", feedback: "The settled output across R is 0 V. Zero is valid for this question." },
  { kind: "choice", id: "hll-f-17-and", lessonSlug: "logic-gates-truth-tables", prompt: "A two-input AND gate has A = 1 and B = 0. What is its output?", options: ["1", "0", "Half the supply", "Two bits"], correctIndex: 1, hint: "AND needs every required input to be HIGH.", feedback: "The output is 0 because both inputs are not 1." },
  { kind: "choice", id: "hll-f-17-not", lessonSlug: "logic-gates-truth-tables", prompt: "A NOT gate receives logic 0. What is its ideal output?", options: ["0", "1", "A clock count", "Load current"], correctIndex: 1, hint: "NOT reverses its one input.", feedback: "NOT changes logic 0 to logic 1." },
  { kind: "choice", id: "hll-f-17-counter", lessonSlug: "logic-gates-truth-tables", prompt: "Which block tracks how many relevant clock events occurred after reset?", options: ["Pull-up", "Counter", "Battery holder", "Load transistor"], correctIndex: 1, hint: "Separate making repeated events from accumulating them.", feedback: "An oscillator supplies events; a counter tracks the specified events." },
  { kind: "choice", id: "hll-f-17-transistor", lessonSlug: "logic-gates-truth-tables", prompt: "What is the transistor's role in the taught load-switch example?", options: ["Supply all load energy", "Create an exact delay", "Let a control signal control a source-powered load path", "Work with any pin order"], correctIndex: 2, hint: "Separate the control information from the load's energy path.", feedback: "The control signal controls a load-current path supplied by the power source." },
];

const checksById = new Map(checks.map((check) => [check.id, check]));

export function getFormativeCheck(id: string, lessonSlug: string) {
  const check = checksById.get(id);
  return check?.lessonSlug === lessonSlug ? check : null;
}

export function getFormativeCheckView(id: string, lessonSlug: string) {
  const check = getFormativeCheck(id, lessonSlug);
  if (!check) throw new Error(`Unknown formative check ${id} for ${lessonSlug}`);
  return check.kind === "choice"
    ? { id: check.id, kind: check.kind, prompt: check.prompt, options: check.options }
    : { id: check.id, kind: check.kind, prompt: check.prompt, unit: check.unit };
}