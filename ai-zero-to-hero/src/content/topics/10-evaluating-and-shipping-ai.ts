import { TopicContent, ytSearch } from '../types';

export const topic10: TopicContent = {
  slug: 'evaluating-and-shipping-ai',
  title: 'Evaluating and Shipping AI',
  description: 'Test sets, cost and speed, privacy and rollout — how to put AI in front of a team responsibly.',
  sessions: [
    {
      title: 'Why “it seems fine” is not good enough',
      markdown: `## The demo trap

A prompt that works on three examples feels finished. Then it meets real users, odd inputs and a different week — and quietly fails. Language models are **non-deterministic**: the same input can produce different outputs. Impressions from a handful of tries tell you very little.

**Evaluation** (often shortened to *evals*) is the discipline of measuring how well your AI system actually does its job, in a way you can repeat.

## What "good" means depends on the task

Before measuring, write down what success looks like:

- **Correctness** — is the answer factually right?
- **Faithfulness** — does it stick to the supplied documents?
- **Format** — valid JSON? within the length limit?
- **Safety and tone** — no leaked data, no inappropriate content, the right voice.
- **Usefulness** — would the person actually act on it?

## Three kinds of checks

1. **Exact checks** — automated rules: the output parses as JSON, contains the required fields, stays under 100 words.
2. **Reference checks** — compare with a known right answer ("the refund window is 30 days").
3. **Judgement checks** — a person (or another model, carefully) scores quality against a rubric.

## Why bother?

Without evals, every change — a new prompt, a new model version, a different document set — is a gamble. With evals you can answer: *did that change make things better, worse, or just different?*

## Key takeaways

- Model outputs vary, so a few good-looking tries prove little.
- Define what "good" means for your task before you measure it.
- Combine exact checks, reference checks and judgement checks.
- Evals turn every change from a gamble into a measured decision.`,
      videos: [ytSearch('how to evaluate LLM applications evals explained for beginners')],
      quizzes: [
        {
          question: 'Why is trying a prompt on three examples not enough to trust it?',
          options: [
            'Three examples is the legal minimum',
            'Outputs vary and real inputs are more varied, so a small sample can hide frequent failures',
            'Models only work on larger samples',
            'Three examples always give the same result',
          ],
          correct: 1,
          explanation: 'A tiny sample cannot show how often the system fails. A repeatable test set can.',
        },
      ],
    },
    {
      title: 'Building a test set and scoring it',
      markdown: `## Start with real questions

A good evaluation set is a spreadsheet of **inputs** and what a **good output** looks like. Build it from reality:

- **Real examples** from emails, tickets and chat logs (anonymised).
- **Common cases** — the bulk of what people ask.
- **Edge cases** — empty input, very long input, typos, other languages, ambiguous requests.
- **Known failures** — every bug you meet becomes a new test.
- **Adversarial cases** — attempts to break rules or extract secrets.

Twenty to fifty well-chosen cases is a strong start. Add to it over time.

## Write a rubric

For judgement checks, write a short **rubric** with clear levels so scoring is consistent:

| Score | Meaning |
| --- | --- |
| 2 | Correct, complete, uses only the supplied sources |
| 1 | Mostly right but misses a detail or adds a minor unsupported claim |
| 0 | Wrong, invented, or breaks a rule |

## Using a model as the judge

You can ask a model to score outputs against the rubric — fast and cheap, but with known weaknesses: it may favour longer answers, favour its own style, or be inconsistent. So:

- **Spot-check** its scores against human judgement regularly.
- Give it the rubric and the reference answer, and ask for a short reason.
- Treat it as a screening tool, not as the final authority.

## Keep it honest

- Keep a **held-out** set you do not tune the prompt against, so you do not just fit to the examples you can see.
- Record the **prompt version, model and date** with every run so results can be compared.

## Key takeaways

- Build a test set from real, common, edge, failure and adversarial cases.
- Use a rubric with clear levels so scoring is consistent.
- Model-as-judge is useful but biased; check it against human scores.
- Keep a held-out set and log versions so comparisons are fair.`,
      videos: [ytSearch('LLM as a judge evaluation rubric test set tutorial')],
      quizzes: [
        {
          question: 'Why keep a held-out set of test cases that you never tune your prompt on?',
          options: [
            'It saves storage',
            'It shows whether improvements generalise instead of just fitting the examples you have been staring at',
            'It makes the model faster',
            'It is required by law',
          ],
          correct: 1,
          explanation: 'If you tune a prompt against the same examples you score on, results look better than they really are.',
        },
        {
          question: 'Which is a known weakness of using a model to judge another model\'s answers?',
          options: [
            'It cannot read text',
            'It may prefer longer answers or its own style, so its scores need spot-checking against humans',
            'It always gives the lowest score',
            'It requires no instructions',
          ],
          correct: 1,
          explanation: 'Model judges have biases such as favouring length or familiar style. Regular human checks keep them honest.',
        },
      ],
    },
    {
      title: 'Cost, speed and reliability',
      markdown: `## Three numbers every AI feature has

- **Cost** — paid per token, input and output.
- **Latency** — how long the user waits.
- **Reliability** — how often it works, including when things go wrong.

## Controlling cost

- **Send less.** Trim prompts, retrieve only relevant passages, drop unneeded history.
- **Pick the right-sized model.** Smaller, cheaper models handle simple tasks such as classification or extraction; keep the large model for the hard ones.
- **Cache.** If the same question or the same long prefix appears repeatedly, caching saves both money and time.
- **Set output limits** so an answer cannot run on indefinitely.
- **Estimate before launch:** average tokens per request × requests per day × price.

## Controlling latency

- **Stream** the answer so users see words arrive instead of waiting.
- **Shorten outputs** — generation time grows with length.
- **Run independent steps in parallel.**
- **Use smaller models** where quality allows.

## Reliability

Real services fail: rate limits, timeouts, network errors, occasional bad outputs. Plan for them:

- **Retry** with a short, growing delay — only for safe, repeatable calls.
- **Time out** instead of waiting forever.
- **Fall back** to a simpler model, a cached answer or a friendly "try again" message.
- **Validate outputs** (is this valid JSON?) and re-ask once if not.
- **Never let a failure silently look like success.**

## Key takeaways

- Track cost, latency and reliability from the start.
- Reduce cost by sending less, right-sizing the model and caching.
- Stream and shorten outputs to feel faster.
- Retry, time out, fall back and validate — and never hide failures.`,
      videos: [ytSearch('reducing LLM API cost and latency caching streaming smaller models')],
      quizzes: [
        {
          question: 'Your feature classifies thousands of short support messages a day and the bill is high. What is a sensible first step?',
          options: [
            'Use the largest model for every message',
            'Test whether a smaller, cheaper model does the job well enough, and trim the prompt',
            'Remove the instructions',
            'Stop measuring cost',
          ],
          correct: 1,
          explanation: 'Simple, high-volume tasks often work well with smaller models, and shorter prompts cost less per call.',
        },
      ],
    },
    {
      title: 'Privacy, security and compliance',
      markdown: `## Know where the data goes

Every time you send text to an AI service, you are sharing it with a third party. Before building or buying, answer:

- **What data will be sent?** Customer names, emails, health or financial details?
- **Where is it processed and stored**, and for how long?
- **Is it used to train models?** Many business plans say no by default; free consumer plans may differ — read the terms.
- **Who can see it?** Staff at the vendor, your own team, logs and backups.

## Reduce what you share

- **Minimise.** Send only the fields the task needs.
- **Redact or pseudonymise.** Replace names and ids with placeholders before sending, and map them back afterwards.
- **Use approved tools.** If your company has an approved AI platform, use it rather than a personal account.

## Security risks specific to AI

- **Prompt injection** — hidden instructions in documents, emails or web pages that try to steer the model.
- **Data leakage** — the model reveals something from its context it should not (system prompts, other users' data).
- **Over-permissioned tools** — an agent with more access than the job needs.
- **Unsafe output handling** — putting model text straight into a web page or database command without checking it.

Defences include least-privilege access, separating untrusted content from instructions, filtering and validating outputs, human approval for risky actions, and access controls enforced in code.

## Compliance and accountability

Rules such as GDPR, sector regulations and your internal policies still apply. Keep a record of **what the system is for, what data it uses, how it was tested, and who owns it.** Decisions that affect people — hiring, credit, health — need extra care and human review.

## Key takeaways

- Know what data you send, where it goes, how long it is kept and whether it trains models.
- Minimise, redact and use approved tools.
- Defend against prompt injection, leakage, over-permissioned tools and unsafe outputs.
- Document purpose, data, testing and ownership; keep humans in high-stakes decisions.`,
      videos: [ytSearch('AI privacy security risks for business prompt injection data leakage')],
      quizzes: [
        {
          question: 'Before sending customer support tickets to an AI service, which step best protects privacy?',
          options: [
            'Send the full tickets including names and emails',
            'Remove or replace personal details and confirm the vendor\'s data-retention and training terms',
            'Use your personal free account',
            'Skip reading the terms',
          ],
          correct: 1,
          explanation: 'Minimising what you send and checking how the vendor stores and uses data are the core privacy steps.',
        },
      ],
    },
    {
      title: 'Rolling AI out to a team',
      markdown: `## Start small, learn fast

Launching to everyone at once is how small problems become big ones. A safer path:

1. **Pick one workflow** with clear value and low risk — drafting reports, summarising meetings, searching internal docs.
2. **Pilot** with a small group who will give honest feedback.
3. **Measure** against what you did before: time saved, error rate, user satisfaction.
4. **Fix and expand** only when the numbers justify it.

## Keep a human in the loop

Decide *who reviews what* and write it down. The model drafts; a named person approves anything customer-facing, financial or irreversible. Show users when content is AI-generated and make it easy to **report a bad answer**.

## Monitor after launch

Quality drifts: documents change, users behave differently, a provider updates a model. Keep watching:

- Sample real conversations regularly and score them with your rubric.
- Track cost, latency and error rates.
- Collect thumbs-up/down and read the comments.
- Re-run your test set whenever you change a prompt, model or data source.

## Train the people, not just the system

Teach colleagues what AI is good and bad at, what they may paste into it, and how to check its output. Share good prompts in one place. Adoption sticks when people feel capable and safe.

## Know when *not* to use AI

If a simple rule, a query or a spreadsheet does the job reliably, use that. AI is the wrong tool when you need exact, auditable, deterministic results — or when the cost of a rare mistake is too high without a human check.

## Key takeaways

- Pilot one low-risk workflow, measure, then expand.
- Name who reviews what; make bad answers easy to report.
- Monitor quality, cost and drift continuously; rerun tests after any change.
- Train colleagues, and choose simpler tools when they work better.`,
      videos: [ytSearch('how to roll out generative AI in a company pilot change management')],
      quizzes: [
        {
          question: 'What is the best way to introduce an AI drafting tool to a department?',
          options: [
            'Launch it to everyone on the same day with no guidance',
            'Pilot with a small group on one low-risk workflow, measure results, then expand',
            'Hide that it is AI-generated',
            'Remove all human review to save time',
          ],
          correct: 1,
          explanation: 'A small pilot reveals problems cheaply, and measurements show whether the tool is really helping.',
        },
        {
          question: 'Three months after launch, answer quality drops although nobody changed the prompt. What is a likely explanation to check?',
          options: [
            'Quality never changes after launch',
            'The documents, user questions or the underlying model version changed, which is why you keep monitoring and rerunning tests',
            'The prompt got tired',
            'The test set deleted itself',
          ],
          correct: 1,
          explanation: 'Data, usage and model updates drift over time. Ongoing sampling and test reruns catch regressions.',
        },
      ],
    },
  ],
  finalQuiz: [
    {
      question: 'What does "non-deterministic" mean for a language model?',
      options: [
        'It never gives an answer',
        'The same input can produce different outputs on different runs',
        'It only works offline',
        'It always gives the same answer',
      ],
      correct: 1,
      explanation: 'Sampling means outputs can vary, which is one reason one-off impressions are unreliable evidence of quality.',
    },
    {
      question: 'Which is an example of an exact (automated) check on a model\'s output?',
      options: [
        'Asking a colleague whether it "feels right"',
        'Verifying the output parses as valid JSON with all required fields',
        'Reading it once and hoping',
        'Counting how many emojis it contains for tone',
      ],
      correct: 1,
      explanation: 'Format rules such as valid JSON and required fields can be tested automatically on every run.',
    },
    {
      question: 'Which collection makes the strongest starting evaluation set?',
      options: [
        'One perfect example',
        'Real examples, common cases, edge cases, past failures and a few adversarial inputs',
        'Only the easiest questions',
        'Random text with no expected answers',
      ],
      correct: 1,
      explanation: 'A mix of typical and difficult cases shows how the system behaves where it matters, and past failures prevent regressions.',
    },
    {
      question: 'What is the purpose of a scoring rubric?',
      options: [
        'To make the model larger',
        'To give clear criteria and levels so different reviewers score consistently',
        'To store prompts',
        'To compress outputs',
      ],
      correct: 1,
      explanation: 'A rubric turns "is this good?" into specific levels, which makes scores comparable across people and runs.',
    },
    {
      question: 'You improve a prompt until all 30 of your test cases pass. Why might real performance still disappoint?',
      options: [
        'Test cases are never useful',
        'You may have overfitted to those cases; a held-out set shows whether it generalises',
        'Passing tests lowers quality',
        'The model forgets the prompt overnight',
      ],
      correct: 1,
      explanation: 'Tuning against the same cases you score on inflates results. Held-out cases give a fairer estimate.',
    },
    {
      question: 'Which technique reduces both cost and latency when many requests share the same long instructions?',
      options: [
        'Making the instructions longer',
        'Caching the repeated prefix or repeated answers',
        'Switching to a slower model',
        'Removing output limits',
      ],
      correct: 1,
      explanation: 'Reusing work that has already been done avoids paying and waiting for it again.',
    },
    {
      question: 'An API call to your AI provider times out occasionally. What is a sound reliability approach?',
      options: [
        'Ignore it and show a blank page',
        'Time out sensibly, retry safe calls with a growing delay, and fall back to a clear message or simpler option',
        'Retry instantly in an endless loop',
        'Pretend the call succeeded',
      ],
      correct: 1,
      explanation: 'Bounded retries with backoff, plus a fallback, handle transient failures without hiding them or hammering the service.',
    },
    {
      question: 'Which is the best way to protect personal data when using an external AI service?',
      options: [
        'Paste everything, because the model needs context',
        'Minimise and redact what you send, and check the vendor\'s retention and training terms',
        'Use a personal account for speed',
        'Assume all providers use identical terms',
      ],
      correct: 1,
      explanation: 'Sending less data and understanding the vendor\'s handling terms are the most effective privacy controls.',
    },
    {
      question: 'Model output is inserted directly into a web page without any checks. What risk does this create?',
      options: [
        'None, because model text is always safe',
        'Unsafe output handling: the text could contain harmful content or code that your page then runs or shows',
        'The page will load faster',
        'The model will be retrained',
      ],
      correct: 1,
      explanation: 'Model output is untrusted. Validate or escape it before it reaches a page, database command or other system.',
    },
    {
      question: 'For which situation is AI probably the wrong tool?',
      options: [
        'Drafting a first version of a summary that a person will review',
        'A calculation that must be exact and auditable, where a simple formula already does the job',
        'Brainstorming report titles',
        'Searching a large document collection with human checks',
      ],
      correct: 1,
      explanation: 'When an exact, deterministic method exists and errors are costly, a formula or query is more reliable than a generative model.',
    },
  ],
};
