import "server-only";

import Link from "next/link";

import type { Course, Lesson } from "@/lib/courses";
import { drawerSenseLessons } from "@/lib/drawersense-curriculum";
import type { PathwayProgress } from "@/lib/drawersense-progress";
import type { ViewerRole } from "@/lib/viewer";
import styles from "./course-learning-panel.module.css";

export type CourseLearningPanelProps = {
  course: Course;
  completedLessonSlugs: string[];
  databaseReady: boolean;
  weekTwoProgress?: PathwayProgress;
  weekTwoReady: boolean;
  canPreviewAll: boolean;
  role?: ViewerRole;
};

const plannedWeekTwo = [
  { id: "2.2", title: "Sense", description: "Turn the drawer position into a clear electrical signal." },
  { id: "2.3A", title: "Reset", description: "Define when counting starts and when it clears." },
  { id: "2.3B", title: "Wait", description: "Connect clock cycles, counting and the reminder target." },
  { id: "2.3C", title: "Hold", description: "Keep the reminder active until the drawer closes." },
  { id: "2.4", title: "Decide & mute", description: "Check the conditions for the light and sound separately." },
  { id: "2.5", title: "Alert", description: "Understand the drivers, LED current and buzzer connections." },
  { id: "2.6", title: "Integrate", description: "Test the complete behaviour and record corrections." },
];

const plannedWeekThree = [
  { title: "Bring your tested circuit", description: "Review the breadboard evidence and corrected paper schematic." },
  { title: "Understand symbols and footprints", description: "Match the physical part, schematic symbol and PCB footprint. Check any SnapEDA or manufacturer import against its datasheet." },
  { title: "Capture the full schematic", description: "Connect the circuit in KiCad, check pin-to-pad mapping and review electrical-rule checks." },
  { title: "Place and route the PCB", description: "Arrange parts by function, preserve supply and return paths, and connect the board." },
  { title: "Check and review", description: "Review design rules, dimensions, labels and the physical fit before a tutor's final review." },
];

/**
 * Server-rendered on purpose: full course objects contain answer keys and must
 * not become props of a client overview. Native radio controls switch the visible
 * week without sending course answers or saved working to the browser.
 */
