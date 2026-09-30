import type { LessonId } from "./drawersense-curriculum";

/** Student prompts adapted from Rev G's eight canvases; no worked answers. */
export const drawerSenseAttempts: Record<LessonId, { steps: string[]; notesPrompt: string }> = {
  "2.0A": {
    steps: [
      "On the top track, draw a brief opening, closing, a longer opening, then closing and reopening. Use one shared time axis.",
      "Predict the reminder on the lower track. Where does each fresh wait begin? Mark the 20 s target and explain what closing resets.",
      "Label this as an ideal behaviour prediction. Distinguish the drawer sensor, board power switch and sound-mute control.",
    ],
    notesPrompt: "Brief opening: …\nLong opening: …\nClosing and reopening: …\nPower, sensor and mute do different jobs because …",
  },
  "2.0B": {
    steps: [
      "Write one job inside each box: Power, Sense, Wait/reset, Decide/mute and Alert.",
      "Draw information arrows. What two pieces of information does Decide need? Include a route that does not pass through Wait/reset.",
      "Use a different line style for power. Draw a supply AND a return for the active blocks. Explain which device reads the printed QR link.",
    ],
    notesPrompt: "The five jobs: …\nThe decision needs … and …\nSignal arrows mean …\nSupply and return connections mean …\nThe printed QR link is read by …",
  },
  "2.1A": {
    steps: [
      "Start with a source, switch and test load. Trace a complete current loop when the contact is closed; mark the break when it is open.",
      "Keep the same terminal positions in both SPDT views. Use the specified part's terminal view to label source, VCC, return and R17; then draw each selected contact.",
      "Explain the ON load path and OFF discharge path separately. Before building, obtain an actual switch photo or drawing from your tutor and verify its terminals with power-off continuity; do not infer them from lever direction.",
    ],
    notesPrompt: "Specified switch and drawing view: …\nON contact and complete load loop: …\nOFF contact and discharge loop: …\nSource feed when OFF: …\nActual terminal verification still needed / observed: …",
  },
  "2.1B": {
    steps: [
      "Trace both endpoints of each load before calling the connection series or parallel. Mark the two shared nodes.",
      "Place a voltmeter across the correct nodes. Add the source-current arrow and one arrow in each load branch.",
      "Predict each branch voltage, then write the source-current equation with the supplied branch values. Keep V and mA labels separate.",
    ],
    notesPrompt: "Load 1 endpoints: …\nLoad 2 endpoints: …\nVoltmeter connections: …\nPredicted branch voltage, with reason: …\nSource-current equation and answer with unit: …",
  },
  "2.1C": {
    steps: [
      "Sketch two capacitor plates and mark separated charge; distinguish the plates from the wires that connect them to the circuit.",
      "Place C1 on the supply drawing. Add polarity, capacitance and voltage rating as separate labels, then explain its bulk-support job.",
      "Place one local capacitor at each IC and trace a short supply-and-return loop. Explain why position matters even though the schematic shares rail nodes.",
    ],
    notesPrompt: "Charge on the two plates: …\nC1 endpoints and polarity: …\nCapacitance / voltage rating / operating rail: …\nBulk support versus local bypass: …\nMarkings on my actual part still to verify: …",
  },
  "2.1D": {
    steps: [
      "Make a known-values table: current, pulse duration, allowed voltage fall and minimum actual capacitance. Convert mA, ms and µF into A, s and F yourself.",
      "Write the charge equation before using a calculator. Rearrange once for minimum capacitance and once for voltage fall; show both substitutions with units.",
      "Compare the predicted fall with the limit. State the ideal model's assumption and one measurement needed on the real circuit. Round only your final results.",
    ],
    notesPrompt: "Given quantity → SI value:\nI = … mA = … A\nΔt = … ms = … s\nΔVmax = … V\nCmin actual = … µF = … F\n\nMinimum-C equation, substitution and result: …\nDroop equation, substitution and result: …\nComparison with limit: …\nAssumption and measurement still needed: …",
  },
  "2.1E": {
    steps: [
      "Draw the selected OFF loop through C1 and R17. Place the disconnected source outside it; trace the complete return to C1.",
      "Predict how voltage and current change after OFF. Calculate the initial resistor current and the ideal RC time constant using base units.",
      "Sketch a smooth voltage-decay curve. Label the starting voltage, one time constant and about five time constants. Explain why this short discharge is not the reminder's 20 s wait.",
    ],
    notesPrompt: "OFF loop and isolated source: …\nInitial current equation, substitution and unit: …\nTime constant equation, substitution and unit: …\nVoltage at one time constant: …\nShape of the decay and why it is not the reminder timer: …",
  },
  "2.1F": {
    steps: [
      "For the illustrated fault example, mark near and far probe points and predict a power-off continuity check. The example readings are not your own measurements.",
      "Plan the supervised power-stage test using the switch, R17, C1 and a tutor-approved test load. Write the stop conditions before applying power.",
      "During the supervised build, record actual settings and readings with units and probe locations. Keep missing evidence marked 'not measured' and bring the corrected circuit and board photo to your tutor.",
    ],
    notesPrompt: "Fault-example prediction and continuity check: …\nStop conditions: …\n\nActual bench evidence — leave unmeasured entries as 'not measured':\nSource setting (V): …\nTutor-set current limit (mA): …\nNear VCC-to-GND reading (V): …\nFar VCC-to-GND reading (V): …\nPower-off switch continuity in both positions: …\nOFF observation and instrument / method: …\nCorrected circuit and photo reference: …\nItems awaiting tutor inspection: …",
  },
};
