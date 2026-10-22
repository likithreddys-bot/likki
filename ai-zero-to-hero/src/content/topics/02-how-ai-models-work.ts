import { TopicContent, yt, ytSearch } from '../types';

export const topic2: TopicContent = {
  slug: 'how-ai-models-work',
  title: 'How AI Models Work',
  description: 'Weights, tokens, temperature and context windows — simply.',
  sessions: [
    {
      title: 'What is a model? Weights and parameters, simply',
      markdown: `## A model is a formula with dials

If you have ever fitted a trend line in a spreadsheet, you have built a tiny model:

**price = 3.2 × size + 50**

The formula has two numbers — **3.2** and **50** — that were *learned* from data. Change them and the predictions change. Those learned numbers are the model's **parameters**, and the multipliers are often called **weights**.

## Scale it up

A modern language model is the same idea with a very large number of dials. Instead of two parameters it has **billions**. Each one is a small number, and together they decide how the model turns your words into a reply.

- The **architecture** is the shape of the formula (for chat models, it is called a *transformer*).
- The **weights** are the learned numbers inside that shape.
- A trained model is, in the end, **a very large file of numbers** plus the code that runs them.

> **Analyst tip:** more parameters usually means more capacity to learn patterns, but also more cost to run. Bigger is not always better for your task.

## What the model does not contain

It does not contain a database of facts it looks things up in, or a copy of the internet. It holds *patterns* squeezed into its weights. That is why it can write fluently about topics it has never seen quoted word for word — and why it can also be wrong with confidence.

## Key takeaways

1. A model is a formula whose learned numbers are called parameters or weights.
2. Language models have billions of them.
3. The weights store patterns, not a lookup table of facts.`,
      videos: [yt('LPZh9BOjkQs', 'Large Language Models explained briefly — 3Blue1Brown')],
      quizzes: [
        {
          question: 'In the formula price = 3.2 × size + 50, what are 3.2 and 50?',
          options: [
            'Prompts',
            'Learned parameters of the model',
            'Tokens',
            'Training examples',
          ],
          correct: 1,
          explanation: 'They are the numbers learned from data — the model\'s parameters (weights).',
        },
      ],
    },
    {
      title: 'Training vs inference',
      markdown: `## Two very different phases

Every AI model has two lives.

### Training: learning the weights

During **training**, the model is shown enormous amounts of example data and its weights are nudged, over and over, so its predictions get better. For a large language model this means reading a huge amount of text and learning to predict the next piece of it.

Training is **slow and expensive**. It needs specialised hardware running for a long time, and it is done by the company that builds the model — not by you.

### Inference: using the model

Once training is finished, the weights are **frozen**. When you type a prompt and get an answer, that is **inference**: the frozen model runs your input through its weights and produces output.

Inference is much cheaper than training, but it is not free. Every answer uses computing power, which is part of why AI services charge by usage.

## Does the model learn from my chat?

By default, **no**. Your conversation does not change the model's weights. Within a single chat the model can *use* what you said earlier, but only because that text is sent along with each new message. Some products add a separate "memory" feature that stores notes about you, and providers may use conversations to improve future models depending on your settings and plan — so it is worth reading the privacy options.

> **Analyst tip:** think of training as printing a very large reference book, and inference as looking things up in it. You cannot rewrite the book by asking questions.

## Key takeaways

- Training = learning the weights (expensive, done by the provider).
- Inference = using the frozen model to produce answers.
- Chatting does not retrain the model by default.`,
      videos: [yt('zjkBMFhNj_g', '[1hr Talk] Intro to Large Language Models — Andrej Karpathy')],
      quizzes: [
        {
          question: 'You type a prompt into a chat assistant and get a reply. Which phase is this?',
          options: ['Training', 'Inference', 'Data collection', 'Labelling'],
          correct: 1,
          explanation: 'Inference means running the already-trained, frozen model to produce an output.',
        },
        {
          question: 'Which statement about training is true?',
          options: [
            'It happens every time you send a message',
            'It is cheap enough to do on a laptop for large models',
            'It is the expensive phase where the weights are learned',
            'It is the same thing as inference',
          ],
          correct: 2,
          explanation: 'Training is when the weights are learned. It is costly and done by the provider.',
        },
      ],
    },
    {
      title: 'What is a token? How LLMs read text',
      markdown: `## Models read tokens, not words

A language model never sees letters or whole words. Before it reads anything, your text is chopped into small pieces called **tokens**, and each token is turned into a number the model can work with.

A token can be a whole common word ("data"), part of a longer word ("un" + "believ" + "able"), a space plus a word, or a punctuation mark.

**"Data analysts love spreadsheets."** might become: \`Data\` · \`analysts\` · \`love\` · \`spread\` · \`sheets\` · \`.\` — six tokens.

## A rule of thumb for English

- **1 token ≈ ¾ of an English word** (about 4 characters)
- **100 tokens ≈ 75 words**
- **One page of text ≈ 500 tokens**

Other languages, code and unusual words usually need more tokens for the same meaning.

## Why tokens matter

1. **Cost.** Most AI services charge by the number of tokens you send *and* receive.
2. **Limits.** A model can only handle so many tokens at once (you will meet this in Session 5).
3. **Odd mistakes.** Because the model sees tokens rather than letters, tasks like "count the letters in this word" can trip it up.

> **Analyst tip:** long prompts and large pasted tables use more tokens than you would guess. Trim what the model does not need.

## Key takeaways

- Text is split into tokens before the model reads it.
- Roughly 100 tokens is about 75 English words.
- Tokens drive both cost and limits.`,
      videos: [yt('zduSFxRajkE', 'Let\'s build the GPT Tokenizer — Andrej Karpathy (advanced, optional)')],
      quizzes: [
        {
          question: 'Roughly how many English words are 100 tokens?',
          options: ['About 25 words', 'About 75 words', 'Exactly 100 words', 'About 400 words'],
          correct: 1,
          explanation: 'As a rule of thumb, 1 token is about three-quarters of an English word, so 100 tokens is about 75 words.',
        },
      ],
    },
    {
      title: 'Temperature and top-p: what these settings do',
      markdown: `## The model picks the next token

When a model writes, it works out a **probability for every possible next token** and then picks one. For example, after "The capital of France is" the token "Paris" gets a very high probability, and many others get tiny ones.

Two common settings control *how* it picks.

## Temperature: how adventurous?

- **Low temperature (near 0):** the model almost always picks the most likely token. Answers are predictable and repeatable. Good for extracting data, classifying text and writing code.
- **High temperature:** less likely tokens get a real chance. Answers become more varied and creative — and more likely to wander. Good for brainstorming names or taglines.

## Top-p: how wide a shortlist?

**Top-p** (also called *nucleus sampling*) limits the choice to the smallest set of likely tokens whose probabilities add up to *p*.

- **top-p = 0.1:** only the very top candidates are allowed — focused and safe.
- **top-p = 1.0:** every token is eligible — the widest range.

## Using them

| Task | Suggested feel |
| --- | --- |
| Pull fields out of messy text | Low temperature |
| Summarise a report | Low to medium |
| Brainstorm campaign ideas | Higher |

Most guides suggest changing **one** of the two at a time. Some chat apps do not expose these settings at all — they are most common when you use an API (Topic 5).

> **Analyst tip:** if you need the same output every run, such as a data-cleaning step, use a low temperature. Even then, tiny differences can still appear.

## Key takeaways

- Temperature controls randomness; top-p controls the size of the shortlist.
- Low = predictable and repeatable. High = varied and creative.
- Match the setting to the task.`,
      videos: [ytSearch('LLM temperature and top-p explained')],
      quizzes: [
        {
          question: 'You want an AI to pull invoice numbers out of messy emails, the same way every time. Which setting fits best?',
          options: [
            'A high temperature for creativity',
            'A low temperature for predictable output',
            'As many tokens as possible',
            'A very long prompt full of jokes',
          ],
          correct: 1,
          explanation: 'Extraction wants consistency, so a low temperature is the right choice.',
        },
      ],
    },
    {
      title: 'Context window: why it matters',
      markdown: `## The model\'s working memory

A model does not remember a conversation the way you do. Every time you send a message, the **whole conversation so far** is sent back in again, and the model reads it from the start.

The **context window** is the maximum number of tokens the model can look at in one go. It includes **your prompt, any documents you paste, the earlier chat, and the reply being written**.

Depending on the model, context windows range from a few thousand tokens to hundreds of thousands or more.

## What happens when it fills up

- Older parts of the conversation may be **cut off** or dropped, so the model stops "seeing" them.
- Very long inputs can make the model less reliable at using details buried in the middle.
- Bigger contexts cost more and run slower.

## How to work with it

1. **Put the important instructions where they will be seen** — at the start, and repeat them if the chat gets long.
2. **Start a fresh chat** for a new task instead of stretching one thread forever.
3. **Summarise** a long discussion and paste the summary into a new chat.
4. **Send only what is needed.** For a big spreadsheet, send the relevant columns or a sample.

> **Analyst tip:** if a model "forgets" something you told it twenty messages ago, it may have simply slid out of the window. Restate it.

## Key takeaways

- The context window is how much text the model can see at once, including its own reply.
- When it fills, older text drops out of view.
- Keep prompts focused and start fresh chats for new tasks.`,
      videos: [ytSearch('LLM context window explained')],
      quizzes: [
        {
          question: 'A model has a 4,000-token context window. What happens when a conversation grows past that?',
          options: [
            'The model gets smarter as the chat gets longer',
            'The oldest parts fall out of what the model can see',
            'It quietly switches to a bigger model',
            'Nothing — context windows are unlimited',
          ],
          correct: 1,
          explanation: 'Once the window is full, older text is dropped, so the model can no longer use it.',
        },
      ],
    },
  ],
  finalQuiz: [
    {
      question: 'What are a model\'s "weights"?',
      options: [
        'The physical size of the data centre',
        'The learned numbers that store what it picked up in training',
        'The number of words in your prompt',
        'The price you pay per answer',
      ],
      correct: 1,
      explanation: 'Weights (parameters) are the learned numbers inside the model.',
    },
    {
      question: 'What is "inference"?',
      options: [
        'Teaching the model with new data',
        'Using a trained model to produce an output for a new input',
        'Deleting the model\'s weights',
        'Labelling a dataset by hand',
      ],
      correct: 1,
      explanation: 'Inference is running the frozen model to get an answer.',
    },
    {
      question: 'By default, what happens to the model\'s weights when you chat with it?',
      options: [
        'They are updated after every message',
        'They stay the same — chatting does not retrain the model',
        'They are doubled',
        'They are deleted at the end of the chat',
      ],
      correct: 1,
      explanation: 'Chatting is inference. The weights are frozen unless the provider trains a new version.',
    },
    {
      question: 'What is a token?',
      options: [
        'A password for an AI service',
        'A small chunk of text the model reads as a number',
        'A single letter, always',
        'A file format',
      ],
      correct: 1,
      explanation: 'Text is split into tokens — pieces of words, whole words or punctuation.',
    },
    {
      question: 'Roughly how many tokens is a 750-word English document?',
      options: ['About 100', 'About 500', 'About 1,000', 'About 7,500'],
      correct: 2,
      explanation: '750 words ÷ 0.75 words per token ≈ 1,000 tokens.',
    },
    {
      question: 'A temperature near 0 makes answers…',
      options: [
        'More random and surprising',
        'More predictable and repeatable',
        'Longer',
        'Always correct',
      ],
      correct: 1,
      explanation: 'Low temperature makes the model pick the most likely tokens, so output is more consistent. It does not guarantee correctness.',
    },
    {
      question: 'What does top-p control?',
      options: [
        'How long the answer is',
        'Which candidate tokens are allowed — only the most likely ones that add up to p',
        'The language of the answer',
        'How many tokens you can send',
      ],
      correct: 1,
      explanation: 'Top-p limits the shortlist of tokens the model may choose from.',
    },
    {
      question: 'Why can a model seem to "forget" something you said earlier in a very long chat?',
      options: [
        'It is bored',
        'The earlier text may have fallen outside its context window',
        'Models can only remember one message',
        'The weights were deleted',
      ],
      correct: 1,
      explanation: 'When a chat exceeds the context window, older text is no longer visible to the model.',
    },
  ],
};
