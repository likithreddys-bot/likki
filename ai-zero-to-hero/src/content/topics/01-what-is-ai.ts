import { TopicContent, yt, ytSearch } from '../types';

export const topic1: TopicContent = {
  slug: 'what-is-ai',
  title: 'What is AI?',
  description: 'Understand AI, ML and deep learning without the jargon.',
  sessions: [
    {
      title: 'AI vs ML vs Deep Learning',
      markdown: `## Three words, one family tree

People use "AI", "machine learning" and "deep learning" as if they were the same thing. They are nested, like Russian dolls:

- **Artificial Intelligence (AI)** is the big idea: software that does things we would normally say need human intelligence — recognising a face, translating a sentence, planning a route.
- **Machine Learning (ML)** is one way to build AI. Instead of writing every rule by hand, you show the computer lots of examples and let it find the rules itself.
- **Deep Learning** is one kind of machine learning that uses *neural networks* with many layers. It powers today's image, voice and chat models.

> **Analyst tip:** if you have ever fit a regression or a decision tree, you have already done machine learning. Deep learning is the same idea with a much bigger, more flexible model.

## Rules versus examples

Imagine a spam filter. The old way: you write rules — "if the subject contains *WINNER*, mark as spam". Spammers adapt, and your list of rules grows forever.

The machine-learning way: you give the computer 100,000 emails already labelled *spam* or *not spam*. It works out for itself which patterns matter, including ones you would never have thought of.

## Where ChatGPT and Claude fit

Chat assistants are deep-learning models trained on huge amounts of text. They sit inside all three circles: they are deep learning, which is machine learning, which is AI.

## Key takeaways

1. AI is the goal; machine learning is a method; deep learning is a powerful kind of machine learning.
2. ML learns patterns from examples instead of following hand-written rules.
3. Modern chat tools are deep-learning models.`,
      videos: [yt('aircAruvnKk', 'But what is a neural network? — 3Blue1Brown')],
      quizzes: [
        {
          question: 'Which statement best describes the relationship between AI, ML and deep learning?',
          options: [
            'They are three names for exactly the same thing',
            'Deep learning is a kind of ML, and ML is one way to build AI',
            'AI is a kind of deep learning',
            'ML is a kind of AI that never uses data',
          ],
          correct: 1,
          explanation: 'Think of nested circles: deep learning sits inside machine learning, which sits inside AI.',
        },
        {
          question: 'What is the main difference between a hand-written rule system and machine learning?',
          options: [
            'Rule systems are always more accurate',
            'Machine learning needs no data',
            'Machine learning finds its own patterns from examples',
            'Rule systems can only run on paper',
          ],
          correct: 2,
          explanation: 'ML learns the rules from labelled examples instead of a person typing each rule in.',
        },
      ],
    },
    {
      title: 'How machines learn: patterns, data, predictions',
      markdown: `## The learning loop

Machines do not "understand" the way people do. They follow a simple loop:

1. **Data** — examples to learn from (emails, photos, sales rows).
2. **Pattern finding (training)** — the model adjusts itself to get better at a task, again and again.
3. **Prediction** — given something new, it makes its best guess.

Every AI system you will meet is a variation on that loop.

## A tiny example

Say you want to predict whether a customer will cancel next month. Your data is a table: one row per customer, columns like *months subscribed*, *support tickets*, *last login*, and a final column — *did they cancel?*

During training, the model looks at thousands of rows and notices patterns: lots of tickets plus no recent login often means a cancellation. Later you hand it a customer it has never seen and it returns a probability.

> **Analyst tip:** this is supervised learning — you give the model the "right answers" while it trains. Most business ML works this way.

## Good data beats clever maths

A model can only learn patterns that are in its data. If the data is incomplete, outdated or biased, the predictions will be too. "Garbage in, garbage out" is as true for AI as it is for spreadsheets.

## Predictions are guesses, not facts

The model gives its *best guess* based on patterns. Sometimes it is confidently wrong. Part of using AI well is knowing when to double-check.

## Key takeaways

- The loop is data → training → prediction.
- Quality and coverage of data decide quality of results.
- Treat every output as an informed guess.`,
      videos: [yt('IHZwWFHWa-w', 'Gradient descent, how neural networks learn — 3Blue1Brown')],
      quizzes: [
        {
          question: 'In the "learning loop", what happens during training?',
          options: [
            'The model is shown new customers and makes final decisions',
            'The model adjusts itself to get better at the task using example data',
            'A human writes the rules the model will follow',
            'The data is deleted so the model cannot memorise it',
          ],
          correct: 1,
          explanation: 'Training is the phase where the model repeatedly tunes itself against example data.',
        },
      ],
    },
    {
      title: 'Types of AI: narrow, general and super',
      markdown: `## Three levels of ambition

Researchers talk about AI in three levels. Only the first exists today.

### 1. Narrow AI (also called "weak" AI)

Built to do **one kind of job** well. A chess engine plays chess and nothing else. A spam filter filters spam. A route planner plans routes. Even a chat assistant, impressive as it is, is a narrow system at heart: it is trained to predict useful text.

**Every AI product you can use today is narrow AI.**

### 2. General AI (AGI)

A hypothetical system that could learn *any* intellectual task a person can — switching from accounting to cooking to physics with the same flexibility. Nobody has built one, and experts disagree on if or when it might happen.

### 3. Super AI (ASI)

A hypothetical system that is better than the best humans at essentially everything. This is mostly the territory of science fiction and long-term safety research.

## Why this matters to you

When a headline says "AI will do everything", remember what exists today: very capable tools that are strong at specific kinds of work and still make mistakes.

> **Analyst tip:** ask "what exact task is this tool good at?" That question cuts through most AI hype.

## Key takeaways

- Narrow AI = one job, done well. Everything you use today.
- General AI = human-level flexibility. Not here yet.
- Super AI = beyond human ability. Hypothetical.`,
      videos: [ytSearch('narrow AI vs general AI explained for beginners')],
      quizzes: [
        {
          question: 'Which of these is an example of narrow AI?',
          options: [
            'A system that can learn any task a human can',
            'A spam filter that only sorts email',
            'A machine smarter than all humans at everything',
            'A robot with human-level common sense',
          ],
          correct: 1,
          explanation: 'A spam filter does exactly one job. All AI in everyday use today is narrow AI.',
        },
      ],
    },
    {
      title: 'Real-world AI: Netflix, Spotify and Google Maps',
      markdown: `## You already use AI every day

AI is not a future technology. Here are three examples you probably used this week.

### Netflix: recommendations

Netflix tracks what you watch, how long you watch, what you skip and when. It compares your habits with millions of other viewers, finds people with similar taste, and predicts what you are likely to enjoy next. The "Top picks for you" row is a prediction model at work — the artwork you see can even be personalised.

### Spotify: Discover Weekly

Spotify combines **what you listen to**, **what listeners like you play**, and **features of the songs themselves** (tempo, mood, instruments). The result is a playlist of songs you have never heard but are likely to like.

### Google Maps: arrival times

Maps blends live location data from phones, historical traffic for that road at that hour, and reported incidents to predict how long your trip will take and which route is fastest.

## The common thread

All three do the same thing from Session 2:

1. Collect **data** (your behaviour, other people's behaviour, sensors).
2. Find **patterns** in it.
3. Make a **prediction** about what you will want or what will happen.

> **Analyst tip:** notice how much of this is plain old data analysis at huge scale. Your skills transfer more than you think.

## Key takeaways

- Recommendation engines and route planners are everyday narrow AI.
- They run on data, patterns and predictions.
- Better data and more of it usually means better results.`,
      videos: [ytSearch('how do recommendation algorithms work Netflix Spotify')],
      quizzes: [
        {
          question: 'Which combination of inputs does a service like Spotify use to build a personalised playlist?',
          options: [
            'Only the artist names you type in',
            'Your listening, what similar listeners play, and features of the songs',
            'A random shuffle of the most popular songs',
            'Only the songs released this week',
          ],
          correct: 1,
          explanation: 'Recommendations blend your behaviour, other people with similar taste, and the songs themselves.',
        },
      ],
    },
    {
      title: 'Your first AI interaction: ChatGPT basics',
      markdown: `## Time to try it

Reading about AI only goes so far. Open a chat assistant such as **ChatGPT** (chat.openai.com) or **Claude** (claude.ai) and follow along. A free account is enough.

## The basic idea

You type a message — called a **prompt** — and the assistant replies. It can keep the thread of the conversation, so you can follow up, ask for changes or say "shorter, please".

## Try these three prompts

1. **Explain something.** "Explain what a p-value is to a smart 12-year-old."
2. **Transform something.** Paste a messy paragraph and type: "Rewrite this as three clear bullet points."
3. **Work with your data.** "I have monthly sales for 12 months. Suggest five ways to chart them and when each is best."

## Habits that help

- **Be specific.** Say who the answer is for and the format you want.
- **Iterate.** Treat the first answer as a draft and refine it.
- **Check the facts.** Assistants can sound certain and still be wrong, especially on numbers, quotes and recent events.
- **Mind privacy.** Do not paste confidential company or personal data into a tool you have not been cleared to use.

> **Analyst tip:** treat the assistant like a fast, well-read junior colleague. Great for first drafts and brainstorming — you still review the work.

## Key takeaways

- A prompt is just the message you send.
- Specific prompts and follow-ups give better results.
- Always verify important facts, and protect sensitive data.`,
      videos: [yt('2IK3DFHRFfw', 'Generative AI in a Nutshell — Henrik Kniberg')],
      quizzes: [
        {
          question: 'An assistant gives you a statistic that sounds precise. What should you do before using it in a report?',
          options: [
            'Use it — it sounded confident',
            'Verify it against a trusted source',
            'Ask the assistant to say it louder',
            'Round it to the nearest ten',
          ],
          correct: 1,
          explanation: 'Assistants can sound certain and still be wrong, so verify numbers and facts that matter.',
        },
      ],
    },
  ],
  finalQuiz: [
    {
      question: 'Which choice puts the three terms in the right order, from broadest to most specific?',
      options: [
        'Deep learning → machine learning → AI',
        'Machine learning → AI → deep learning',
        'AI → machine learning → deep learning',
        'AI → deep learning → machine learning',
      ],
      correct: 2,
      explanation: 'AI is the broad goal, machine learning is a method inside it, and deep learning is a kind of machine learning.',
    },
    {
      question: 'What is the key idea behind machine learning?',
      options: [
        'A programmer writes every rule by hand',
        'The computer learns patterns from example data',
        'The computer copies answers from the internet in real time',
        'The computer needs no data at all',
      ],
      correct: 1,
      explanation: 'ML replaces hand-written rules with patterns learned from examples.',
    },
    {
      question: 'Which sequence describes the basic learning loop?',
      options: [
        'Prediction → training → data',
        'Training → prediction → data',
        'Data → training → prediction',
        'Data → prediction → training',
      ],
      correct: 2,
      explanation: 'You start with data, train a model on it, and then use the model to predict.',
    },
    {
      question: 'A churn model was trained only on data from customers aged 20–30. What is the most likely problem?',
      options: [
        'It will work perfectly for every age group',
        'It may predict poorly for customers outside that age range',
        'It will refuse to make any predictions',
        'It will automatically collect more data',
      ],
      correct: 1,
      explanation: 'Models learn only what is in their data. Missing groups usually means weaker predictions for those groups.',
    },
    {
      question: 'Which of these is narrow AI?',
      options: [
        'A hypothetical machine as flexible as a human in every field',
        'A route planner that estimates your arrival time',
        'A system smarter than all humans combined',
        'A robot that can do any job after a single demo',
      ],
      correct: 1,
      explanation: 'Narrow AI does one kind of job. A route planner is a clear everyday example.',
    },
    {
      question: 'Which statement about general AI (AGI) is accurate today?',
      options: [
        'It is already in every smartphone',
        'It is hypothetical — it has not been built',
        'It is the same as a spam filter',
        'It only exists in Netflix',
      ],
      correct: 1,
      explanation: 'AGI is a hypothetical goal. Every AI product available today is narrow.',
    },
    {
      question: 'What is the common thread between Netflix recommendations, Discover Weekly and Google Maps arrival times?',
      options: [
        'They all rely on hand-written rules only',
        'They collect data, find patterns and make predictions',
        'They are all examples of super AI',
        'They do not use any data about you',
      ],
      correct: 1,
      explanation: 'All three follow the data → patterns → prediction loop.',
    },
    {
      question: 'Which habit leads to better results when chatting with an AI assistant?',
      options: [
        'Keep prompts as short and vague as possible',
        'Be specific about the audience and format, then refine with follow-ups',
        'Never read the answer closely',
        'Paste confidential data to give it more context',
      ],
      correct: 1,
      explanation: 'Specific prompts and iteration work best — and confidential data should not go into tools you have not been cleared to use.',
    },
  ],
};
