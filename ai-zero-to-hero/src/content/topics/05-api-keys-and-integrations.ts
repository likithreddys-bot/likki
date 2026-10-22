import { TopicContent, ytSearch } from '../types';

export const topic5: TopicContent = {
  slug: 'api-keys-and-integrations',
  title: 'API Keys & Integrations',
  description: 'What an API key is, how to get one, and how to keep it safe.',
  sessions: [
    {
      title: 'What is an API key? Why does it exist?',
      markdown: `## Software talking to software

When you type into a chat window, a person (you) is talking to an AI. An **API** — *Application Programming Interface* — lets **other software** talk to that same AI. A spreadsheet script, a dashboard, a Slack bot or a data pipeline can send a request and get an answer back, with no chat window involved.

Think of an API as a **restaurant waiter**: you do not walk into the kitchen. You send an order in a standard format, and the waiter brings back what you asked for.

## So what is an API key?

An **API key** is a long secret string of characters, something like \`sk-...\`, that goes along with every request. It does three jobs:

1. **Identifies** who is calling.
2. **Authorises** the call — only valid keys are let in.
3. **Bills** the right account for the usage.

## Why it matters so much

A key is like a **credit-card number for one service**. Whoever holds it can make requests that *you* pay for, and that appear to come from *you*. That is why keys must be kept secret (Session 5).

## API key versus password

- A **password** logs *you* in to a website.
- An **API key** lets a *program* use a service — and is usually tied to billing.

Chat subscriptions and API access are normally **separate products with separate billing**. Paying for a chat plan does not automatically give you API credit.

> **Analyst tip:** you have probably used keys before — connecting a BI tool to a database or pulling data from a marketing platform. AI APIs work the same way.

## Key takeaways

- An API lets software use an AI model without a chat window.
- An API key identifies, authorises and bills the caller.
- Treat keys like passwords — or credit-card numbers.`,
      videos: [ytSearch('what is an API key explained for beginners')],
      quizzes: [
        {
          question: 'What are the main jobs of an API key?',
          options: [
            'To make answers longer',
            'To identify the caller, authorise requests and bill the right account',
            'To translate prompts',
            'To store your chat history',
          ],
          correct: 1,
          explanation: 'A key identifies who is calling, lets valid requests in, and ties usage to an account for billing.',
        },
      ],
    },
    {
      title: 'How to get a Claude API key or an OpenAI API key',
      markdown: `## Getting a key takes about five minutes

The exact screens change over time, so follow the provider's own docs if something looks different. The general path is the same.

### Anthropic (Claude)

1. Go to the **Anthropic Console** (console.anthropic.com) and sign in or create an account.
2. Add **billing** or credits if prompted — API usage is paid.
3. Open **API Keys** in the settings and choose **Create Key**.
4. Give it a **descriptive name** such as "research-assistant-dev".
5. **Copy the key immediately.** For safety it is shown once; if you lose it, create a new one.

### OpenAI

1. Go to the **OpenAI Platform** (platform.openai.com) and sign in.
2. Set up **billing** if needed.
3. Open **API keys** and choose **Create new secret key**.
4. Name it and **copy it right away**.

## Good habits from day one

- **One key per project.** If one leaks you can revoke it without breaking everything else.
- **Name keys clearly** so you know what each is for.
- **Set a spending limit or budget alert** in the provider's billing settings.
- **Paste it straight into a safe place** — a password manager or a \`.env\` file — not into a chat or email.

## What you will *not* see here

Never share a real key in a document, screenshot or message. Any examples in this course use placeholders such as \`YOUR_API_KEY\`.

> **Analyst tip:** if you work for a company, ask whether an approved account or key already exists. You may not need to create your own.

## Key takeaways

- Both providers: sign in, enable billing, create a key, copy it once.
- Use one key per project, name it, and set spending limits.
- Store keys in a password manager or a \`.env\` file.`,
      videos: [ytSearch('how to get an Anthropic Claude API key and OpenAI API key')],
      quizzes: [
        {
          question: 'Why create a separate API key for each project?',
          options: [
            'Each key makes the model smarter',
            'If one leaks, you can revoke just that key without breaking the others',
            'Keys expire if used twice',
            'The provider requires exactly one key per day',
          ],
          correct: 1,
          explanation: 'Separate keys limit the damage of a leak and make it easy to revoke one without disturbing other projects.',
        },
      ],
    },
    {
      title: 'Calling an API: what actually happens',
      markdown: `## One request, one response

Calling an AI API is a short conversation between your program and the provider's server.

1. **Your program builds a request** — which model to use, the messages to send, and settings such as a maximum length.
2. **It adds your key** in a header so the provider knows who you are.
3. **It sends the request** over the internet (HTTPS).
4. **The provider runs inference** (Topic 2) with your prompt.
5. **A response comes back** as structured text called JSON, containing the answer and how many tokens were used.

## What a request looks like

Here is a simplified example with a placeholder key and model name:

\`\`\`
curl https://api.anthropic.com/v1/messages \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  -d '{
    "model": "CURRENT_MODEL_NAME",
    "max_tokens": 200,
    "messages": [{"role": "user", "content": "Explain a p-value in one sentence."}]
  }'
\`\`\`

OpenAI's API is similar in shape: an address, a key in a header, a model name and a list of messages. Always check each provider's current docs for exact names.

## Reading the result

The response includes the **text of the reply** and a **usage** section showing input and output tokens — handy for tracking cost.

## Status codes tell you what went wrong

| Code | Meaning | Usual fix |
| --- | --- | --- |
| 200 | Success | You are done |
| 401 | Bad or missing key | Check the key and header |
| 429 | Too many requests | Slow down and retry |
| 500s | Problem on the provider's side | Wait and retry |

> **Analyst tip:** if your first call fails with 401, nine times out of ten the key is mistyped, expired, or the environment variable is not set.

## Key takeaways

- An API call is a request (model, messages, key) and a response (reply, usage).
- Keys travel in headers; never in public code.
- Status codes like 401 and 429 point to the fix.`,
      videos: [ytSearch('how REST API calls work request and response for beginners')],
      quizzes: [
        {
          question: 'Your API call returns status 401. What is the most likely cause?',
          options: [
            'The provider is on holiday',
            'The key is missing, mistyped or invalid',
            'Your prompt was too polite',
            'The answer was too long',
          ],
          correct: 1,
          explanation: 'A 401 means the request was not authenticated — usually a missing, wrong or expired key.',
        },
        {
          question: 'What does the "usage" part of an API response tell you?',
          options: [
            'How many tokens went in and came out',
            'The weather',
            'Your password',
            'The model\'s weights',
          ],
          correct: 0,
          explanation: 'Usage reports input and output token counts, which you can use to track cost.',
        },
      ],
    },
    {
      title: 'Rate limits, costs and tokens',
      markdown: `## Two things that surprise beginners

### 1. Rate limits

Providers cap how fast you can call them — typically a number of **requests per minute** and **tokens per minute**. If you go over, you get a **429** error.

**What to do:** slow down, queue your requests, and **retry with a growing delay** (wait 1 second, then 2, then 4…). This is called *exponential backoff*.

### 2. Cost

API usage is billed by **tokens** (Topic 2): you pay for tokens you **send** (input) and tokens the model **writes** (output). Output tokens usually cost more than input tokens, and different models have different prices — check the provider's pricing page.

**Example (illustrative prices, not real ones):** suppose a model costs $3 per million input tokens and $15 per million output tokens. A request with 2,000 input tokens and 500 output tokens costs:

- input: 2,000 ÷ 1,000,000 × $3 = $0.006
- output: 500 ÷ 1,000,000 × $15 = $0.0075
- total ≈ **$0.0135**

That is small once — and meaningful across 100,000 rows.

## Keeping the bill sensible

1. **Pick the right size of model.** Use a smaller, cheaper model for simple jobs like tagging.
2. **Trim prompts.** Send only the columns and text you need.
3. **Cap the reply** with a maximum-tokens setting.
4. **Test on a small sample** before looping over a whole dataset.
5. **Set a budget alert or spend limit.**

> **Analyst tip:** before a big batch run, do the maths: rows × tokens per row × price. A two-minute estimate prevents an expensive surprise.

## Key takeaways

- Rate limits cause 429 errors — retry with backoff.
- Cost = input tokens + output tokens, priced per model.
- Test small, cap output, and set a budget.`,
      videos: [ytSearch('LLM API pricing tokens rate limits explained')],
      quizzes: [
        {
          question: 'Your script gets a 429 error part-way through a big job. What is a sensible response?',
          options: [
            'Send the requests even faster',
            'Slow down and retry with an increasing delay',
            'Delete your key',
            'Switch off your computer',
          ],
          correct: 1,
          explanation: '429 means too many requests. Back off and retry with a growing delay.',
        },
      ],
    },
    {
      title: 'Keeping keys safe: .env files and never committing secrets',
      markdown: `## Rule number one

**A key must never appear in code you share, commit or screenshot.** Leaked keys are found and abused quickly — automated bots scan public code sites all day — and you pay the bill.

## The safe pattern: environment variables

Keep the key **outside** your code, in an *environment variable*, and let the program read it at run time.

1. Create a file named \`.env\` next to your project:

\`\`\`
ANTHROPIC_API_KEY=YOUR_API_KEY_HERE
\`\`\`

2. Tell Git to **ignore** it by adding this line to a file called \`.gitignore\`:

\`\`\`
.env
\`\`\`

3. Read it in code — for example in Python:

\`\`\`
import os
api_key = os.environ["ANTHROPIC_API_KEY"]
\`\`\`

4. Commit a harmless template called \`.env.example\` with *placeholders only*, so teammates know what to fill in.

## More do's and don'ts

- **Don't** paste keys into chats, emails, tickets or shared docs.
- **Don't** put keys in front-end (browser) code — anyone can read it. Call the AI from a server instead.
- **Do** use a **secret manager** (your cloud provider's, or your company's) for anything in production.
- **Do** use separate keys for testing and production, with spending limits.

## If a key leaks

1. **Revoke it immediately** in the provider's console.
2. **Create a new key** and update your \`.env\`.
3. Check the usage page for activity you do not recognise.
4. Then clean up the repository history.

Revoking comes first — deleting the file does not help, because the old key may already have been copied.

> **Analyst tip:** if you have ever shared a notebook with a password in a cell, treat that password as compromised and rotate it. Same rule.

## Key takeaways

- Keep keys in \`.env\` or a secret manager — never in code.
- Add \`.env\` to \`.gitignore\`; commit only \`.env.example\`.
- If a key leaks, revoke first, then clean up.`,
      videos: [ytSearch('how to keep API keys safe .env file gitignore')],
      quizzes: [
        {
          question: 'You accidentally pushed a file containing your API key to a public repository. What is the first thing to do?',
          options: [
            'Delete the file and hope nobody saw it',
            'Revoke the key in the provider console and create a new one',
            'Rename the repository',
            'Ask a friend to keep the secret',
          ],
          correct: 1,
          explanation: 'Revoke first — the key may already have been copied. Cleaning up the repository comes afterwards.',
        },
      ],
    },
  ],
  finalQuiz: [
    {
      question: 'What does an API let software do?',
      options: [
        'Use a service such as an AI model without a chat window',
        'Print documents',
        'Make the model forget everything',
        'Change a model\'s weights',
      ],
      correct: 0,
      explanation: 'An API lets programs send requests to a service and receive responses.',
    },
    {
      question: 'Which best describes an API key?',
      options: [
        'A public nickname for the model',
        'A secret string that identifies, authorises and bills the caller',
        'A type of prompt',
        'A free pass with no cost',
      ],
      correct: 1,
      explanation: 'The key identifies who is calling, authorises the request and links usage to billing.',
    },
    {
      question: 'Is a chat subscription the same as API access?',
      options: [
        'Yes, they always share one bill',
        'No — they are usually separate products with separate billing',
        'Yes, but only on weekends',
        'Only if you use the same email address',
      ],
      correct: 1,
      explanation: 'Chat plans and API usage are normally billed separately.',
    },
    {
      question: 'When you create an API key in a provider console, what should you do right away?',
      options: [
        'Copy it and store it somewhere safe, because it may be shown only once',
        'Post it on social media',
        'Email it to your whole team',
        'Ignore it — you can always view it again',
      ],
      correct: 0,
      explanation: 'Keys are typically shown once at creation, so copy them to a password manager or .env file immediately.',
    },
    {
      question: 'A request to an AI API returns status 429. What does it mean?',
      options: [
        'The model is offline forever',
        'You are sending too many requests too quickly',
        'The key is perfect',
        'The answer was blank',
      ],
      correct: 1,
      explanation: '429 means you hit a rate limit. Slow down and retry with backoff.',
    },
    {
      question: 'Which two things determine the cost of most AI API calls?',
      options: [
        'Colour of the prompt and time of day',
        'Input tokens and output tokens, at the chosen model\'s prices',
        'The number of emojis',
        'The length of your API key',
      ],
      correct: 1,
      explanation: 'You pay for tokens sent and tokens generated, priced per model.',
    },
    {
      question: 'Where should an API key be stored in a project?',
      options: [
        'Hard-coded in the source file',
        'In a .env file that is listed in .gitignore, or in a secret manager',
        'In the README',
        'In a public chat channel',
      ],
      correct: 1,
      explanation: 'Keep keys out of code: use an ignored .env file or a secret manager.',
    },
    {
      question: 'Your key appears in a public repository. What is the correct order of actions?',
      options: [
        'Delete the file, then wait',
        'Revoke the key, create a new one, check usage, then clean the history',
        'Do nothing — nobody reads repositories',
        'Rename the key',
      ],
      correct: 1,
      explanation: 'Revoke first because the key may already be copied, then replace it and check for misuse.',
    },
  ],
};
