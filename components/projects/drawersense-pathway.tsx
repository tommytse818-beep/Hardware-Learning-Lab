"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { DrawerSenseCanvas, getDrawerSenseCanvasMarkup } from "@/components/projects/drawersense-prediction";
import { DrawerSenseTaskDiagram } from "@/components/projects/drawersense-task-diagram";
import { DrawerSenseVideo } from "@/components/projects/drawersense-video";
import { drawerSenseLessons, getLessonRecall, type Question, type QuestionResponse, type LessonId } from "@/lib/drawersense-curriculum";
import { emptyLessonWork, hasWork, sanitizeProgress, type LessonWork, type PathwayProgress, type Point } from "@/lib/drawersense-progress";
import { captureDrawerSenseDrafts, mergeDrawerSenseDrafts, reconcileDrawerSenseProgress } from "@/lib/drawersense-drafts";
import { drawerSenseAttempts } from "@/lib/drawersense-attempts";
import { HllTutorPanel } from "@/components/hll-tutor-panel";
import styles from "./drawersense-pathway.module.css";

type Stage = "learn" | "practice" | "solution" | "transfer";
type Feedback = { correct: boolean; hint?: string };
type WorkedDiagram = { title: string; columns: string[]; rows: string[][]; note: string };
type PublishedRecording = { videoSrc: string; captionsSrc?: string; transcriptSrc?: string };
type PublishedMedia = Partial<Record<LessonId, Partial<Record<"concept" | "solution", PublishedRecording>>>>;
type Props = { canReview: boolean; storageScope: string; initialProgress: PathwayProgress; initialLesson: LessonId; media: PublishedMedia };

