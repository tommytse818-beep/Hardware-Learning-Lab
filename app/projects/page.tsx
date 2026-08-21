import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Projects",
};

const projectRoadmap = [
  {
    theme: "Smart living",
    projects: [
      ["Smart Door Lab", "Pilot build", "Logic, ESP32, measurement, PCB"],
      ["Automatic Night Light", "Planned", "LDR, threshold, transistor"],
      ["Smart Locker Alarm", "Planned", "State machine, reed switch, RFID"],
    ],
  },
  {
    theme: "Sustainability and climate",
    projects: [
      ["Plant-care Monitor", "Next candidate", "ADC, calibration, thresholds"],
      ["Room Climate Station", "Planned", "Temperature, humidity, logging"],
      ["Mini Weather Telemetry", "Planned", "Sensors, packets, dashboard"],
    ],
  },
  {
    theme: "Health and movement",
    projects: [
      ["Reaction Timer", "Planned", "Timing, interrupts, statistics"],
      ["Movement Reminder", "Planned", "Accelerometer, rule-based detection"],
      ["Sound Visualiser", "Planned", "Sampling, filtering, display"],
    ],
  },
  {
    theme: "Space and communications",
    projects: [
      ["Classroom Communicator", "Planned", "ESP-NOW, addressing, packets"],
      ["Voice Recorder", "Advanced roadmap", "I²S, sampling, microSD"],
      ["Telemetry Console", "Advanced roadmap", "Sensors, packet integrity"],
    ],
  },
];

export default function ProjectsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
          Course roadmap
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
          Essential products students can be proud to keep.
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          The roadmap shows breadth without pretending every course is already
          complete. Smart Door Lab is the focused first product.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {projectRoadmap.map((group) => (
          <section
            key={group.theme}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-slate-950">
              {group.theme}
            </h2>
            <div className="mt-5 divide-y divide-slate-100">
              {group.projects.map(([name, status, learning]) => (
                <div
                  key={name}
                  className="grid gap-2 py-4 sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900">{name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{learning}</p>
                  </div>
                  <span className="h-fit rounded-full bg-slate-100 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-slate-600">
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-slate-950 p-6 text-white sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Open the flagship prototype</h2>
          <p className="mt-2 text-sm text-slate-300">
            Test its dashboard, lesson navigation, tutor preview and quiz.
          </p>
        </div>
        <Link
          href="/courses/smart-door-lab"
          className="mt-5 inline-flex rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 sm:mt-0"
        >
          View Smart Door Lab
        </Link>
      </div>
    </div>
  );
}
