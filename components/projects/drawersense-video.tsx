"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./drawersense-video.module.css";

type PublishedRecording = { videoSrc: string; captionsSrc?: string; transcriptSrc?: string };
type Props = { lessonId: string; kind: "concept" | "solution"; canAttach: boolean; published?: PublishedRecording; onCompleted: () => void };
type Recording = { video: File; captions?: File };
type Preview = { video: string; captions?: string; name: string };

function recordingStore(key: string, value?: Recording): Promise<Recording | undefined> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("Browser storage is unavailable."));
    const open = indexedDB.open("drawersense-recording-preview-v1", 1);
    open.onupgradeneeded = () => open.result.createObjectStore("recordings");
    open.onerror = () => reject(open.error);
    open.onblocked = () => reject(new Error("Another tab is holding browser storage open. Close it and retry."));
    open.onsuccess = () => {
      const db = open.result;
      const transaction = db.transaction("recordings", value ? "readwrite" : "readonly");
      const store = transaction.objectStore("recordings");
      const request = value ? store.put(value, key) : store.get(key);
      transaction.oncomplete = () => { db.close(); resolve(value ?? request.result); };
      transaction.onabort = () => { db.close(); reject(transaction.error ?? request.error); };
      transaction.onerror = () => { db.close(); reject(transaction.error ?? request.error); };
    };
  });
}

function PlannedRecording({ lessonId, kind }: Pick<Props, "lessonId" | "kind">) {
  return <div className={styles.planned}>
    <span className={styles.play} aria-hidden="true">▷</span>
    <span className={styles.eyebrow}>{lessonId} · {kind === "concept" ? "Learn the idea" : "Compare the method"}</span>
    <h3 className={styles.title}>{kind === "concept" ? "Concept recording" : "Worked solution recording"}</h3>
    <p>Recording in preparation; use the written lesson.</p>
    <code className={styles.filename}>{lessonId}_{kind === "concept" ? "concept" : "pencil"}.mp4</code>
  </div>;
}

export function DrawerSenseVideo(props: Props) {
  if (props.published) return <>
    <section className={styles.card} aria-label={`${props.lessonId} ${props.kind} published recording`}>
      <video className={styles.video} src={props.published.videoSrc} controls playsInline preload="metadata" onEnded={props.onCompleted}>
        {props.published.captionsSrc && <track kind="captions" src={props.published.captionsSrc} srcLang="en" label="English captions" default />}
      </video>
      <div className={styles.tools}>
        <p className={styles.notice}>Published course recording</p>
        <p className={styles.help}>Playback supports the written lesson and does not mark this activity complete.</p>
        {props.published.transcriptSrc && <a className={styles.button} href={props.published.transcriptSrc}>Open transcript</a>}
      </div>
    </section>
    {props.canAttach && <details className={styles.card}><summary className={styles.notice}>Staff local preview · browser only, not published</summary><LocalRecording {...props} published={undefined} /></details>}
  </>;
  if (!props.canAttach) return <section className={styles.card} aria-label={`${props.lessonId} ${props.kind} recording`}>
    <PlannedRecording lessonId={props.lessonId} kind={props.kind} />
  </section>;
  return <LocalRecording key={`${props.lessonId}-${props.kind}`} {...props} />;
}

