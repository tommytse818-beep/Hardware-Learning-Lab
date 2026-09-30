# HLL self-hosted tutor

## Decision

Use an existing open-weight vision-language model with HLL's own interface, course grounding, access rules and evaluation process (option 2). Training a foundation model from scratch (option 3) is not an efficient first-year investment for 20 cohorts of 12–25 students. Self-hosting gives operational control; it does not by itself guarantee accuracy or lower total cost. Hardware, idle time, maintenance and peak simultaneous requests matter more than annual headcount.

Qwen3-VL-8B-Instruct is a candidate to benchmark, not an accuracy-approved choice. The local 2B variant is for a lightweight engineering smoke test only. Do not promote a smaller model to classrooms because it is cheap or because one answer looks correct. This is a custom HLL product using existing weights, not a newly trained foundation model.

## Implemented

- One continuous, nonmodal right-hand assistant, with lessons still usable beside it. Chats remain in tab memory; only the last three complete turns from the current lesson are sent, capped at 12,000 history characters. Switching lessons retains the visible conversation but does not send unrelated lesson history.
- Text and one PNG/JPEG/WebP image per request, up to 5 MB. Images are sent only with the current question and are not silently re-uploaded on each follow-up. Attachment contents and size are validated on the server. Signature validation is not full image decoding: the model server must also safely decode and limit image dimensions.
- Server authentication, course entitlement and sequential student lesson checks. Staff can inspect all published lessons. Week 2 requires authoritative Week 1 and prior Week 2 completion. The browser cannot enable worked-review mode.
- Current approved lesson notes, never the whole course or draft documents. Week 2 worked solutions are withheld until saved work and initial checks pass; transfer answer keys are never supplied. Prompt instructions favour hints and missing-data questions. A model can still derive an answer: this is a teaching policy, not a guarantee against answer leakage.
- Server-only inference URL/key. OpenAI-compatible `/v1/chat/completions` is just a protocol; no OpenAI account or API call is involved. Remote endpoints require HTTPS and a key. Redirects are rejected. No cloud fallback or automatic training.
- 650 output-token cap, 90-second inference deadline, Stop control, no automatic retries, generic errors with draft preservation. Incomplete responses are rejected. A server-derived course reference identifies the material supplied, not proof that every generated sentence is correct.
- Shared database quotas: six requests/account/minute, 100/account/day, 120 requests/minute across this deployment. These count attempts, including failed inference, to bound retry load. They reuse the existing `consume_rate_limit_v1` migration and fail closed if unavailable. They are request quotas, not billing or GPU concurrency limits.
- No chat transcript/image database and no model tools that can mark progress, execute code or approve circuits. Review deployment/proxy logging independently before handling real student data.
- Markdown and mathematical notation render with React Markdown and KaTeX. Raw HTML, generated remote images, model-supplied links and trusted TeX commands are disabled. The course reference below a reply comes from the server.

## Local screening result — 1 October 2026

Real replies were verified through the signed-in admin course page. The installed laptop model is `qwen3-vl:2b-instruct`, running through local Ollama. It is **not approved for students**. The larger 8B candidate has not been installed or evaluated on this laptop. Student access remains disabled; teacher/admin access is explicitly labelled as a pilot.

The initial 12-case text run produced 11 complete responses and one response cut off at the 650-token cap. Latency ranged from 3.1 to 28.8 seconds, with a median of 9.2 seconds on this laptop during development. These are engineering observations, not an accuracy score or a classroom capacity benchmark. Raw synthetic results are in `evaluation/hll-local-2b-screening.json`; no student data is included.

Material failures found by reading those replies:

- It said that components which are not parallel must be series. They may be neither.
- It mixed the 63% charging rule with the 37% remaining-voltage discharge rule, despite correct lesson notes.
- It speculated that the 3 V product supply was a voltage drop from the separate 5 V practice example.
- Its pull-up explanation repeatedly contradicted itself and hit the output cap. The application rejects that incomplete reply.
- It introduced unprovided LED values, then described the example resistor as the student's required choice. It also assumed switch terminal details.
- Its checkpoint hint promised to supply the exact answer if given values. Prompt-only hint discipline is not a reliable guarantee with this model.

The prompt was subsequently tightened to stop after one follow-up question and avoid inventing a capacitor in a switch example. This does **not** establish that the conceptual failures have been fixed. Do not enable students after prompt edits alone. Benchmark the 8B Instruct candidate or a stronger self-hosted model on suitable hardware against the same cases, real labelled circuit images and adversarial variants, then obtain teacher review. Do not spend on training a new foundation model to address these pilot failures.

The laptop has approximately 32 GB total RAM, integrated AMD graphics and roughly 6–8 GB free before model loading. The test runtime used CPU inference. This machine is suitable for development trials, not a demonstrated multi-cohort inference service.

