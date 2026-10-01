"use client";

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import type { TutorGuidance } from "@/lib/courses";
import { HLL_IMAGE_ACCEPT, validateHllImage, type HllTutorContext } from "@/lib/hll-tutor-contract";
import styles from "./hll-tutor-panel.module.css";
import { HllTutorMessage } from "./hll-tutor-message";

export type HllTutorPanelProps = {
  context: HllTutorContext;
  guidance?: TutorGuidance;
};

const stageLabels = { learn: "Learn", practice: "Your attempt", solution: "Compare", transfer: "Transfer" };
type ChatTurn = { question: string; reply: string; lessonId: string; lessonTitle: string; sourceIds: string[]; imageName?: string };

function HllRobot() {
  return (
    <svg viewBox="0 0 230 204" aria-hidden="true" focusable="false" className={styles.robot}>
      <image href="/logo.svg" width="700" height="204" />
    </svg>
  );
}

type Registration = (value: HllTutorPanelProps) => () => void;
const TutorContext = createContext<Registration | null>(null);

/** Lessons update context; the course layout owns the single continuous assistant. */
export function HllTutorPanel({ context, guidance }: HllTutorPanelProps) {
  const register = useContext(TutorContext);
  const { courseSlug, lessonId, lessonTitle, stage, helpMode } = context;
  useEffect(() => register?.({ context: { courseSlug, lessonId, lessonTitle, stage, helpMode }, guidance }),
    [register, courseSlug, lessonId, lessonTitle, stage, helpMode, guidance]);
  return null;
}