export function CourseLearningPanel({
  course,
  completedLessonSlugs,
  databaseReady,
  weekTwoProgress = {},
  weekTwoReady,
  canPreviewAll,
  role = "student",
}: CourseLearningPanelProps) {
  const completed = new Set(databaseReady ? completedLessonSlugs : []);
  const foundationComplete = course.lessons.every((lesson) => completed.has(lesson.slug));
  const weekTwoAvailable = canPreviewAll || (databaseReady && foundationComplete && weekTwoReady);
  const firstFoundation = course.lessons.find((lesson) => !completed.has(lesson.slug));
  const firstWeekTwo = drawerSenseLessons.find((lesson) => !weekTwoProgress[lesson.id]?.complete);
  const foundationCount = course.lessons.filter((lesson) => completed.has(lesson.slug)).length;
  const weekTwoCount = databaseReady
    ? drawerSenseLessons.filter((lesson) => weekTwoProgress[lesson.id]?.complete).length
    : 0;
  const totalPublished = course.lessons.length + drawerSenseLessons.length;
  const completedCount = foundationCount + weekTwoCount;
  const initialWeek = foundationComplete && weekTwoAvailable ? "two" : "one";
  const baseHref = `/courses/${course.slug}`;
  const nextHref = firstFoundation
    ? `${baseHref}/lessons/${firstFoundation.slug}`
    : weekTwoAvailable && firstWeekTwo
      ? `${baseHref}/week-2?lesson=${encodeURIComponent(firstWeekTwo.id)}`
      : null;
  const nextTitle = firstFoundation?.title ?? (weekTwoAvailable ? firstWeekTwo?.title : undefined);
  const sectionZero = course.lessons.filter((lesson) => lesson.section === "0");
  const sectionOne = course.lessons.filter((lesson) => lesson.section.startsWith("1."));
  const radioName = `learning-week-${course.slug}`;

  function foundationRow(lesson: Lesson) {
    const index = course.lessons.findIndex((item) => item.slug === lesson.slug);
    const missing = course.lessons.slice(0, index).find((item) => !completed.has(item.slug));
    const available = canPreviewAll || !missing;
    return <LessonRow
      key={lesson.slug}
      id={lesson.section}
      title={lesson.title}
      summary={lesson.summary}
      meta={lesson.humanReviewRequired || lesson.delivery === "Live checkpoint" ? "Tutor checkpoint" : lesson.section === "0" ? "Start here" : "Learn & practise"}
      complete={completed.has(lesson.slug)}
      current={firstFoundation?.slug === lesson.slug}
      href={available ? `${baseHref}/lessons/${lesson.slug}` : undefined}
      lockedReason={missing ? `Complete ${missing.section} before opening this lesson.` : undefined}
    />;
  }

  return <div className={styles.panel}>
    <nav className={styles.topbar} aria-label="Course navigation">
      <Link href="/dashboard"><span aria-hidden="true">←</span> Your dashboard</Link>
      <Link href={course.projectHref}>Project overview <span aria-hidden="true">↗</span></Link>
    </nav>

    <header className={styles.hero}>
      <div>
        <p className={styles.eyebrow}>YOUR LEARNING PATHWAY</p>
        <h1>One idea.<br/><span>A circuit you understand.</span></h1>
        <p className={styles.heroCopy}>DrawerSense takes you from the fundamentals to a working breadboard, then into KiCad. Follow one lesson at a time and keep the evidence of your thinking.</p>
        <div className={styles.heroMeta}><span>{course.level}</span><span>F4–F5 · ages 14–16</span><span>Three-week programme</span></div>
      </div>
      <div className={styles.progressCard}>
        <div className={styles.progressLabel}><span>{canPreviewAll ? "Teaching access" : "Your progress"}</span><span className={styles.accountMark}><StatusIcon kind={canPreviewAll || databaseReady ? "complete" : "review"}/>{canPreviewAll ? "Full published course" : databaseReady ? "Account saved" : "Not synced"}</span></div>
        <p className={styles.progressNumber}>{canPreviewAll ? totalPublished : completedCount}{!canPreviewAll && <span> / {totalPublished}</span>}</p>
        <p className={styles.progressCaption}>{canPreviewAll ? "published checkpoints available" : "published checkpoints complete"}</p>
        {!canPreviewAll && <progress className={styles.progressBar} value={completedCount} max={totalPublished} aria-label="Published checkpoints completed"/>}
        <p className={styles.progressNote}>{canPreviewAll ? "Browse the course freely. Learner progress and practical approvals are managed separately." : "Future lessons are shown as planned. Practical approval remains with your tutor."}</p>
      </div>
    </header>

    {!databaseReady && <p className={styles.notice} role="status">Your saved progress could not be confirmed. Refresh to try again, or ask your tutor for help. Later student lessons stay locked until progress is available.</p>}

    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <fieldset className={styles.weekPicker}>
          <legend>Your three weeks</legend>
          <input className={`${styles.choice} ${styles.weekOneChoice}`} type="radio" name={radioName} id={`${radioName}-one`} defaultChecked={initialWeek === "one"}/>
          <label className={styles.weekButton} htmlFor={`${radioName}-one`}>
            <span className={styles.weekNumber}>01</span><span><strong>Understand</strong><small>Induction & fundamentals</small><span className={styles.weekState}>{foundationCount} / {course.lessons.length} complete</span></span>
          </label>
          <input className={`${styles.choice} ${styles.weekTwoChoice}`} type="radio" name={radioName} id={`${radioName}-two`} defaultChecked={initialWeek === "two"}/>
          <label className={styles.weekButton} htmlFor={`${radioName}-two`}>
            <span className={styles.weekNumber}>02</span><span><strong>Design & build</strong><small>Your working breadboard</small><span className={styles.weekState}>{weekTwoAvailable ? `${weekTwoCount} / 8 published activities` : "Opens after Week 1"}</span></span>
          </label>
          <input className={`${styles.choice} ${styles.weekThreeChoice}`} type="radio" name={radioName} id={`${radioName}-three`}/>
          <label className={styles.weekButton} htmlFor={`${radioName}-three`}>
            <span className={styles.weekNumber}>03</span><span><strong>Create in KiCad</strong><small>Schematic to PCB</small><span className={styles.weekState}>Planned</span></span>
          </label>
        </fieldset>

        <section className={styles.nextCard} aria-labelledby="course-next-step">
          <p className={styles.eyebrow}>{canPreviewAll ? "COURSE ACCESS" : "YOUR NEXT STEP"}</p>
          <h2 id="course-next-step">{canPreviewAll ? "Browse and support." : nextTitle ? "Keep building your understanding." : "Keep your evidence ready."}</h2>
          <p>{canPreviewAll ? "Your staff account can open every published lesson. Planned material is not published yet." : nextTitle ?? "Your tutor reviews the practical evidence before the next stage is released."}</p>
          {nextHref && <Link className={styles.continueLink} href={nextHref}>{canPreviewAll ? "Browse from the beginning" : foundationCount + weekTwoCount > 0 ? "Continue learning" : "Begin induction"}<span aria-hidden="true">→</span></Link>}
          {canPreviewAll && role === "teacher" && <Link className={styles.staffLink} href="/teacher">View learner progress <span aria-hidden="true">↗</span></Link>}
          {canPreviewAll && role === "admin" && <Link className={styles.staffLink} href="/admin">Manage schools & access <span aria-hidden="true">↗</span></Link>}
        </section>
        <p className={styles.sidebarNote}>{canPreviewAll ? "Student accounts follow the checkpoint order. Staff access does not mark a student's work complete." : "Complete the earlier checkpoints to open the next lesson. You can revisit completed work."}</p>
      </aside>

      <div className={styles.content}>
        <section className={`${styles.weekPanel} ${styles.weekOnePanel}`} aria-labelledby="week-one-title">
          <WeekHeader label="WEEK 1" title="Understand the fundamentals." id="week-one-title" description="Start with the complete circuit, then build the language and reasoning you will use at the bench." badge={`${foundationCount} of ${course.lessons.length} complete`}/>
          {sectionZero.length > 0 && <div className={styles.lessonGroup}><div className={styles.groupHeading}><h3>Before you begin</h3><span>Induction</span></div><ol className={styles.lessonList}>{sectionZero.map(foundationRow)}</ol></div>}
          <div className={styles.lessonGroup}><div className={styles.groupHeading}><h3>One idea at a time</h3><span>Week 1</span></div><ol className={styles.lessonList}>{sectionOne.map(foundationRow)}</ol></div>
          <div className={styles.noteCard}><StatusIcon kind="review"/><div><h3>A checkpoint is more than a score.</h3><p>The final Week 1 review brings your explanations and practical preparation together. Your tutor confirms the human review before Week 2 opens.</p></div></div>
        </section>

        <section className={`${styles.weekPanel} ${styles.weekTwoPanel}`} aria-labelledby="week-two-title">
          <WeekHeader label="WEEK 2" title="Make it work. Explain why." id="week-two-title" description="Sketch, calculate and test each block. Bring your own attempt to the worked solution, then try a new situation." badge={weekTwoAvailable ? "8 published activities" : "Complete Week 1 first"}/>
          <div className={styles.flowStrip} aria-label="Activity sequence"><span>Learn the idea</span><b aria-hidden="true">→</b><span>Make your attempt</span><b aria-hidden="true">→</b><span>Compare & apply</span></div>
          {(["2.0", "2.1"] as const).map((section) => <div className={styles.lessonGroup} key={section}>
            <div className={styles.groupHeading}><h3>{section === "2.0" ? "2.0 · Define the system" : "2.1 · Build the power block"}</h3><span>{section === "2.0" ? "2 activities" : "6 activities"}</span></div>
            <ol className={styles.lessonList}>{drawerSenseLessons.filter((lesson) => lesson.section === section).map((lesson) => {
              const index = drawerSenseLessons.findIndex((item) => item.id === lesson.id);
              const missing = drawerSenseLessons.slice(0, index).find((item) => !weekTwoProgress[item.id]?.complete);
              const available = canPreviewAll || (weekTwoAvailable && !missing);
              const lockedReason = !weekTwoAvailable ? "Complete the induction and all Week 1 checkpoints first." : missing ? `Complete ${missing.id} before opening this activity.` : undefined;
              return <LessonRow key={lesson.id} id={lesson.id} title={lesson.title} summary={lesson.summary} meta="Learn · attempt · compare · transfer" complete={databaseReady && !!weekTwoProgress[lesson.id]?.complete} current={weekTwoAvailable && firstWeekTwo?.id === lesson.id} href={available ? `${baseHref}/week-2?lesson=${encodeURIComponent(lesson.id)}` : undefined} lockedReason={lockedReason}/>;
            })}</ol>
          </div>)}
          <div className={styles.noteCard}><StatusIcon kind="review"/><div><h3>The bench is a separate checkpoint.</h3><p>The written lessons and checks are available. Concept and Pencil videos are still to be recorded. A tutor inspects your real circuit and measurements before you move into sensing.</p></div></div>
          <div className={styles.futureGroup}>
            <div className={styles.groupHeading}><h3>The next blocks</h3><span>Planned · not published</span></div>
            <p className={styles.groupDescription}>This is the proposed continuation of the same circuit. These lessons are still being developed.</p>
            <ol className={styles.plannedList}>{plannedWeekTwo.map((item) => <li key={item.id}><span className={styles.plannedId}>{item.id}</span><div><h4>{item.title}</h4><p>{item.description}</p></div><span className={styles.plannedBadge}>{!canPreviewAll && <StatusIcon kind="locked"/>}Planned</span></li>)}</ol>
          </div>
        </section>

        <section className={`${styles.weekPanel} ${styles.weekThreePanel}`} aria-labelledby="week-three-title">
          <WeekHeader label="WEEK 3" title="From circuit to your own PCB." id="week-three-title" description="Use the corrected, tested circuit as the starting point for a KiCad schematic and board layout." badge="Planned · not published"/>
          <div className={styles.weekThreeIntro}><span className={styles.blueprintIcon} aria-hidden="true"><CircuitIcon/></span><div><p className={styles.eyebrow}>THE NEXT ENGINEERING STAGE</p><h3>Draw it precisely.<br/>Place it thoughtfully.</h3><p>The schematic comes first. A downloaded symbol or footprint still needs its pins, dimensions and pad mapping checked.</p></div></div>
          <ol className={styles.designStages}>{plannedWeekThree.map((item, index) => <li key={item.title}><span className={styles.designIndex} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.description}</p></div><span className={styles.plannedBadge}>{!canPreviewAll && <StatusIcon kind="locked"/>}Planned</span></li>)}</ol>
          <div className={styles.noteCard}><StatusIcon kind="review"/><div><h3>Your layout is a learning outcome.</h3><p>Manufacturing a personal PCB is an optional later step with a separate review. This outline does not claim that the lessons, design checks or manufacturing approval are finished.</p></div></div>
        </section>
      </div>
    </div>
  </div>;
}

