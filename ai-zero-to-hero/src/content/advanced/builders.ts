import { ytSearch, type TopicExtra } from '../types';

/** Advanced sessions for topics 4–6, keyed by topic slug. They are appended after the original sessions. */
export const buildersAdvanced: Record<string, TopicExtra> = {
  'prompt-engineering': {
    sessions: [
      {
        title: 'Structured outputs: JSON, schemas and reliable formats',
        markdown: `## When a person reads the answer, prose is fine. When a program does, it is not

If you want to feed a model's answer into a spreadsheet, a database or another script, "a nice paragraph" is useless. You need output in a **predictable format** — most often **JSON**.

## Ask precisely

Describe the exact shape you want, and give an example:

> Extract the details from the email below. Reply with **only** valid JSON in this shape, with no extra text:
> \`{"customer": string, "order_id": string, "issue": "late" | "damaged" | "wrong_item" | "other", "urgent": boolean}\`
> If a field is not in the email, use \`null\`.

Notice four habits: *only JSON*, an *exact schema*, a *fixed list of allowed values* for categories, and a rule for *missing data*.

## Make it easier for the model

- Use **delimiters** to separate instructions from the material, for example the email between lines of \`---\`.
- Show **one or two examples** (few-shot) of input and the exact output you want.
- Keep categories **few and clearly defined**.
- Many APIs offer a **structured output** or **JSON mode** that constrains the format — use it when available instead of relying on wording alone.

## Never trust the format blindly

Even good prompts occasionally produce broken JSON or a value outside your list. In code:

1. **Parse** the output and catch errors.
2. **Validate** against the schema (required fields, types, allowed values).
3. If invalid, **retry once**, sending back the error message ("field 'issue' must be one of …").
4. If it still fails, **log it and hand the case to a person**.

## Don't ask for more than you need

Every extra field is another chance for a mistake. Request only what the next step uses.

> **Analyst tip:** structured extraction is one of the highest-value uses of AI for analysts — turning messy comments, emails and notes into clean columns you can count.

## Key takeaways

- When software consumes the answer, specify an exact format such as a JSON schema.
- Limit categories to a fixed list and say what to do when data is missing.
- Use delimiters, examples and any built-in structured-output feature.
- Always parse and validate; retry once, then escalate to a person.`,
        videos: [ytSearch('LLM structured output JSON schema prompting extract data from text tutorial')],
        quizzes: [
          {
            question: 'A script reads the model\'s reply and crashes about once in fifty runs because the JSON is malformed. What is the best fix?',
            options: [
              'Hope it improves',
              'Parse and validate the output in code, retry once with the error message, and escalate failures',
              'Switch to a prompt that asks the model to be more careful',
              'Remove the script',
            ],
            correct: 1,
            explanation: 'Prompts reduce errors but cannot eliminate them. Validation and a bounded retry make the pipeline robust.',
          },
        ],
      },
      {
        title: 'Prompt chaining, self-checks and testing your prompts',
        markdown: `## Break big jobs into small steps

One giant prompt that says "read these 40 comments, find themes, rank them, write a summary and draft an email" often does everything badly. **Prompt chaining** splits the job into steps, where each step's output feeds the next:

1. **Clean** — remove duplicates and obvious noise.
2. **Label** — tag each comment with a topic from a fixed list.
3. **Count** — tally the labels (with code, not by the model).
4. **Summarise** — write the narrative from the counts and a few representative quotes.
5. **Draft** — turn the summary into an email.

Each step is simpler, easier to check, and you can fix one stage without redoing the rest.

## Add a checking step

Models are often better at **reviewing** an answer than producing a perfect one first time. Add a second pass:

> Here is a draft summary and the source comments. List any claim in the summary that is not supported by the comments. Then give a corrected version.

Useful self-checks: "Which assumptions did you make?", "What would change your answer?", "Does every number come from the data provided?"

A caution: asking a model "are you sure?" does not guarantee correctness. Checks work best when they point at something concrete — a source text, a rule, a schema.

## Treat prompts like code

Prompts are part of how your product behaves, so manage them:

- **Version them** in a file, with a note on why each change was made.
- **Keep a test set** of inputs with expected outputs (see the evaluation topic) and rerun it after every edit.
- **Change one thing at a time** so you know what helped.
- **Record the model name and settings** used, because a model update can change results.

## Key takeaways

- Chain small steps instead of one giant prompt; use code for counting and sorting.
- Add a review step that checks claims against the source.
- "Are you sure?" is weak; concrete checks against sources and rules are strong.
- Version prompts, keep a test set, and change one variable at a time.`,
        videos: [ytSearch('prompt chaining and self-critique techniques for LLM workflows')],
        quizzes: [
          {
            question: 'You need counts of how many comments fall into each theme. Which approach is most reliable?',
            options: [
              'Ask the model to estimate the counts in its reply',
              'Have the model label each comment, then count the labels with code',
              'Ask the model to guess and round to the nearest ten',
              'Skip counting',
            ],
            correct: 1,
            explanation: 'Labelling is a good job for a model; exact counting is better done by code, which is deterministic.',
          },
        ],
      },
    ],
    finalQuiz: [
      {
        question: 'Which instruction best helps a model return output that a script can parse?',
        options: [
          '"Reply in a friendly tone."',
          '"Reply with only valid JSON matching this schema, using null for missing fields."',
          '"Be as detailed as possible."',
          '"Surprise me."',
        ],
        correct: 1,
        explanation: 'Specifying only JSON, an exact schema and a rule for missing data gives predictable, machine-readable output.',
      },
      {
        question: 'Why is prompt chaining often better than one very long prompt for a multi-step task?',
        options: [
          'It always uses fewer tokens',
          'Each step is simpler and easier to check, and you can fix one stage without redoing everything',
          'It removes the need for any instructions',
          'It makes the model more expensive on purpose',
        ],
        correct: 1,
        explanation: 'Smaller steps are easier to test and debug, and intermediate results can be verified.',
      },
    ],
  },

  'api-keys-and-integrations': {
    sessions: [
      {
        title: 'Errors, retries and streaming in API calls',
        markdown: `## Calls fail — plan for it

Every API call can go wrong: the network drops, the provider is busy, or your request is faulty. A reliable integration reads the **status code** and reacts sensibly.

## Reading status codes

| Code | Meaning | What to do |
| --- | --- | --- |
| **200** | Success | Use the result |
| **400** | Your request is malformed | Fix the request; do not retry unchanged |
| **401 / 403** | Bad key or no permission | Check the key and its access; do not retry |
| **429** | Too many requests (rate limit) | Wait, then retry slower |
| **500 / 502 / 503** | Provider-side problem | Retry after a delay |

Rule of thumb: **client errors (4xx, except 429) mean you must change something; server errors (5xx) and 429 are worth retrying.**

## Retrying politely

Use **exponential backoff**: wait 1 second, then 2, then 4, then 8, up to a limit. Add a little random **jitter** so many clients don't retry in lockstep. If the response includes a "retry after" hint, follow it. Give up after a few attempts and tell the user.

## Timeouts

Always set a **timeout** so a stuck call cannot freeze your program. Choose it from reality: a long generation legitimately takes longer than a simple lookup.

## Be careful retrying actions

Retrying a *read* is harmless. Retrying something with side effects — sending an email, creating an order — could do it twice. Use an **idempotency key** if the API supports one, or check whether the action already happened.

## Streaming

With **streaming**, the API sends the answer in pieces as it is generated, so your interface can show words as they arrive instead of waiting for the full reply. It feels faster and lets users stop early. Your code must handle partial text, an interrupted stream, and the final "done" event.

## Key takeaways

- Read status codes: fix 4xx errors, retry 429 and 5xx with backoff.
- Use exponential backoff with jitter, plus a maximum number of attempts.
- Set timeouts, and be careful retrying actions that have side effects.
- Streaming shows output as it is produced; handle interruptions gracefully.`,
        videos: [ytSearch('API error handling retries exponential backoff rate limit 429 explained')],
        quizzes: [
          {
            question: 'An API call returns 400 because a required field is missing. What should your code do?',
            options: [
              'Retry the identical request 10 times',
              'Fix the request; retrying the same request will fail the same way',
              'Wait an hour and retry',
              'Switch to a different API key',
            ],
            correct: 1,
            explanation: 'A 400 means the request itself is wrong. Only a corrected request will succeed.',
          },
        ],
      },
      {
        title: 'Designing a safe AI backend: keys, limits and logs',
        markdown: `## The golden rule: keys live on the server

If your web page or mobile app calls an AI provider **directly**, the API key must be inside the page — and anyone can open the browser's developer tools and copy it. Then they can spend your money.

The safe pattern:

1. The **browser** talks to **your own backend**.
2. Your **backend** holds the key (in an environment variable or secret manager) and calls the provider.
3. The backend decides **who may do what** before forwarding anything.

## Protect your budget

Your backend is where you add controls the provider cannot know about:

- **Authentication** — only signed-in users can use the feature.
- **Per-user limits** — for example, 30 requests per hour, so one person (or a script) cannot drain the budget.
- **Input size limits** — cap prompt length.
- **Output limits** — cap the response tokens.
- **Spending alerts and hard caps** with the provider, plus separate keys for development and production.

## Logging without leaking

Log enough to debug and measure: time, user id, model, token counts, status, latency. **Do not log** API keys, passwords, or full personal content unless you truly need it and have a retention plan. Redact sensitive fields.

## Rotate and revoke

- Give each environment and service **its own key** so one leak is contained.
- **Rotate** keys on a schedule and immediately if anything looks suspicious.
- Know how to **revoke a key quickly** — and practise it before you need it.

## Handle untrusted input

Anything a user types may try to manipulate the model. Keep system instructions on the server, never trust user text as instructions, and validate model output before using it in a database command, a web page or a shell.

## Key takeaways

- Never put API keys in front-end code; call the provider from your own backend.
- Add authentication, per-user rate limits and size limits to protect cost and abuse.
- Log operational data, not secrets; redact personal content.
- Use separate keys per environment, rotate regularly, and be ready to revoke fast.`,
        videos: [ytSearch('protect API keys backend proxy rate limiting per user AI app security')],
        quizzes: [
          {
            question: 'Your web app calls an AI provider straight from the browser with the key in the page source. What is the main risk?',
            options: [
              'Pages will load more slowly',
              'Anyone can copy the key from the browser and use it at your expense',
              'The provider will refuse all requests',
              'Nothing — browsers hide keys automatically',
            ],
            correct: 1,
            explanation: 'Anything sent to the browser can be read by the user. Keys must stay on a server you control.',
          },
        ],
      },
    ],
    finalQuiz: [
      {
        question: 'Which responses are generally worth retrying with a growing delay?',
        options: [
          '400 and 401',
          '429 and 5xx server errors',
          '404 for a mistyped URL',
          'Every error, immediately and forever',
        ],
        correct: 1,
        explanation: 'Rate limits and temporary provider problems often clear on their own. Client errors need a fix, not a retry.',
      },
      {
        question: 'Why add random jitter to retry delays?',
        options: [
          'To make requests slower for fun',
          'So many clients that failed together do not all retry at the same instant',
          'To hide the API key',
          'Jitter is only for audio',
        ],
        correct: 1,
        explanation: 'Randomising delays spreads retries out and avoids a synchronised surge that overloads the service again.',
      },
    ],
  },

  'working-with-claude': {
    sessions: [
      {
        title: 'Working with long documents: quote first, then answer',
        markdown: `## Long inputs are where models slip

Claude can read very long documents, but accuracy depends on how you ask. With a long report, contract or transcript, the risks are **missing a detail**, **blending two sections**, or **stating something the text never said**.

## Techniques that help

1. **Put the document first and the question last.** Place the material at the top of the message, then your instructions and question below it.
2. **Label the material** so it can be referenced: wrap documents in tags or clear headings, such as a title and an id for each one.
3. **Ask for quotes before conclusions.** For example: "First extract the exact sentences that are relevant to the question, in quotation marks. Then answer using only those quotes." This anchors the answer to real text.
4. **Ask for a citation per claim**, such as the section or document name.
5. **Allow "not found".** Tell Claude to say so if the document does not contain the answer.
6. **Split when needed.** For very large collections, summarise each part first, then combine the summaries — or use retrieval to pull only the relevant sections.

## An example prompt

> The report is below between the <report> tags. Question: What reasons does it give for the drop in renewals? First list the relevant quotes, with section headings. Then summarise the reasons in three bullets, each tied to a quote. If the report does not say, answer "not stated".

## Check the work

- Spot-check quotes against the source — are they exact?
- Compare the answer with the section headings; was anything important skipped?
- For numbers, recompute from the source tables yourself.

## Know the limits

A longer context window lets you include more, but it does not make every detail equally easy to find. Focused input — only the relevant pages — usually beats dumping everything in.

## Key takeaways

- Place long material first, the question last, and label each document.
- Ask for exact quotes first, then an answer based only on them.
- Allow "not stated" so the model does not invent an answer.
- Verify quotes and numbers, and prefer focused input over dumping everything.`,
        videos: [ytSearch('Claude long document analysis prompting tips quotes citations')],
        quizzes: [
          {
            question: 'Why ask Claude to extract exact quotes before answering a question about a long report?',
            options: [
              'Quotes make the response longer',
              'It anchors the answer to real text, making invented claims easier to spot',
              'Quotes speed up the reading',
              'It removes the need to read the answer',
            ],
            correct: 1,
            explanation: 'Quotes tie each point to the source, so you can verify it and the model has less room to invent.',
          },
        ],
      },
      {
        title: 'Claude as a data-analysis partner: a repeatable workflow',
        markdown: `## Make it a routine, not a one-off chat

The best results come when you set Claude up once and reuse the setup. Using a **Project**, build a small kit:

1. **Project instructions.** State your role, audience and rules: "You help a retail analytics team. Use plain English. Show assumptions. Never invent numbers; say when data is missing."
2. **A data dictionary** (a markdown file). For each table: columns, types, meaning, known quirks ("status 7 means refunded", "dates are in UTC").
3. **Metric definitions.** Write down exactly what "active customer", "churn" and "revenue" mean in your company.
4. **Query and code examples.** A few vetted examples of how your team writes SQL or pandas, so new code follows house style.
5. **An output template.** The sections you want in every analysis: question, method, result, caveats, next steps.

## A repeatable loop

1. **Frame** — paste the business question and any constraints.
2. **Plan** — ask Claude to propose an approach and list the checks it will need.
3. **Draft** — have it write the query or code against your data dictionary.
4. **Run it yourself** and bring back the results or errors.
5. **Interpret** — ask for the findings, plus the weakest assumption in them.
6. **Verify** — reconcile totals and edge cases as you would for any analysis.
7. **Package** — turn the verified result into your template.

## Keep it safe

- Share schemas and anonymised samples, not raw personal data.
- Keep humans responsible for conclusions that drive decisions.
- Update the data dictionary when a pitfall is discovered, so the lesson is not lost.

## Key takeaways

- Set up a Project with instructions, a data dictionary, metric definitions, examples and a template.
- Follow a loop: frame, plan, draft, run, interpret, verify, package.
- You run the code and check the numbers; Claude drafts and explains.
- Capture lessons in the project files so every analysis starts smarter.`,
        videos: [ytSearch('using Claude projects for data analysis workflow data dictionary')],
        quizzes: [
          {
            question: 'Why write metric definitions such as "active customer" into the project files?',
            options: [
              'So Claude uses your company\'s exact meaning instead of guessing a different one',
              'To make the files longer',
              'Because Claude cannot read numbers',
              'So the definitions can be changed in every chat',
            ],
            correct: 0,
            explanation: 'Terms like "active" or "churn" vary between companies. Stating them removes a common source of silent error.',
          },
        ],
      },
    ],
    finalQuiz: [
      {
        question: 'For a very long document, which prompt layout is recommended?',
        options: [
          'Question first, then paste the document',
          'Document first, then the instructions and question at the end',
          'No question, just the document',
          'Split the question into every other paragraph',
        ],
        correct: 1,
        explanation: 'Placing the material first and the question last tends to work better for long inputs.',
      },
      {
        question: 'In a repeatable analysis workflow with Claude, who should run the code and confirm the numbers?',
        options: [
          'Claude alone, with no human check',
          'You — Claude drafts and explains, and you run and verify the results',
          'Nobody, because the code is always right',
          'The model provider',
        ],
        correct: 1,
        explanation: 'The analyst stays accountable: run the code, check totals and edge cases, and own the conclusions.',
      },
    ],
  },
};