export function HllTutorWorkspace({ children }: { children: ReactNode }) {
  const [lesson, setLesson] = useState<HllTutorPanelProps | null>(null);
  const activeRegistration = useRef<symbol | null>(null);
  const register = useCallback<Registration>((value) => {
    const token = Symbol();
    activeRegistration.current = token;
    setLesson(value);
    return () => { if (activeRegistration.current === token) setLesson(null); };
  }, []);
  const context = useMemo(() => lesson?.context, [lesson]);
  const id = useId();
  const launcher = useRef<HTMLButtonElement>(null);
  const questionInput = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const imageRevision = useRef(0);
  const [open, setOpen] = useState(false);
  const wasOpen = useRef(false);
  const [question, setQuestion] = useState("");
  const [attachment, setAttachment] = useState<{ name: string; url: string; file: File } | null>(null);
  const [imageError, setImageError] = useState("");
  const [checkingImage, setCheckingImage] = useState(false);
  const [connection, setConnection] = useState<{ configured: boolean; images: boolean; pilot: boolean } | null>(null);
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  const [chatError, setChatError] = useState("");
  const activeRequest = useRef<AbortController | null>(null);
  const chatBody = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    void fetch("/api/hll-tutor", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Sign in again to use the assistant.");
        const result = await response.json();
        setConnection({ configured: result.configured === true, images: result.images === true, pilot: result.pilot === true });
      }).catch(() => { if (!controller.signal.aborted) setChatError("The assistant connection could not be checked. Reopen it to retry."); });
    return () => controller.abort();
  }, [open]);
  useEffect(() => () => activeRequest.current?.abort(), []);
  useEffect(() => { if (chatBody.current) chatBody.current.scrollTop = chatBody.current.scrollHeight; }, [chat, pending]);

  async function sendQuestion() {
    if (activeRequest.current || !question.trim() || !context?.courseSlug || !context.lessonId || checkingImage) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    const submitted = question.trim();
    const current = context;
    setPending(submitted);
    setChatError("");
    try {
      const history = chat.filter((turn) => turn.lessonId === current.lessonId).slice(-3)
        .flatMap((turn) => [{ role: "user", content: turn.question }, { role: "assistant", content: turn.reply.slice(0, 4000) }]);
      while (history.reduce((sum, item) => sum + item.content.length, 0) > 12000) history.splice(0, 2);
      let images;
      if (attachment) {
        const bytes = new Uint8Array(await attachment.file.arrayBuffer());
        let binary = "";
        for (let index = 0; index < bytes.length; index += 8192) binary += String.fromCharCode(...bytes.subarray(index, index + 8192));
        images = [{ mimeType: attachment.file.type, base64: btoa(binary) }];
      }
      const response = await fetch("/api/hll-tutor", { method: "POST", headers: { "Content-Type": "application/json" },
        signal: controller.signal, body: JSON.stringify({ requestId: crypto.randomUUID(), lesson: { courseSlug: current.courseSlug, lessonId: current.lessonId }, message: submitted, history, images }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The reply could not be completed.");
      if (typeof result.text !== "string" || !Array.isArray(result.sourceIds)) throw new Error("The reply could not be read.");
      setChat((turns) => [...turns.slice(-49), { question: submitted, reply: result.text, lessonId: current.lessonId!, lessonTitle: current.lessonTitle, sourceIds: result.sourceIds, imageName: attachment?.name }]);
      setQuestion("");
      removeImage();
    } catch (error) {
      setChatError(controller.signal.aborted ? "Reply stopped. Your question is kept below." : error instanceof Error ? error.message : "The assistant is unavailable. Try again shortly.");
    } finally { activeRequest.current = null; setPending(null); }
  }

  useEffect(() => {
    const url = attachment?.url;
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [attachment]);

  useEffect(() => () => { imageRevision.current += 1; }, []);

  function showPanel() {
    setOpen(true);
  }

  function closePanel() {
    setOpen(false);
  }

  useEffect(() => {
    if (open) questionInput.current?.focus();
    else if (wasOpen.current) launcher.current?.focus();
    wasOpen.current = open;
  }, [open]);

  function removeImage() {
    imageRevision.current += 1;
    setAttachment(null);
    setImageError("");
    setCheckingImage(false);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const revision = ++imageRevision.current;
    setCheckingImage(true);
    setImageError("");
    const error = await validateHllImage(file);
    if (imageRevision.current !== revision) return;
    setCheckingImage(false);
    if (error) {
      setImageError(error);
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    setAttachment({ name: file.name, url: URL.createObjectURL(file), file });
  }

  return (
    <TutorContext.Provider value={register}>
    <div className={styles.root} data-open={open}>
      <div className={styles.content}>{children}</div>
      <button ref={launcher} type="button" className={styles.launcher} onClick={showPanel}
        hidden={open}
        aria-label="Open HLL learning assistant" title="HLL learning assistant"
        aria-expanded={open} aria-controls={`${id}-dialog`}>
        <span className={styles.robotBadge}><HllRobot /></span>
      </button>

      <aside id={`${id}-dialog`} className={styles.dialog} inert={!open} aria-hidden={!open}
        onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); closePanel(); } }}
        aria-labelledby={`${id}-title`} aria-describedby={`${id}-status`}>
        <header className={styles.header}>
          <span className={styles.robotBadge}><HllRobot /></span>
          <div className={styles.headerText}><h2 id={`${id}-title`}>HLL assistant</h2><p>{connection?.pilot ? "Staff pilot · under review" : connection?.configured ? "School AI · learning support" : "Model connection pending"}</p></div>
          <button type="button" className={styles.newChat} disabled={Boolean(pending)} onClick={() => { setChat([]); setChatError(""); setQuestion(""); removeImage(); }} aria-label="Start a new chat">New</button>
          <button type="button" className={styles.close} aria-label="Close learning assistant" onClick={closePanel}>×</button>
        </header>

        <div ref={chatBody} className={styles.body}>
          {context && <div className={styles.context}>
            <span>{stageLabels[context.stage]} · {context.helpMode === "worked-review" ? "Review support" : "Hints first"}</span>
            <p>Alongside you: {context.lessonTitle}</p>
          </div>}
          {!chat.length && <div className={styles.welcome}><HllRobot /><h3>Let’s work it out together.</h3><p>Ask about a concept, share your working, or add a circuit image. Keep your lesson open beside this conversation.</p></div>}
          <div className={styles.status} id={`${id}-status`}>
            <span className={styles.statusDot} aria-hidden="true" />
            <div><strong>{connection?.pilot ? "Teacher review in progress" : connection?.configured ? "Think it through, one step at a time" : "Model connection pending"}</strong><p>{!context?.lessonId ? "Open a lesson to ask a question alongside it." : connection?.pilot ? "This model is being evaluated and can give incorrect explanations. Student access is not enabled." : connection?.configured ? "AI can make mistakes. Check values and units against your lesson; ask your teacher when unsure." : "You can prepare a draft below. Replies need the school’s AI server to be connected."}</p></div>
          </div>
          <div className={styles.messages} role="log" aria-label="HLL conversation" aria-live="polite">
            {chat.map((turn, index) => <div key={index} className={styles.turn}>
              <p className={styles.messageContext}>{turn.lessonTitle}</p>
              <div className={styles.userMessage}><strong>You</strong><p>{turn.question}</p>{turn.imageName && <small>Image: {turn.imageName}</small>}</div>
              <div className={styles.assistantMessage}><strong>HLL</strong><HllTutorMessage text={turn.reply} /><div className={styles.sources}>{turn.sourceIds.map((source) => <a key={source} href={source}>Course reference ↗</a>)}</div></div>
            </div>)}
            {pending && <div className={styles.userMessage}><strong>You</strong><p>{pending}</p><span role="status">HLL is working through your question…</span></div>}
          </div>
          {chatError && <p className={styles.error} role="alert">{chatError}</p>}

          {lesson?.guidance && <details className={styles.guidance}>
            <summary>Lesson notes</summary>
            <p className={styles.small}>Prepared course notes — not AI replies.</p>
            <dl><dt>A starting hint</dt><dd>{lesson.guidance.hint}</dd><dt>A simpler explanation</dt><dd>{lesson.guidance.simpleExplanation}</dd><dt>What to check</dt><dd>{lesson.guidance.measurementPrompt}</dd></dl>
          </details>}
          <p className={styles.reviewNote}>Your teacher reviews practical evidence. Chat replies do not complete checkpoints.</p>
        </div>

          <div className={styles.draft}>
            <label htmlFor={`${id}-question`}>Your question</label>
            <p id={`${id}-question-help`}>Describe what you tried and the step you want help with.</p>
            <textarea ref={questionInput} id={`${id}-question`} value={question} disabled={Boolean(pending)} onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (connection?.configured) void sendQuestion(); } }}
              aria-describedby={`${id}-question-help ${id}-privacy`} maxLength={4000} rows={2}
              placeholder="Ask HLL…" />

            <details className={styles.attachmentControls}>
              <summary>Add a circuit image</summary>
              <label className={styles.fileLabel} htmlFor={`${id}-image`}>Choose an image</label>
              <input ref={fileInput} id={`${id}-image`} type="file" accept={HLL_IMAGE_ACCEPT} disabled={Boolean(pending) || !connection?.images} onChange={(event) => void selectImage(event)}
                aria-describedby={`${id}-image-help${imageError ? ` ${id}-image-error` : ""}`} aria-invalid={imageError ? true : undefined} />
              <p id={`${id}-image-help`}>{connection?.images ? "PNG, JPEG or WebP · up to 5 MB · one image. Reattach it for follow-up image analysis." : "Image questions need a connected vision model."}</p>
            </details>
            {checkingImage && <p className={styles.small} role="status">Checking image…</p>}
            {imageError && <p className={styles.error} id={`${id}-image-error`} role="alert">{imageError}</p>}
            {attachment && <figure className={styles.preview}>
              {/* A browser-local blob preview must not pass through a remote image optimiser. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={attachment.url} alt="Your selected circuit image draft" onError={() => { removeImage(); setImageError("This image could not be displayed. Export a new PNG, JPEG or WebP image."); }} />
              <figcaption><span>{attachment.name}</span><button type="button" disabled={Boolean(pending)} onClick={removeImage}>Remove image</button></figcaption>
            </figure>}

            <div className={styles.draftFooter}>
              <span className={styles.small}>{question.length.toLocaleString()} / 4,000 characters</span>
              {pending ? <button type="button" className={styles.send} onClick={() => activeRequest.current?.abort()}>Stop</button> : <button type="button" className={styles.send} onClick={() => void sendQuestion()} disabled={!connection?.configured || !context?.lessonId || !question.trim() || checkingImage} aria-describedby={`${id}-status`}>Send <span aria-hidden="true">↑</span></button>}
            </div>
            <details className={styles.privacy}><summary>About this chat</summary><p id={`${id}-privacy`}>Send shares your question, recent context and selected image with the school’s AI server. This chat stays in this tab and clears on refresh or when you leave the course. It is not used for automatic training.</p></details>
          </div>
      </aside>
    </div>
    </TutorContext.Provider>
  );
}
