import { TopicContent, ytSearch } from '../types';

export const topic4: TopicContent = {
  slug: 'prompt-engineering',
  title: 'Prompt Engineering',
  description: 'Zero-shot, few-shot, chain of thought and persona prompts.',
  sessions: [
    {
      title: 'What is a prompt?',
      markdown: `## A prompt is everything you hand the model

A **prompt** is the input you give an AI model. It can be a one-line question, or a long message with background, a document and detailed instructions. The model's reply is shaped by *all* of it — plus any hidden instructions the app adds.

**Prompt engineering** is simply the habit of writing prompts that reliably get useful answers.

## A four-part recipe

Most strong prompts contain these parts:

1. **Context** — who you are, who the answer is for, what it is about.
2. **Task** — the one thing you want done, as a clear verb.
3. **Format** — how the answer should look: bullets, a table, 100 words, JSON.
4. **Constraints** — what to include, avoid or assume.

## Weak versus strong

**Weak:** "Tell me about churn."

**Strong:** "I'm a data analyst at a subscription software company. **Task:** list the five most common reasons customers cancel. **Format:** a table with columns *Reason*, *Warning sign in our data*, *Suggested fix*. **Constraints:** keep each cell under 15 words and avoid jargon."

The second prompt takes thirty seconds longer to write and saves several rounds of back-and-forth.

> **Analyst tip:** treat a prompt like a brief for a new colleague. If they would need to ask clarifying questions, the model probably does too.

## Key takeaways

- A prompt is all the input the model sees.
- Context + Task + Format + Constraints is a reliable recipe.
- A little more detail up front saves a lot of retries.`,
      videos: [ytSearch('prompt engineering for beginners explained')],
      quizzes: [
        {
          question: 'Which prompt is most likely to give a useful answer?',
          options: [
            '"Tell me about churn."',
            '"Churn?"',
            '"As an analyst at a subscription company, list five reasons customers cancel as a table with a suggested fix for each."',
            '"Write something about customers."',
          ],
          correct: 2,
          explanation: 'It gives context, a clear task and a format. The others leave the model guessing.',
        },
        {
          question: 'Which is NOT one of the four parts of the recipe in this session?',
          options: ['Context', 'Task', 'Format', 'Password'],
          correct: 3,
          explanation: 'The recipe is Context, Task, Format and Constraints.',
        },
      ],
    },
    {
      title: 'Zero-shot vs few-shot prompting',
      markdown: `## Showing beats telling

### Zero-shot: instructions only

In a **zero-shot** prompt you describe the task and give *no examples*.

> Classify this customer comment as Positive, Negative or Neutral: "The app is fine, I guess."

Modern models handle plenty of tasks this way, but the format of the answer can drift and borderline cases can go either way.

### Few-shot: add examples

In a **few-shot** prompt you include a handful of worked examples before the real input. The model copies the pattern.

> Classify each comment as Positive, Negative or Neutral.
>
> Comment: "Love the new dashboard!" → Positive
> Comment: "Checkout keeps crashing." → Negative
> Comment: "It does what it says." → Neutral
>
> Comment: "The app is fine, I guess." →

## When few-shot shines

- **Consistent formatting** — labels, JSON, tidy tables.
- **House style** — matching your team's tone.
- **Tricky categories** — showing what *counts* as Neutral for you.

## Tips

1. **Two to five examples** is usually enough.
2. **Make them varied** and cover edge cases, not just easy ones.
3. **Keep the format identical** in every example.
4. **Watch the length** — examples use tokens (Topic 2) and fill the context window.

> **Analyst tip:** few-shot prompting is like giving the model a labelled sample from your own dataset. It is often the quickest way to get consistent tagging.

## Key takeaways

- Zero-shot = instructions only. Few-shot = instructions plus examples.
- Examples teach format, tone and edge cases.
- A few varied, consistent examples go a long way.`,
      videos: [ytSearch('zero-shot vs few-shot prompting explained')],
      quizzes: [
        {
          question: 'What is a few-shot prompt?',
          options: [
            'A prompt that is very short',
            'A prompt that includes a few worked examples',
            'A prompt sent several times',
            'A prompt with no task',
          ],
          correct: 1,
          explanation: 'Few-shot prompts include a small number of examples that the model imitates.',
        },
        {
          question: 'You need the model to label comments exactly the way your team does, including odd edge cases. What helps most?',
          options: [
            'A longer introduction about yourself',
            'Several varied examples of correctly labelled comments',
            'A higher temperature',
            'Asking it to be "creative"',
          ],
          correct: 1,
          explanation: 'Varied examples show the model your exact labelling rules, including edge cases.',
        },
      ],
    },
    {
      title: 'Chain-of-thought prompting',
      markdown: `## Let it think on the page

Language models produce text one token at a time. When a question needs several steps — arithmetic, logic, comparing options — answering in a single leap is risky. **Chain-of-thought (CoT)** prompting asks the model to write out its reasoning *before* the final answer.

The simplest version is one extra sentence:

> "Work through this step by step, then give the final answer."

## Example

**Question:** "A product sold 1,200 units in Q1 and 15% more in Q2. Then Q3 was 10% below Q2. How many units in Q3?"

With step-by-step reasoning the model writes: Q2 = 1,200 × 1.15 = 1,380. Q3 = 1,380 × 0.90 = 1,242. **Answer: 1,242.** Showing the steps makes slips easier for both of you to spot.

## Make it useful

- **Ask for assumptions first**, then the answer.
- **Separate the reasoning from the result:** "Show your reasoning, then write the result on a line starting with 'Answer:'."
- **Use it for** multi-step maths, planning, trade-offs and debugging.

## Cautions

1. Some newer "reasoning" models already think before replying, so the extra sentence matters less — but it rarely hurts.
2. Written reasoning can *look* convincing and still contain errors. **Check the arithmetic yourself**, or use a calculator or code for exact figures.
3. Step-by-step answers are longer, so they use more tokens.

> **Analyst tip:** for anything numerical, ask the model to show its working, then verify one or two steps in a spreadsheet.

## Key takeaways

- Chain-of-thought asks the model to reason in steps before answering.
- It helps with multi-step problems and makes errors visible.
- Reasoning on the page is not proof — verify numbers.`,
      videos: [ytSearch('chain of thought prompting explained')],
      quizzes: [
        {
          question: 'Which request is a chain-of-thought prompt?',
          options: [
            '"Answer in one word."',
            '"Work through this step by step, then give the final answer."',
            '"Be creative."',
            '"Repeat my question."',
          ],
          correct: 1,
          explanation: 'Chain-of-thought prompting asks the model to show its reasoning steps before the answer.',
        },
      ],
    },
    {
      title: 'Role prompting and persona',
      markdown: `## Give the model a point of view

A **role** (or **persona**) tells the model *who it is* and *who it is talking to*. That shapes vocabulary, depth and tone.

> "You are a senior data analyst. Explain this regression output to a non-technical sales manager in plain language, in under 120 words."

Same facts, very different answer from "Explain this regression output."

## Two useful dials

- **Who the model is:** a senior analyst, a careful editor, a sceptical reviewer, a patient tutor.
- **Who the audience is:** a CFO, a new hire, a customer, a twelve-year-old.

## Roles that work

- **Reviewer:** "Act as a sceptical reviewer. List the three weakest assumptions in this analysis."
- **Tutor:** "Act as a patient tutor. Quiz me one question at a time on SQL joins."
- **Editor:** "Act as an editor. Cut this by a third without losing any numbers."

## What roles cannot do

- A role does **not** give the model knowledge it lacks. "You are the world's best statistician" does not make wrong maths right.
- Flowery titles add little. **Clear instructions beat grand job titles.**
- The model can still be wrong in character.

## Combine, don't replace

Pair a role with the recipe from Session 1: role, then context, task, format and constraints. Many apps also let you save a role as standing instructions (you will see this in Topic 6).

> **Analyst tip:** the "sceptical reviewer" role is brilliant for catching holes in your own analysis before a stakeholder does.

## Key takeaways

- Roles shape tone, depth and perspective; set the audience too.
- A role does not add knowledge or guarantee accuracy.
- Combine role + context + task + format.`,
      videos: [ytSearch('role prompting persona prompts explained')],
      quizzes: [
        {
          question: 'What does giving the model the role "world\'s best statistician" actually do?',
          options: [
            'Guarantees correct maths',
            'Gives it new knowledge it did not have',
            'Mainly shapes tone and perspective — accuracy still needs checking',
            'Removes the need for clear instructions',
          ],
          correct: 2,
          explanation: 'Roles influence style and framing but do not add knowledge or guarantee accuracy.',
        },
      ],
    },
    {
      title: 'Common prompt mistakes and how to fix them',
      markdown: `## Eight mistakes, eight fixes

| Mistake | Why it hurts | Fix |
| --- | --- | --- |
| **Too vague** — "Improve this." | The model has to guess what "better" means | Say what to improve: clarity, length, tone |
| **No context** | Generic answer for a generic reader | Say who you are, who it is for, why |
| **No format** | Output shape varies run to run | Ask for a table, bullets, a word limit |
| **Several tasks at once** | Some get done badly or skipped | One task per prompt, or number the steps |
| **Contradictory rules** — "Be brief but cover everything." | The model picks one | Decide your priority |
| **Only saying what to avoid** — "Don't be wordy." | Vague and easy to misread | Say what to do: "Under 100 words." |
| **Expecting recall of private facts** | It may invent plausible-sounding details | Paste the source text and ask it to use only that |
| **Accepting the first answer** | The first draft is rarely the best | Reply with specific changes and iterate |

## Two extra habits

1. **Ask it to check itself.** "List anything in your answer you are unsure about" often surfaces weak spots.
2. **Keep sensitive data out.** Do not paste confidential or personal information into tools that have not been approved for it.

## A quick fix in action

**Before:** "Summarise this."

**After:** "Summarise the report below for a busy VP in five bullets. Lead with the biggest risk. Use only information in the text. If a number is missing, say so rather than estimating."

> **Analyst tip:** when an answer disappoints, resist writing a whole new prompt. Name exactly what is off — "too long", "too technical", "missing the Q3 numbers" — and ask for that change.

## Key takeaways

- Most bad answers trace back to vague, context-free or overloaded prompts.
- Say what you want, not only what to avoid; supply source text for facts.
- Iterate with specific feedback.`,
      videos: [ytSearch('common prompt engineering mistakes and how to fix them')],
      quizzes: [
        {
          question: 'Which rewrite fixes the instruction "Don\'t be wordy"?',
          options: [
            '"Don\'t be too wordy, please."',
            '"Keep the answer under 100 words."',
            '"Be as long as you like."',
            '"Say less, or maybe more."',
          ],
          correct: 1,
          explanation: 'A concrete, positive instruction ("under 100 words") is clearer than a vague negative one.',
        },
      ],
    },
  ],
  finalQuiz: [
    {
      question: 'What is a prompt?',
      options: [
        'Only the first sentence you type',
        'All the input the model is given, including any context and instructions',
        'The model\'s reply',
        'A type of password',
      ],
      correct: 1,
      explanation: 'A prompt is everything handed to the model: your text, documents, earlier chat and instructions.',
    },
    {
      question: 'Which four parts make up the prompt recipe from this topic?',
      options: [
        'Greeting, joke, task, sign-off',
        'Context, task, format, constraints',
        'Token, weight, window, temperature',
        'Data, model, training, inference',
      ],
      correct: 1,
      explanation: 'The recipe is Context, Task, Format and Constraints.',
    },
    {
      question: 'What is the difference between zero-shot and few-shot prompting?',
      options: [
        'Zero-shot uses no examples; few-shot includes a few examples',
        'Zero-shot is faster to read',
        'Few-shot never uses instructions',
        'There is no difference',
      ],
      correct: 0,
      explanation: 'Zero-shot gives only instructions. Few-shot adds a small number of worked examples.',
    },
    {
      question: 'Which task benefits most from few-shot examples?',
      options: [
        'Tagging comments with your team\'s exact labels and edge-case rules',
        'Asking for the current time',
        'Saying hello',
        'Translating a single word',
      ],
      correct: 0,
      explanation: 'Few-shot examples are ideal for consistent labelling and house style.',
    },
    {
      question: 'What does chain-of-thought prompting ask the model to do?',
      options: [
        'Answer instantly with no explanation',
        'Reason through the problem in steps before giving the answer',
        'Repeat the question back',
        'Use a higher temperature',
      ],
      correct: 1,
      explanation: 'Chain-of-thought prompts ask for step-by-step reasoning before the final answer.',
    },
    {
      question: 'A model shows neat step-by-step working for a calculation. What should you do?',
      options: [
        'Trust it because it showed its work',
        'Check at least some of the arithmetic yourself',
        'Delete the answer',
        'Ask for a longer explanation only',
      ],
      correct: 1,
      explanation: 'Written reasoning can look convincing and still be wrong, so verify important numbers.',
    },
    {
      question: 'What is the main effect of giving the model a role such as "senior data analyst"?',
      options: [
        'It guarantees correct answers',
        'It shapes tone, depth and perspective',
        'It increases the context window',
        'It removes the need for a task',
      ],
      correct: 1,
      explanation: 'Roles influence how the answer is framed. They do not add knowledge or guarantee accuracy.',
    },
    {
      question: 'Which prompt is better for getting a short answer?',
      options: [
        '"Don\'t write too much."',
        '"Answer in under 80 words."',
        '"Be brief but cover absolutely everything."',
        '"Short, long, either is fine."',
      ],
      correct: 1,
      explanation: 'A specific limit is clear and measurable; the others are vague or contradictory.',
    },
    {
      question: 'You need a summary that uses only facts from a report. What is the safest approach?',
      options: [
        'Ask from memory and hope it knows the report',
        'Paste the report and tell the model to use only that text, flagging missing information',
        'Ask it to guess the missing numbers',
        'Use a very high temperature',
      ],
      correct: 1,
      explanation: 'Supply the source text and instruct the model to rely on it alone, so it does not invent details.',
    },
    {
      question: 'The model\'s first answer is close but too technical. What is the best follow-up?',
      options: [
        'Start again with a completely different prompt',
        'Reply: "Rewrite for a non-technical manager, in plain language, keep the numbers."',
        'Give up on AI',
        'Ask the same question again word for word',
      ],
      correct: 1,
      explanation: 'Name exactly what is off and ask for that change — iteration beats starting from scratch.',
    },
  ],
};