export function DrawerSensePathway({ canReview, storageScope, initialProgress, initialLesson, media }: Props) {
  const [active, setActive] = useState(() => Math.max(0, drawerSenseLessons.findIndex((item) => item.id === initialLesson)));
  const [stage, setStage] = useState<Stage>("learn");
  const [progress, setProgress] = useState<PathwayProgress>(initialProgress);
  const [serverProgress, setServerProgress] = useState<PathwayProgress>(initialProgress);
  const [loaded, setLoaded] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const [solution, setSolution] = useState<string[]>([]);
  const [workedDiagram, setWorkedDiagram] = useState<WorkedDiagram | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [conceptFinished, setConceptFinished] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const checkHeading = useRef<HTMLHeadingElement>(null);
  const progressRef = useRef<PathwayProgress>(initialProgress);
  const accountRef = useRef<PathwayProgress>(initialProgress);
  const inFlight = useRef(false);
  const storageKey = `drawersense-account-drafts-v3:${storageScope}`;
  const lesson = drawerSenseLessons[active];
  const work = progress[lesson.id] || emptyLessonWork();
  const attempt = drawerSenseAttempts[lesson.id];
  const checksReady = canReview || hasWork(work);
  const canResumeAttempt = Boolean(work.notes.trim() || work.strokes.length || Object.keys(work.answers).length);
  const checksCorrect = lesson.questions.every((q) => work.correct.includes(q.id));
  const solutionReady = canReview || (checksCorrect && hasWork(work));
  const frontier = drawerSenseLessons.findIndex((item) => !serverProgress[item.id]?.complete);
  const unlocked = frontier < 0 ? drawerSenseLessons.length - 1 : frontier;
  const completeCount = drawerSenseLessons.filter((item) => serverProgress[item.id]?.complete).length;

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const parsed = JSON.parse(localStorage.getItem(storageKey) || "{}");
        const restored = mergeDrawerSenseDrafts(initialProgress, parsed);
        accountRef.current = initialProgress;
        setServerProgress(initialProgress);
        progressRef.current = restored;
        setProgress(restored);
        localStorage.setItem(storageKey, JSON.stringify(captureDrawerSenseDrafts(restored, initialProgress)));
      } catch { setNotice("Saved work could not be read. You can still work here and download a copy."); }
      setLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [storageKey, initialProgress]);

  function update(changes: Partial<LessonWork>) {
    const current = progressRef.current;
    const next = { ...current, [lesson.id]: { ...(current[lesson.id] || emptyLessonWork()), ...changes } };
    progressRef.current = next;
    setProgress(next);
    try { localStorage.setItem(storageKey, JSON.stringify(captureDrawerSenseDrafts(next, accountRef.current))); }
    catch { setNotice("Browser storage is unavailable. Your work is kept in this tab only; download a copy before leaving."); }
    return next[lesson.id];
  }

  function go(index: number) {
    if (inFlight.current || index < 0 || index >= drawerSenseLessons.length || (!canReview && index > unlocked)) return;
    setActive(index); setStage("learn"); setFeedback({}); setSolution([]); setWorkedDiagram(null); setNotice(""); setConceptFinished(false);
    requestAnimationFrame(() => { heading.current?.focus(); heading.current?.scrollIntoView({block:"start", behavior:"instant"}); });
  }

  function changeStage(next: Stage) {
    setStage(next);
    requestAnimationFrame(() => { heading.current?.focus(); heading.current?.scrollIntoView({block:"start", behavior:"instant"}); });
  }

  async function submit(action: string, extra: Record<string, unknown> = {}) {
    if (inFlight.current) return null;
    inFlight.current = true;
    setPending(true); setNotice("");
    try {
      const result = await fetch("/projects/open-guard-mini/checkpoint", {
        method: "POST", headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(30_000),
        body: JSON.stringify({ lessonId: lesson.id, action, work: progressRef.current[lesson.id] || emptyLessonWork(), ...extra }),
      });
      const data = await result.json();
      if (!result.ok) throw new Error(data.error || "Could not check this activity. Try again.");
      if (data.progress) {
        const authoritative = sanitizeProgress(data.progress);
        const merged = reconcileDrawerSenseProgress(progressRef.current, accountRef.current, authoritative);
        accountRef.current = authoritative;
        setServerProgress(authoritative);
        progressRef.current = merged;
        setProgress(merged);
        try { localStorage.setItem(storageKey, JSON.stringify(captureDrawerSenseDrafts(merged, authoritative))); }
        catch { setNotice("Your account update is saved. Browser drafts could not be stored; download any unfinished changes before leaving."); }
      }
      return data;
    } catch (error) {
      setNotice(error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")
        ? "The account check took too long. Your draft is still here. Try again when your connection is ready."
        : error instanceof Error ? error.message : "Connection problem. Your working is still here.");
      return null;
    }
    finally { inFlight.current = false; setPending(false); }
  }

  async function check(question: Question, transfer = false) {
    const value = transfer ? work.transfer : work.answers[question.id];
    const result = await submit(transfer ? "transfer" : "check", {questionId:question.id, response:value});
    if (!result) return;
    setFeedback((old) => ({...old, [question.id]:result}));
    if (transfer && result.correct && lesson.id === "2.1F") setNotice(canReview
      ? "Correct in teaching preview. No learner progress or bench approval was recorded."
      : "Online checks saved. Your tutor must inspect the physical build before it is approved.");
  }

  async function openSolution() {
    const result = await submit("solution");
    if (!result) return;
    setSolution(result.solution); setWorkedDiagram(result.diagram ?? null); changeStage("solution");
  }

  async function markReviewed() {
    const result = await submit("review", { reviewed: true });
    if (result) update({ reviewed: true });
  }

  function answer(question: Question, value: QuestionResponse, transfer = false) {
    setFeedback((old) => { const next={...old}; delete next[question.id]; return next; });
    if (transfer) update({transfer:value});
    else update({answers:{...work.answers, [question.id]:value}});
  }

  function download() {
    const escape = (text: string) => text.replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
    const safeProgress = sanitizeProgress(progressRef.current);
    const rows = drawerSenseLessons.filter((item) => safeProgress[item.id]).map((item) => {
      const entry = safeProgress[item.id];
      const paths = entry.strokes.map((points) => `<polyline points="${points.map((p)=>p.join(",")).join(" ")}" fill="none" stroke="#0f172a" stroke-width="3"/>`).join("");
      return `<section><h2>${escape(item.id+" · "+item.title)}</h2><p>${escape(item.drawingTask)}</p><pre>${escape(entry.notes)}</pre><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 320" style="width:100%;border:1px solid #ccc">${getDrawerSenseCanvasMarkup(item.id)}${paths}</svg>${entry.overrideReason ? `<p>Tutor remediation: ${escape(entry.overrideReason)}</p>` : ""}<p>Drawing and physical build require human review.</p></section>`;
    }).join("");
    const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>DrawerSense working</title><style>body{font:17px/1.6 system-ui;max-width:850px;margin:40px auto;padding:20px}pre{white-space:pre-wrap;font:inherit}section{break-after:page}svg{background:white}</style><h1>DrawerSense · My working</h1><p>Saved ${escape(new Date().toLocaleString())}. Local learning evidence, not a bench approval.</p>${rows}</html>`;
    const url=URL.createObjectURL(new Blob([html],{type:"text/html"}));
    const link=document.createElement("a"); link.href=url; link.download="DrawerSense-my-working.html"; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  return <section id="section-2" className={styles.pathway} aria-labelledby="pathway-title">
    <div className={styles.container}>
      <div className={styles.intro}>
        <div><p className={styles.eyebrow}>WEEK 2 / DESIGN & BUILD</p><h1 id="pathway-title">Think it through.<br/><span>Then build it.</span></h1><p>Define DrawerSense’s behaviour in 2.0, then investigate its power block in 2.1. Make a prediction, show your working, and test your understanding before moving on.</p></div>
        <div className={styles.overview}><span className={styles.badge}>REV G · 8 ACTIVITIES</span><p><strong>2.0</strong> The system’s jobs</p><p><strong>2.1</strong> A power block you can explain</p><small>Concept → your attempt → worked solution → transfer check</small><progress value={completeCount} max={8} aria-label="Activities completed"/><small>{completeCount} of 8 checkpoints complete · final bench review required</small></div>
      </div>
      <div className={styles.context}><span>{canReview ? "Teaching view" : "Your learning workspace"}</span><p>{canReview ? "Browse every published activity and solution. You can preview a recording in this browser; it is not published to students. Staff previews do not record student completion." : "Learn, make your attempt, compare the method, then apply the idea. Checked answers and submitted working are saved to your account; unfinished drafts stay in this browser."}</p></div>
      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Week 2 activities">
          {(["2.0", "2.1"] as const).map((section)=><div key={section}><h3>{section} · {section==="2.0"?"System design":"Power subsystem"}</h3><div className={styles.lessonLinks}>{drawerSenseLessons.map((item,index)=>item.section===section && <button key={item.id} disabled={pending || (!canReview && index>unlocked)} aria-current={index===active?"step":undefined} onClick={()=>go(index)}><span className={styles.lessonId}>{item.id}</span><span>{item.title}<small>{progress[item.id]?.complete?"Checked · available to review":index>unlocked&&!canReview?"Complete the previous activity":"Read, attempt & explain"}</small></span></button>)}</div></div>)}
          <button className={styles.secondary} onClick={download} disabled={!loaded || !Object.keys(progress).length}>Download my working ↓</button>
          {canReview && <p className={styles.small}>Staff access: all published lessons and worked solutions are available. Previewing does not complete student work.</p>}
        </aside>
        <article className={styles.workspace} aria-busy={pending}>
          <header className={styles.lessonHeader}><p className={styles.eyebrow}>ACTIVITY {lesson.id} / {active+1} OF 8</p><h3 ref={heading} tabIndex={-1}>{lesson.title}</h3><p>{lesson.summary}</p></header>
          <ol className={styles.stageList} aria-label="Activity stages">{([['learn','Learn'],['practice','Your attempt'],['solution','Compare'],['transfer','Transfer']] as [Stage,string][]).map(([key,label],index)=><li key={key} aria-current={stage===key?"step":undefined}><button disabled={pending || !loaded || (key==='practice'&&!canReview&&!conceptFinished&&!canResumeAttempt) || (key==='solution'&&!solutionReady) || (key==='transfer'&&!canReview&&(!solutionReady||!work.reviewed))} onClick={()=>{if(key==='solution')void openSolution();else changeStage(key);}}><span>{index+1}</span>{label}</button></li>)}</ol>
          <div className={styles.assistant}><HllTutorPanel context={{courseSlug:"open-guard-mini",lessonId:lesson.id,lessonTitle:`${lesson.id} · ${lesson.title}`,stage,helpMode:stage==="solution"&&solution.length>0?"worked-review":"hint-only"}}/></div>
          <div key={`${lesson.id}-${stage}`} className={styles.body}>
            {notice && <p className={styles.notice} role="alert">{notice}</p>}
            {!loaded ? <p>Opening your workspace…</p> : <>
              {stage==="learn" && <>
                <DrawerSenseVideo lessonId={lesson.id} kind="concept" canAttach={canReview} published={media[lesson.id]?.concept} onCompleted={()=>{setConceptFinished(true);changeStage("practice");}}/>
                <RecallLinks lessonId={lesson.id}/>
                <ConceptSequence key={lesson.id} paragraphs={lesson.concept} onComplete={()=>{setConceptFinished(true);changeStage("practice");}}/>
                <AnalogousRehearsal lessonId={lesson.id}/>
                <DrawerSenseTaskDiagram lessonId={lesson.id}/>
                {lesson.givens && <GivenValues values={lesson.givens}/>}
                {lesson.formula && <p className={styles.formula}>{lesson.formula}</p>}
                <div className={styles.stop}><span>PAUSE & PREDICT</span><p>First trace, sketch or calculate. Save your prediction to open the two checks; the worked solution follows your completed attempt.</p></div>
              </>}
              {stage==="practice" && <>
                <p className={styles.lead}>Think on the page before choosing an answer.</p><p>Use the task diagram and prompts to make a prediction. You can draw, write, or combine both. The checks come after you save your working.</p>
                <RecallLinks lessonId={lesson.id}/>
                <DrawerSenseTaskDiagram lessonId={lesson.id}/>
                <details className={styles.recall}><summary>Revisit the explanation and equation</summary>{lesson.concept.map((p)=><p key={p}>{p}</p>)}{lesson.formula && <p className={styles.formula}>{lesson.formula}</p>}</details>
                {lesson.givens && <GivenValues values={lesson.givens}/>}
                <section className={styles.working}>
                  <p className={styles.eyebrow}>FIRST · MAKE A PREDICTION</p><h4>Your sketch & working</h4>
                  <p>{lesson.drawingTask}</p><ol className={styles.solution}>{attempt.steps.map((step)=><li key={step}>{step}</li>)}</ol>
                  <SketchPad lessonId={lesson.id} strokes={work.strokes} onChange={(strokes)=>update({strokes,saved:false})}/>
                  <details className={styles.recall}><summary>Prompts for my written working</summary>{attempt.notesPrompt.split("\n").filter(Boolean).map((line,index)=><p key={index}>{line}</p>)}</details>
                  <label className={styles.notesLabel} htmlFor={`notes-${lesson.id}`}>Written working or a text description of your drawing</label>
                  <textarea id={`notes-${lesson.id}`} value={work.notes} maxLength={12000} rows={7} placeholder="Write your own prediction here. Explain the connections or show the equation, substitutions and units. Use the writing prompts above if you need a starting point." onChange={(e)=>update({notes:e.target.value,saved:false})}/>
                  <details className={styles.recall}><summary>Check my evidence before saving</summary><ul>{lesson.workChecklist.map((item)=><li key={item}>{item}</li>)}</ul></details>
                  <p className={styles.small}>A text explanation is an alternative to drawing. This saves a draft in this browser; opening the worked solution submits it to your account. Saving confirms an attempt, not its accuracy. Your tutor reviews the reasoning and practical evidence.</p>
                  <button className={styles.secondary} onClick={()=>{if(!hasWork({...work,saved:true})){setNotice("Add your own prediction first: a sketch or a short written explanation (at least 20 characters).");return;}update({saved:true});setNotice("");requestAnimationFrame(()=>{checkHeading.current?.focus();checkHeading.current?.scrollIntoView({block:"start",behavior:"instant"});});}}>{hasWork(work)?"✓ Prediction saved · return to checks":"Save prediction & open checks →"}</button>
                </section>
                {checksReady ? <section aria-label="Check your prediction"><p className={styles.eyebrow}>THEN · CHECK YOUR UNDERSTANDING</p><h4 ref={checkHeading} tabIndex={-1}>Compare your prediction with two checks.</h4><p>Choose an explanation for a concept question. For a calculation, enter your number and select its unit. Keep your reasoning above, including any corrections.</p>{lesson.questions.map((question,index)=><QuestionField key={question.id} question={question} number={index+1} value={work.answers[question.id]} feedback={feedback[question.id] || (work.correct.includes(question.id)?{correct:true}:undefined)} pending={pending} onChange={(value)=>answer(question,value)} onCheck={()=>check(question)}/>)}</section> : <div className={styles.stop}><span>CHECKS OPEN AFTER YOUR PREDICTION</span><p>Save your sketch or written working above. You do not need a perfect answer to make a first attempt.</p></div>}
                <div className={styles.unlock}><p>{canReview?"Teaching preview · worked solution available":solutionReady?"Your attempt is ready to compare.":`${work.correct.length} of 2 checks correct · ${work.saved?"working saved":"save your working"}`}</p><button className={styles.primary} disabled={!solutionReady || pending} onClick={()=>openSolution()}>Open the worked solution →</button></div>
                <RecoveryGuide lessonId={lesson.id} hasIncorrectAttempt={Object.values(feedback).some((item)=>!item.correct)}/>
              </>}
              {stage==="solution" && <>
                <DrawerSenseVideo lessonId={lesson.id} kind="solution" canAttach={canReview} published={media[lesson.id]?.solution} onCompleted={()=>setNotice("The solution recording has ended. Compare it with your own working before trying the transfer check.")}/>
                <DrawerSenseTaskDiagram lessonId={lesson.id}/>
                {workedDiagram && <WorkedDiagramTable diagram={workedDiagram}/>}
                <p className={styles.eyebrow}>WORKED SOLUTION · WRITTEN COMPANION</p><h4>Compare with your own reasoning.</h4><p>{media[lesson.id]?.solution ? "Use the published recording and these written steps together to review your attempt." : "The solution recording is in preparation. Use these complete written steps to review your attempt."}</p><ol className={styles.solution}>{solution.map((step,index)=><li key={index}>{step}</li>)}</ol><p className={styles.small}>A matching numerical answer does not establish that a drawing or real build is correct. Keep your original working for tutor review.</p><label className={styles.reviewCheck}><input type="checkbox" checked={work.reviewed} disabled={pending || work.reviewed} onChange={()=>void markReviewed()}/> I have compared the method with my working and identified any corrections.</label><div className={styles.actions}><button className={styles.secondary} onClick={()=>changeStage("practice")}>Review my attempt</button><button className={styles.primary} disabled={pending || (!canReview && !work.reviewed)} onClick={()=>changeStage("transfer")}>Try a new situation →</button></div>
              </>}
              {stage==="transfer" && <>
                <p className={styles.eyebrow}>TRANSFER CHECK</p><h4>Can you use the idea again?</h4><p>Read the changed conditions carefully. This new question checks understanding before the next activity opens.</p><QuestionField question={lesson.transfer} value={work.transfer} feedback={feedback[lesson.transfer.id] || ((work.complete || work.onlineReady)?{correct:true}:undefined)} pending={pending} onChange={(value)=>answer(lesson.transfer,value,true)} onCheck={()=>check(lesson.transfer,true)}/><button className={styles.secondary} disabled={pending} onClick={()=>openSolution()}>Revisit the worked solution</button>{!canReview && (work.complete || (lesson.id === "2.1F" && (work.onlineReady || feedback[lesson.transfer.id]?.correct))) && <div className={styles.completion}><h4>{active===7?(work.complete?"Bench checkpoint approved.":"Online checks complete. Next: tutor inspection."):"You’re ready for the next idea."}</h4>{active<7?<><p>Your checked work is saved to your account when you return.</p><button className={styles.primary} disabled={pending} onClick={()=>go(active+1)}>Continue to {drawerSenseLessons[active+1].id} →</button></>:<><p>Before Section 2.2, show your tutor the actual build, corrected circuit and breadboard photograph. They must inspect the wiring and measurements in person.</p><ul><li>Source setting and tutor-chosen current limit</li><li>Near and far rail voltages with units</li><li>Both continuity-verified switch states</li><li>OFF behaviour and the observation method</li></ul><strong>{work.complete ? "Tutor approval recorded · next lessons are in preparation" : "Awaiting physical sign-off · Section 2.2 remains closed"}</strong><p className={styles.small}>Your submitted working and online checks are saved to your account for review. Show your tutor the real circuit and measurement evidence; only a human review can approve this bench checkpoint.</p><button className={styles.secondary} onClick={download}>Download work for my tutor</button></>}</div>}
              </>}
            </>}
          </div>
        </article>
      </div>
    </div>
  </section>;
}

function GivenValues({values}:{values:{label:string;value:string}[]}) {
  return <div className={styles.givens}><p className={styles.eyebrow}>GIVEN VALUES & ASSUMPTIONS</p><dl>{values.map((item)=><div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></div>;
}

function WorkedDiagramTable({diagram}:{diagram:WorkedDiagram}) {
  return <section className={styles.recallCard} aria-label={diagram.title}>
    <p className={styles.eyebrow}>AUTHORISED WORKED DIAGRAM DATA</p><h4>{diagram.title}</h4>
    <div className="overflow-x-auto"><table className="min-w-full border-collapse text-left text-sm"><thead><tr>{diagram.columns.map((column)=><th key={column} className="border-b border-slate-300 p-2">{column}</th>)}</tr></thead><tbody>{diagram.rows.map((row,index)=><tr key={index}>{row.map((cell,cellIndex)=><td key={cellIndex} className="border-b border-slate-200 p-2">{cell}</td>)}</tr>)}</tbody></table></div>
    <p className={styles.small}>{diagram.note}</p>
  </section>;
}

function ConceptSequence({paragraphs,onComplete}:{paragraphs:string[];onComplete:()=>void}) {
  const [index,setIndex]=useState(0);
  const last = index === paragraphs.length - 1;
  return <section className={styles.conceptSequence} aria-label="Concept explained one idea at a time">
    <div className={styles.ideaHeader}><span>ONE IDEA AT A TIME</span><span>{index+1} / {paragraphs.length}</span></div>
    <p key={index} className={styles.ideaText} aria-live="polite">{paragraphs[index]}</p>
    <div className={styles.ideaControls}>
      <button className={styles.secondary} disabled={index===0} onClick={()=>setIndex(index-1)}>← Previous idea</button>
      <div className={styles.ideaDots} aria-hidden="true">{paragraphs.map((_,i)=><i key={i} data-active={i===index}/>)}</div>
      <button className={last?styles.primary:styles.secondary} onClick={()=>{if(last)onComplete();else setIndex(index+1);}}>{last?"Pause & make a prediction →":"Next idea →"}</button>
    </div>
  </section>;
}

function RecallLinks({lessonId}:{lessonId:LessonId}) {
  return <details className={styles.recall}>
    <summary>Before you begin · recall the fundamentals</summary>
    <p>Use these short reminders whenever you need them. Practise the separate examples, then apply the idea to this activity.</p>
    {getLessonRecall(lessonId).map((card)=><section className={styles.recallCard} key={card.id}>
      <h4>{card.title}</h4>
      {card.body.map((paragraph)=><p key={paragraph}>{paragraph}</p>)}
      {card.formula && <p className={styles.formula}>{card.formula}</p>}
      <p className={styles.small}>{card.coverageNote}</p>
      {card.href && <a href={card.href} target="_blank" rel="noopener noreferrer">Related Week 1 lesson ↗</a>}
    </section>)}
  </details>;
}

function AnalogousRehearsal({lessonId}:{lessonId:LessonId}) {
  const card = getLessonRecall(lessonId)[0];
  if (!card) return null;
  return <section className={styles.recallCard} aria-label="Different example before your prediction">
    <p className={styles.eyebrow}>DIFFERENT EXAMPLE · NOT THE ASSESSED ANSWER</p>
    <h4>{card.title}</h4>
    {card.body.map((paragraph)=><p key={paragraph}>{paragraph}</p>)}
    {card.formula && <p className={styles.formula}>{card.formula}</p>}
    <p className={styles.small}>Explain this example in your own words, then use the next diagram and givens for your separate assessed prediction.</p>
  </section>;
}

function RecoveryGuide({lessonId,hasIncorrectAttempt}:{lessonId:LessonId;hasIncorrectAttempt:boolean}) {
  const card = getLessonRecall(lessonId)[0];
  return <details className={styles.recall} open={hasIncorrectAttempt}>
    <summary>{hasIncorrectAttempt ? "Next steps after this attempt" : "Stuck? Get help without losing your work"}</summary>
    <ol>
      <li>Read the hint under the question and identify the named quantity, connection or state to inspect.</li>
      <li>Return to the different example{card ? ` “${card.title}”` : " above"} and write its first equation or trace one complete path.</li>
      <li>Try the same first step with the assessed givens, keeping your original work visible so you can mark the correction.</li>
    </ol>
    <p>This help does not complete the activity or reveal its worked solution. You can retry without a penalty; ask your tutor to review the exact step if you are still stuck.</p>
  </details>;
}

function QuestionField({question,number,value,feedback,pending,onChange,onCheck}:{question:Question;number?:number;value?:QuestionResponse;feedback?:Feedback;pending:boolean;onChange:(value:QuestionResponse)=>void;onCheck:()=>void}) {
  const numeric = typeof value==="object" ? value : {value:"",unit:question.units?.[0]?.value || ""};
  const answered = question.kind === "choice"
    ? typeof value === "string" && value !== ""
    : numeric.value.trim() !== "" && (!question.conclusion || numeric.conclusion !== undefined);
  return <fieldset className={styles.question} disabled={pending || feedback?.correct}>
    <legend>{number ? `Check ${number}` : "New situation"}<span>{question.kind === "numeric" ? "CALCULATE" : "CHOOSE ONE"}</span></legend>
    <p className={styles.prompt} id={`prompt-${question.id}`}>{question.prompt}</p>
    {question.kind === "choice" ? <div className={styles.choices}>
      {question.choices?.map((choice, index) => <label key={choice} data-selected={value === String(index)}>
        <input type="radio" name={question.id} value={index} checked={value === String(index)} onChange={() => onChange(String(index))}/><span>{choice}</span>
      </label>)}
    </div> : <>
      <div className={styles.numeric}>
        <label>Value<input type="text" inputMode="decimal" value={numeric.value} aria-describedby={`prompt-${question.id} precision-${question.id}`} placeholder="Your number" maxLength={40} onChange={(e) => onChange({...numeric, value:e.target.value})}/></label>
        <label>Unit<select value={numeric.unit} onChange={(e) => onChange({...numeric, unit:e.target.value})}>{question.units?.map((unit) => <option key={unit.value} value={unit.value}>{unit.label}</option>)}</select></label>
      </div>
      <p id={`precision-${question.id}`} className={styles.small}>{question.precision} Enter the number only; select the unit separately. Scientific notation such as 2e-3 is accepted.</p>
      {question.conclusion && <div role="group" aria-label={question.conclusion.prompt}>
        <p>{question.conclusion.prompt}</p>
        <div className={styles.choices}>{question.conclusion.choices.map((choice,index) => <label key={choice} data-selected={numeric.conclusion === String(index)}>
          <input type="radio" name={`${question.id}-conclusion`} checked={numeric.conclusion === String(index)} onChange={() => onChange({...numeric, conclusion:String(index)})}/><span>{choice}</span>
        </label>)}</div>
      </div>}
    </>}
    <button className={styles.secondary} disabled={!answered || pending || feedback?.correct} onClick={onCheck}>{feedback?.correct ? "✓ Answer checked" : "Check my answer"}</button>
    {feedback && <p className={feedback.correct ? styles.correct : styles.hint} role="status">{feedback.correct ? "Correct. Keep the reasoning in your working." : `Try again. ${feedback.hint || question.hint}`}</p>}
  </fieldset>;
}

function SketchPad({lessonId,strokes,onChange}:{lessonId:LessonId;strokes:Point[][];onChange:(strokes:Point[][])=>void}) {
  const drawing=useRef(false);
  const current=useRef<Point[]>([]);
  const [draft,setDraft]=useState<Point[]>([]);
  const [drawingMode,setDrawingMode]=useState(true);
  function point(event:PointerEvent<SVGSVGElement>):Point { const rect=event.currentTarget.getBoundingClientRect(); return [Math.max(0,Math.min(720,(event.clientX-rect.left)*720/rect.width)),Math.max(0,Math.min(320,(event.clientY-rect.top)*320/rect.height))]; }
  function finish() { if(!drawing.current)return; drawing.current=false; if(current.current.length>1)onChange([...strokes,current.current]);current.current=[];setDraft([]); }
  return <div className={styles.sketch}>
    <div><span>{drawingMode?"Draw with a pen, mouse or touch":"Scroll sideways to move the canvas"}</span><button type="button" aria-pressed={!drawingMode} onClick={()=>setDrawingMode(!drawingMode)}>{drawingMode?"Move canvas":"Draw on canvas"}</button><button type="button" disabled={!strokes.length} onClick={()=>onChange(strokes.slice(0,-1))}>Undo last stroke</button></div>
    <section className={styles.canvasScroll} tabIndex={0} role="region" aria-label="Drawing canvas viewport. Scroll sideways to see the full guide; select Move canvas to pan with touch.">
      <svg viewBox="0 0 720 320" style={{touchAction:drawingMode?"none":"pan-x"}} role="img" aria-label="Your drawing canvas. Use the written working field below as a keyboard alternative." onPointerDown={(event)=>{if(!drawingMode||event.button!==0||strokes.length>=200)return;event.currentTarget.setPointerCapture(event.pointerId);drawing.current=true;current.current=[point(event)];setDraft(current.current);}} onPointerMove={(event)=>{if(!drawing.current||current.current.length>=2000)return;current.current=[...current.current,point(event)];setDraft(current.current);}} onPointerUp={finish} onPointerCancel={finish}><DrawerSenseCanvas lessonId={lessonId}/>{[...strokes,draft].map((stroke,index)=><polyline key={index} points={stroke.map((p)=>p.join(",")).join(" ")} fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>)}</svg>
    </section>
    {strokes.length>=200 && <p className={styles.small}>The canvas has reached 200 strokes. Undo a stroke to keep drawing, or continue in the written working field.</p>}
  </div>;
}