The final dependency scan found advisories in the previous Next.js 16.3.2 installation and several transitive dependencies. The lockfile now resolves Next.js 16.3.8 and patched transitive versions; `npm audit` reported zero known vulnerabilities after the update. This is a point-in-time dependency check, not a full security certification.

## Local setup

Use an official Ollama installation. Keep it bound to loopback. Do not expose port 11434 to the internet.

```powershell
$env:OLLAMA_NO_CLOUD = '1'
$env:OLLAMA_CONTEXT_LENGTH = '16384'
$env:OLLAMA_NUM_PARALLEL = '1'
$env:OLLAMA_MAX_QUEUE = '4'
ollama serve
```

In another terminal, install the intended test model with `ollama pull qwen3-vl:8b-instruct`. For a memory-constrained development smoke test, use `qwen3-vl:2b-instruct`; it is not a substitute for evaluating the 8B model. Model downloads and runtime memory are additional to the website. Check free RAM before loading.

Set these server-only values in `.env.local`, then restart/reload the Next development server configuration:

```dotenv
HLL_TUTOR_ENABLED=true
HLL_TUTOR_BASE_URL=http://127.0.0.1:11434/v1/
HLL_TUTOR_MODEL=qwen3-vl:8b-instruct
HLL_TUTOR_IMAGES_ENABLED=true
HLL_TUTOR_STUDENTS_ENABLED=false
HLL_TUTOR_REASONING_EFFORT=none
```

Keep student access false until teachers have reviewed representative outputs. Admin/teacher accounts can run the pilot. The connected status means configured, not that the inference server passed a health/accuracy check. Sending a real question verifies connectivity.

Ollama's optional `reasoning_effort=none` prevents a thinking model from spending the small reply budget entirely on hidden reasoning. Check the model's `/api/show` metadata. Leave `HLL_TUTOR_REASONING_EFFORT` empty for an instruct-only model/server that does not support this field. Benchmark correctness and latency together; fewer reasoning tokens alone do not demonstrate a better tutor.

## School deployment

Use a centrally managed Linux GPU inference service (for example vLLM) for multiple cohorts. Serve the chosen vision model behind an authenticated HTTPS endpoint and restrict network access to the HLL application. Point `HLL_TUTOR_BASE_URL` at its `/v1/` endpoint and set `HLL_TUTOR_API_KEY` in the server secret manager. Match `HLL_TUTOR_MODEL` to its served model name. A hosted Next deployment cannot reach a laptop's `127.0.0.1`.

Configure at least a 16k context window for this adapter and verify image-token accounting on the chosen model. Add a bounded inference queue and measured concurrency limit at the model gateway, including cancellation on client disconnect. The app's per-minute request limit alone does not prevent simultaneous GPU overload. Provision using concurrent active students, not 240–500 annual enrolments. Test one cohort first, then the intended overlapping cohorts. Scale only when measured queue time, latency and error rates require it. A second provider/router is unnecessary for the initial pilot.

Before student release, evaluate separate circuit-image fixtures (clear, blurry, missing junction, wrong polarity), dimensional/unit calculations, hints before assessment solutions, prompt injection, missing givens and uncertainty. Teacher approval of practical work remains mandatory. The `evaluation/hll-tutor-cases.json` cases are a starting set, not an accuracy score. Run the evaluation script against the configured self-hosted model; it saves candidate replies for human marking. Do not treat text pattern checks as a safety certification.

No deterministic calculator or training pipeline has been added in this version. Before expanding to schools, add reviewed numerical checks, staff feedback/incident handling, operational monitoring, retention policy and load tests. Fine-tune only after a reviewed dataset demonstrates a specific repeated weakness and a holdout evaluation confirms improvement. Never continuously train from unreviewed student chats.

## Edison handoff

Edison's initial handoff was statically reviewed, not blindly merged. It hardcoded a paid provider and targeted the older lesson layout. This implementation keeps the current continuous dock and both course registries. Edison can connect a model by implementing the documented chat-completions endpoint, returning `choices[0].message.content` and `finish_reason: "stop"`, and supporting image data URLs when enabled. Incomplete output, failures and timeouts must not be returned as successful answers.

## Reference documentation

- [Ollama OpenAI-compatible local endpoints](https://docs.ollama.com/api/openai-compatibility)
- [Qwen3-VL model family and local variants](https://ollama.com/library/qwen3-vl)
- [Qwen3-VL-8B-Instruct model card](https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct)
- [vLLM OpenAI-compatible server](https://docs.vllm.ai/en/latest/serving/openai_compatible_server/)

Keep model files, private email handoffs, `.env.local`, credentials and student data out of Git. This branch does not rent GPU capacity or publish a production AI service.