function WeekHeader({ label, title, id, description, badge }: { label: string; title: string; id: string; description: string; badge: string }) {
  return <header className={styles.weekHeader}><div><p className={styles.eyebrow}>{label}</p><h2 id={id}>{title}</h2><p>{description}</p></div><span className={styles.headerBadge}>{badge}</span></header>;
}

function LessonRow({ id, title, summary, meta, complete, current, href, lockedReason }: { id: string; title: string; summary: string; meta: string; complete: boolean; current: boolean; href?: string; lockedReason?: string }) {
  const state = !href ? "locked" : complete ? "complete" : current ? "current" : "available";
  const label = state === "locked" ? "Locked" : state === "complete" ? "Complete" : state === "current" ? "Up next" : "Available";
  const content = <>
    <span className={styles.lessonNumber}>{complete && href ? <StatusIcon kind="complete"/> : id}</span>
    <span className={styles.lessonCopy}><span className={styles.lessonMeta}>{meta}</span><span className={styles.lessonTitle}>{title}</span><span className={styles.lessonSummary}>{summary}</span>{!href && lockedReason && <span className={styles.lockReason}>{lockedReason}</span>}</span>
    <span className={styles.lessonEnd}><span className={styles.lessonStatus}>{state === "locked" && <StatusIcon kind="locked"/>}{label}</span>{href && <span className={styles.rowArrow} aria-hidden="true">↗</span>}</span>
  </>;
  return <li>{href ? <Link href={href} className={styles.lessonRow} data-state={state}>{content}</Link> : <div className={styles.lessonRow} data-state={state} aria-disabled="true">{content}</div>}</li>;
}

function StatusIcon({ kind }: { kind: "locked" | "complete" | "review" }) {
  return <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "locked" ? <><rect x="6" y="10" width="12" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/></> : kind === "complete" ? <path d="m5 12 4 4L19 6"/> : <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h3"/></>}
  </svg>;
}

function CircuitIcon() {
  return <svg viewBox="0 0 160 160" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="27" y="24" width="106" height="112" rx="12"/><rect x="59" y="57" width="42" height="46" rx="5"/><path d="M69 45v12m11-12v12m11-12v12M69 103v12m11-12v12m11-12v12M47 69h12m-12 11h12m-12 11h12m42-22h12m-12 11h12m-12 11h12M27 45h18v-9m88 82h-18v10"/><circle cx="44" cy="118" r="5"/><circle cx="115" cy="42" r="5"/></svg>;
}
