import { TopicContent, yt, ytSearch } from '../types';

export const topic3: TopicContent = {
  slug: 'ai-tools-landscape',
  title: 'AI Tools Landscape',
  description: 'ChatGPT, Claude, Gemini, Midjourney, Copilot — and which one for what.',
  sessions: [
    {
      title: 'The AI assistants: ChatGPT, Claude, Gemini and Copilot',
      markdown: `## Four names you will hear constantly

These products are all **chat assistants** built on large language models. They overlap a lot, but each has a personality and a home turf. Features change quickly, so treat this as a map of tendencies and check each product's current page before you commit.

| Assistant | Made by | Often chosen for |
| --- | --- | --- |
| **ChatGPT** | OpenAI | A broad all-rounder with a large ecosystem: chat, voice, image creation, data analysis, custom assistants |
| **Claude** | Anthropic | Long documents, careful writing and reasoning, coding, and organised work with *Projects* |
| **Gemini** | Google | Tight links to Google's apps (Gmail, Docs, Sheets, Drive), search and multimodal input |
| **Microsoft Copilot** | Microsoft | Living inside Microsoft 365 — Excel, Word, Outlook, Teams — and Windows |

## What they share

All four can summarise, draft, explain, brainstorm, translate and answer questions. All four can be wrong. All four can handle more than text, such as images, in at least some versions.

## What to compare

- **Where do you already work?** If your team lives in Microsoft 365 or Google Workspace, the matching assistant is convenient because it sits next to your files.
- **How long are your inputs?** Reports and long contracts reward a large context window.
- **What are the privacy rules?** Work accounts often come with stronger data protections than free personal ones.
- **How does it feel to use?** Try the same prompt in two assistants and see which answer you would actually send.

> **Analyst tip:** do not hunt for a single "best" assistant. Many people keep two: one general-purpose, plus the one built into their daily tools.

## Key takeaways

- ChatGPT, Claude, Gemini and Copilot are capable, overlapping chat assistants.
- Pick by where you work, input length, privacy needs and feel.
- Feature lists change fast — test on your own tasks.`,
      videos: [yt('EWvNQjAaOHw', 'How I use LLMs — Andrej Karpathy')],
      quizzes: [
        {
          question: 'Your whole team works in Excel, Outlook and Teams every day. Which kind of assistant is most convenient to try first?',
          options: [
            'One built into Microsoft 365',
            'An image generator',
            'A voice cloning tool',
            'A video editor',
          ],
          correct: 0,
          explanation: 'An assistant that lives inside the apps you already use sits right next to your files and workflow.',
        },
        {
          question: 'Which is the best way to decide between two AI assistants for your work?',
          options: [
            'Pick the one with the longest name',
            'Run the same real task in both and compare the answers',
            'Always choose whichever is newest',
            'Ask each one which is better and believe it',
          ],
          correct: 1,
          explanation: 'Testing both on your own tasks tells you far more than any feature list.',
        },
      ],
    },
    {
      title: 'Image AI: Midjourney, DALL·E and Stable Diffusion',
      markdown: `## From words to pictures

Image generators turn a text description into a picture. Most of them use a technique called **diffusion**: start with pure visual noise, then remove noise step by step, guided by your prompt, until an image appears.

## The three names

- **Midjourney** — known for polished, stylised, artistic images. You use it through its website or its Discord server.
- **DALL·E and OpenAI's image models** — image creation built into ChatGPT, handy because you can describe and refine the picture in conversation.
- **Stable Diffusion** — a family of **open-weights** models. You can run them on your own computer or through other services, and you get the most control and customisation, at the cost of more setup.

## Writing a good image prompt

Cover the basics: **subject**, **setting**, **style**, **lighting**, and **format**.

> "A friendly pink robot duck walking along a dotted trail on a hand-drawn map, flat illustration, warm paper background, wide format."

Then iterate: change one thing at a time, such as the style or the colours.

## Things to watch

- **Licensing and copyright.** Rules differ by tool and country. Check the terms before using images commercially.
- **Text in images.** Generators are better than they were but can still misspell words — check carefully.
- **Honesty.** If a chart or "photo" is AI-generated, say so. Never present generated images as real evidence.

> **Analyst tip:** image AI is great for slide illustrations, mock-ups and moodboards. It is not a substitute for a real chart built from real data.

## Key takeaways

- Diffusion models create images by gradually removing noise.
- Midjourney = polish, DALL·E-style tools = convenience in chat, Stable Diffusion = control.
- Check licensing and label generated images.`,
      videos: [ytSearch('how diffusion models generate images explained simply')],
      quizzes: [
        {
          question: 'Which tool family is known for being open-weights, letting you run models yourself with the most control?',
          options: ['Stable Diffusion', 'Midjourney', 'Microsoft Excel', 'Google Maps'],
          correct: 0,
          explanation: 'Stable Diffusion models are open-weights, which is why people run and customise them locally.',
        },
      ],
    },
    {
      title: 'Code AI: GitHub Copilot, Cursor and Claude Code',
      markdown: `## Your pair programmer

Coding assistants help you write, explain and fix code. For an analyst, that means faster SQL, Python and spreadsheet formulas — even if you are not a full-time developer.

## Three styles of tool

1. **GitHub Copilot** — an assistant that lives inside your code editor. It suggests the next lines as you type and has a chat panel for questions.
2. **Cursor** — a code editor built around AI. You can describe a change in plain English and it edits across several files for you to review.
3. **Claude Code** — an *agentic* coding tool you run in the terminal. You describe a goal; it reads your project, proposes edits, and can run commands — asking your permission along the way.

## What you can ask for

- "Write a SQL query that returns monthly revenue by region."
- "Explain what this Python function does, line by line."
- "This pandas script is slow — suggest a faster version."
- "Why does this formula return an error?"

## Using them safely

- **Read before you run.** Generated code can look right and be subtly wrong. Review it, then test on a small sample.
- **Never paste secrets.** Passwords, API keys and customer data do not belong in prompts or code you share.
- **Be careful with tools that can run commands.** Keep permissions tight and read what is about to happen.
- **Own the result.** If you ship it, you are responsible for it.

> **Analyst tip:** ask the assistant to *explain* its code. If you cannot follow the explanation, simplify the request until you can.

## Key takeaways

- Code AI ranges from inline suggestions to agents that edit projects.
- Always review and test generated code.
- Keep secrets out of prompts.`,
      videos: [ytSearch('GitHub Copilot vs Cursor vs Claude Code for beginners')],
      quizzes: [
        {
          question: 'An AI assistant writes a SQL query for you. What is the best next step?',
          options: [
            'Run it on the full production database straight away',
            'Read it, understand it, and test it on a small sample first',
            'Delete it',
            'Send it to your manager without reading it',
          ],
          correct: 1,
          explanation: 'Generated code can be subtly wrong. Review it and test on a small sample before relying on it.',
        },
      ],
    },
    {
      title: 'Voice and video AI tools',
      markdown: `## Beyond text and images

AI can also listen, speak and make video. Four groups of tools matter for most workplaces.

### 1. Speech to text (transcription)

Turns audio into written text. It powers meeting notes, interview transcripts and captions. Many video-call apps now include it, and dedicated tools such as Otter exist too. Always skim transcripts for names, numbers and jargon it may have misheard.

### 2. Text to speech (voice)

Turns text into natural-sounding speech — used for narration, accessibility and voice assistants. Services such as ElevenLabs are well known here.

### 3. Video generation

Models such as **Sora**, **Veo** and **Runway** create short video clips from a text description or an image.

### 4. AI presenters and dubbing

Tools such as **Synthesia** and **HeyGen** create talking-presenter videos from a script and can translate and dub video into other languages.

## Responsible use

- **Get consent** before cloning anyone's voice or likeness.
- **Be transparent.** Tell people when audio or video is synthetic.
- **Remember deepfakes exist.** A convincing recording is no longer proof by itself — verify important claims.
- **Protect meetings.** Check your company policy before recording or transcribing calls with external parties.

> **Analyst tip:** the highest-value, lowest-risk win for most analysts is transcription plus a summary: record, transcribe, then ask an assistant for decisions and action items.

## Key takeaways

- Transcription, voice, video generation and AI presenters are the main categories.
- Always check transcripts and get consent for voices and faces.
- Synthetic media needs transparency.`,
      videos: [ytSearch('AI voice and video generation tools overview for beginners')],
      quizzes: [
        {
          question: 'Before creating a synthetic voice that sounds like a colleague, what should you do?',
          options: [
            'Nothing — it is only a voice',
            'Get their consent',
            'Make it sound as convincing as possible and hide that it is AI',
            'Post it publicly to see what happens',
          ],
          correct: 1,
          explanation: 'Cloning a person\'s voice or likeness requires their consent, and synthetic media should be disclosed.',
        },
      ],
    },
    {
      title: 'Choosing the right tool for the right job',
      markdown: `## Start with the job, not the tool

New tools appear every week. Instead of chasing them, use a simple routine.

### 1. Name the job

Be concrete: "Summarise a 40-page report into one page", "Draw a hero illustration", "Transcribe this interview".

### 2. Ask five questions

1. **What kind of output?** Text, image, code, audio or video?
2. **How sensitive is the input?** Customer data and unpublished numbers need an approved, private setup.
3. **How much does it have to be right?** A brainstorm can be rough; a figure in a board pack cannot.
4. **Where do I work?** A tool that fits into your existing apps gets used.
5. **What does it cost** in money and in time to check the result?

### 3. Match job to tool type

| Job | Start with |
| --- | --- |
| Draft, summarise, explain, brainstorm | A chat assistant |
| Work inside spreadsheets and email | The assistant built into your office suite |
| Visuals for a slide | An image generator |
| SQL, Python or formulas | A coding assistant |
| Meeting notes | Transcription, then a summary prompt |

### 4. Try, compare, keep what works

Run the same prompt in two tools. Keep a small library of prompts that worked, and note which tool you used.

### 5. Keep a human in the loop

AI drafts; you decide. The more it matters, the more careful your review should be.

> **Analyst tip:** write down the five questions as a checklist and reuse it. It works for tools that have not been invented yet.

## Key takeaways

- Define the job first, then match a tool type.
- Sensitivity, accuracy needs and your existing apps decide the shortlist.
- Compare on real tasks and always review important output.`,
      videos: [ytSearch('how to choose the right AI tool for the job')],
      quizzes: [
        {
          question: 'You need to turn a long interview recording into notes with action items. Which workflow fits best?',
          options: [
            'Image generator, then video generator',
            'Transcription, then a chat assistant to summarise and list actions',
            'A code editor',
            'A text-to-speech voice',
          ],
          correct: 1,
          explanation: 'Transcribe the audio first, then ask a chat assistant to summarise and pull out actions — and skim the result.',
        },
      ],
    },
  ],
  finalQuiz: [
    {
      question: 'Which of these is an AI chat assistant built into Microsoft 365?',
      options: ['Midjourney', 'Microsoft Copilot', 'Stable Diffusion', 'Cursor'],
      correct: 1,
      explanation: 'Microsoft Copilot is the assistant integrated into Microsoft 365 apps.',
    },
    {
      question: 'What is the best way to compare two AI assistants for your work?',
      options: [
        'Compare their logos',
        'Run the same real task in both and judge the results',
        'Read only the marketing pages',
        'Pick whichever is more expensive',
      ],
      correct: 1,
      explanation: 'Testing on your own tasks is the most reliable way to compare.',
    },
    {
      question: 'How do most modern image generators create a picture?',
      options: [
        'By searching the web and copying a photo',
        'By starting with noise and removing it step by step, guided by the prompt',
        'By drawing every pixel by hand',
        'By asking a designer',
      ],
      correct: 1,
      explanation: 'Diffusion models gradually remove noise, guided by your text prompt.',
    },
    {
      question: 'Which statement best matches Stable Diffusion?',
      options: [
        'It is a spreadsheet function',
        'It is a family of open-weights models you can run and customise yourself',
        'It only works inside Gmail',
        'It is a video-call app',
      ],
      correct: 1,
      explanation: 'Stable Diffusion models are open-weights, giving users more control and customisation.',
    },
    {
      question: 'Which description fits Claude Code?',
      options: [
        'An agentic coding tool in the terminal that can read a project and propose edits',
        'A tool that only generates pictures',
        'A voice cloning service',
        'A spreadsheet add-in that cannot touch files',
      ],
      correct: 0,
      explanation: 'Claude Code is a terminal-based agentic coding tool that works with your project and asks permission for actions.',
    },
    {
      question: 'Which practice is safest when using a coding assistant?',
      options: [
        'Paste your database password into the prompt so it has full context',
        'Review and test generated code, and keep secrets out of prompts',
        'Run all generated code on production immediately',
        'Never read the code',
      ],
      correct: 1,
      explanation: 'Review and test everything, and never share secrets in prompts.',
    },
    {
      question: 'Which is the most responsible way to use voice and video AI?',
      options: [
        'Clone anyone\'s voice without asking',
        'Get consent and tell people when media is synthetic',
        'Hide that the media is AI-made',
        'Assume a realistic recording must be real',
      ],
      correct: 1,
      explanation: 'Consent and transparency are essential, and realistic media is no longer automatic proof.',
    },
    {
      question: 'What should come first when choosing an AI tool?',
      options: [
        'Whichever tool is trending this week',
        'Defining the job you need done',
        'Buying the most expensive plan',
        'Watching every tutorial',
      ],
      correct: 1,
      explanation: 'Start with the job — the output you need, how sensitive the data is and how accurate it must be.',
    },
  ],
};