function LocalRecording({ lessonId, kind, onCompleted }: Props) {
  const key = `${lessonId}-${kind}`;
  const generation = useRef(0);
  const recording = useRef<Recording | undefined>(undefined);
  const urls = useRef<string[]>([]);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const display = useCallback((value: Recording) => {
    const video = URL.createObjectURL(value.video);
    const captions = value.captions ? URL.createObjectURL(value.captions) : undefined;
    urls.current.forEach((url) => URL.revokeObjectURL(url));
    urls.current = captions ? [video, captions] : [video];
    recording.current = value;
    setPreview({ video, captions, name: value.video.name });
  }, []);

  useEffect(() => {
    const current = ++generation.current;
    recordingStore(key).then((value) => {
      if (current === generation.current && value?.video instanceof Blob) display(value);
    }).catch(() => {
      if (current === generation.current) setError("Saved recordings could not be read. You can still choose a recording for this visit.");
    }).finally(() => {
      if (current === generation.current) setLoading(false);
    });
    return () => {
      generation.current += 1;
      urls.current.forEach((url) => URL.revokeObjectURL(url));
      urls.current = [];
    };
  }, [key, display]);

  async function attach(file: File | undefined, captions = false) {
    if (!file || loading || busy) return;
    if (!file.size || (captions ? !/\.vtt$/i.test(file.name) : !/\.(mp4|webm)$/i.test(file.name))) {
      setError(captions ? "Choose a non-empty WebVTT (.vtt) caption file." : "Choose a non-empty MP4 or WebM video.");
      return;
    }
    if (file.size > (captions ? 5 : 250) * 1024 * 1024) {
      setError(captions ? "Use a caption file smaller than 5 MB." : "This recording exceeds 250 MB. Export a smaller MP4 or WebM and try again.");
      return;
    }
    if (captions && !recording.current) { setError("Choose the video before its captions."); return; }
    const current = ++generation.current;
    setBusy(true);
    setError("");
    try {
      if (captions && !(await file.text()).replace(/^\uFEFF/, "").startsWith("WEBVTT")) {
        throw new Error("The caption file must begin with WEBVTT. Export it in WebVTT format and try again.");
      }
      if (current !== generation.current) return;
      const value: Recording = captions ? { video: recording.current!.video, captions: file } : { video: file };
      try { await recordingStore(key, value); }
      catch (storageError) {
        if (current === generation.current) setError(storageError instanceof DOMException && storageError.name === "QuotaExceededError"
          ? "Browser storage is full. This preview works for this visit only. Free browser storage or choose a smaller file to save it."
          : "This preview works for this visit, but could not be saved in browser storage. Choose the file again after reopening.");
      }
      if (current === generation.current) display(value);
    } catch (attachmentError) {
      if (current === generation.current) setError(attachmentError instanceof Error ? attachmentError.message : "This recording could not be opened.");
    } finally {
      if (current === generation.current) setBusy(false);
    }
  }

  return <section className={styles.card} aria-label={`${lessonId} ${kind} recording`}>
    <div className={`${styles.dropZone} ${dragging ? styles.dragging : ""}`}
      onDragOver={(event) => { event.preventDefault(); if (!loading && !busy) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault(); setDragging(false);
        if (event.dataTransfer.files.length > 1) setError("Choose one video at a time.");
        else void attach(event.dataTransfer.files[0]);
      }}>
      {preview ? <video className={styles.video} src={preview.video} controls playsInline preload="metadata"
        aria-label={`${lessonId} ${kind === "concept" ? "concept" : "worked solution"} recording`}
        onEnded={onCompleted} onError={() => setError("This browser cannot play the file. Try an MP4 with H.264 video or a WebM export.")}>
        {preview.captions && <track key={preview.captions} kind="captions" src={preview.captions} srcLang="en" label="English captions" default />}
      </video> : <PlannedRecording lessonId={lessonId} kind={kind} />}
    </div>
    <div className={styles.tools}>
      <p className={styles.notice}>Preview on this browser only; not published to students.</p>
      <p className={styles.help}>{preview ? preview.name : "Drag your finished recording here, or choose a file. MP4 / WebM · up to 250 MB."}</p>
      <div className={styles.actions}>
        <label className={`${styles.button} ${loading || busy ? styles.disabled : ""}`}>
          <input className={styles.input} type="file" accept="video/mp4,video/webm,.mp4,.webm" disabled={loading || busy}
            aria-label={preview ? "Replace local video preview" : "Choose local video preview"}
            onChange={(event) => { void attach(event.target.files?.[0]); event.target.value = ""; }} />
          {preview ? "Replace video" : "Choose video"}
        </label>
        {preview && <label className={`${styles.button} ${busy ? styles.disabled : ""}`}>
          <input className={styles.input} type="file" accept="text/vtt,.vtt" disabled={busy} aria-label="Choose WebVTT captions"
            onChange={(event) => { void attach(event.target.files?.[0], true); event.target.value = ""; }} />
          {preview.captions ? "Replace captions" : "Add captions (.vtt)"}
        </label>}
      </div>
      <p className={styles.help}>Add captions before releasing a recording. The written lesson is a learning companion, not a verbatim transcript.</p>
      <p className={styles.status} role="status" aria-live="polite">{loading ? "Checking this browser for a saved preview…" : busy ? "Preparing your local preview…" : preview ? "Ready to play. Playback starts when you choose." : "Ready for your recording."}</p>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  </section>;
}
