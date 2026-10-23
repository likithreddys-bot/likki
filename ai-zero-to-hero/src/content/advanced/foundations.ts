import { ytSearch, type TopicExtra } from '../types';

/** Advanced sessions for topics 1–3, keyed by topic slug. They are appended after the original sessions. */
export const foundationsAdvanced: Record<string, TopicExtra> = {
  'what-is-ai': {
    sessions: [
      {
        title: 'Bias, fairness and where AI goes wrong',
        markdown: `## AI learns from the past — including its flaws

A model finds patterns in the data it is given. If that data reflects an unfair or incomplete picture of the world, the model learns the same picture and repeats it at scale. This is called **bias**, and it is one of the most important things for anyone using AI at work to understand.

## Where bias comes from

- **Unrepresentative data.** A face-recognition system trained mostly on one group performs worse on others.
- **Historical decisions.** A hiring model trained on past hiring learns who *was* hired, not who *should* have been.
- **Proxies.** Even if you remove a sensitive column such as gender, other columns (postcode, school, job title) can stand in for it.
- **Labels written by people.** If the "right answers" came from humans with their own blind spots, the model inherits them.
- **Measurement choices.** Optimising one number (clicks, speed) can quietly harm another goal.

## Other ways AI goes wrong

- **Hallucination** — fluent text that is simply false.
- **Overconfidence** — a score of 0.97 looks precise but may be badly calibrated.
- **Distribution shift** — the world changes and the model's patterns go stale.
- **Misuse** — a tool built for one purpose gets applied to another.

## What an analyst can do

1. **Look at who is in the data** and who is missing.
2. **Break results down by group.** Overall accuracy of 90% can hide 70% for a smaller group.
3. **Ask what a wrong answer costs** and for whom.
4. **Keep a human in the loop** for decisions that affect people.
5. **Document** what the model is for, what it is *not* for, and how it was tested.

> **Analyst tip:** an average can hide a problem. Whenever you report a model's accuracy, ask "accuracy for whom?"

## Key takeaways

- Models copy the patterns in their data, including unfair ones.
- Removing a sensitive column does not remove bias, because other columns act as proxies.
- Always check performance by group, not just overall.
- Keep people involved in decisions that affect other people, and document limits.`,
        videos: [ytSearch('AI bias and fairness explained with real examples')],
        quizzes: [
          {
            question: 'A hiring model trained on ten years of past hiring decisions keeps favouring candidates similar to the people already employed. What is the most likely reason?',
            options: [
              'It learned the patterns in historical decisions, including their unfairness',
              'The model has a personal opinion about candidates',
              'Hiring data cannot be used for any analysis',
              'The model is too small to read CVs',
            ],
            correct: 0,
            explanation: 'Models reproduce the patterns in their training data. If past decisions were biased, the model learns that bias.',
          },
        ],
      },
      {
        title: 'The life of an AI project: from problem to production',
        markdown: `## Most of the work is not the model

A typical machine-learning project has stages, and the model itself is a small slice:

1. **Frame the problem.** What decision will this support? Who uses it? What does "good" look like in numbers?
2. **Check that AI is needed.** A rule, a query or a spreadsheet may do the job more cheaply and reliably.
3. **Collect and prepare data.** Usually the longest stage: finding it, cleaning it, labelling it, and checking it is fit for the question.
4. **Build a baseline.** A simple method (an average, a rule of thumb) sets the bar. A fancy model that barely beats the baseline may not be worth its cost.
5. **Train and evaluate.** Test on data the model has not seen, with a measure that matches the business goal.
6. **Deploy.** Put it where people can use it, with monitoring, logging and a way to switch it off.
7. **Monitor and maintain.** Data changes, so performance drifts. Plan to retrain and re-check.

## Training data versus test data

If you test a model on the same data it learned from, it will look better than it is — like marking a student on the exact questions they practised. Always hold back a **test set** that the model never sees during training.

## Choosing a measure

Accuracy alone can mislead. If only 1% of transactions are fraud, a model that always says "not fraud" is 99% accurate and useless. Think about:

- **Precision** — of the cases flagged, how many were right?
- **Recall** — of the real cases, how many did we catch?

Which matters more depends on the cost of each kind of mistake.

## Where analysts add the most value

Framing the question, understanding the data, choosing the right measure and telling the story honestly — none of which a model does for you.

## Key takeaways

- Most project effort goes into framing, data and monitoring, not model building.
- Beat a simple baseline before reaching for a complex model.
- Always evaluate on held-out data, with a measure that matches the real cost of mistakes.
- Plan for drift: deployed models need monitoring and maintenance.`,
        videos: [ytSearch('machine learning project lifecycle explained from problem to deployment')],
        quizzes: [
          {
            question: 'Only 1% of transactions are fraudulent. A model that labels every transaction "not fraud" scores 99% accuracy. What does this show?',
            options: [
              'The model is excellent',
              'Accuracy alone can be misleading when classes are very uneven, so recall and precision matter',
              'Fraud does not exist in the data',
              'The test set was too large',
            ],
            correct: 1,
            explanation: 'The model catches no fraud at all. Measures such as recall and precision reveal what accuracy hides.',
          },
        ],
      },
    ],
    finalQuiz: [
      {
        question: 'Removing the "gender" column from training data does not guarantee a fair model. Why?',
        options: [
          'Other columns, such as job title or postcode, can act as proxies for the removed attribute',
          'Models ignore column names',
          'Gender is never relevant to any pattern',
          'Removing columns makes the model slower',
        ],
        correct: 0,
        explanation: 'Correlated features can carry the same information, so bias can persist even after a sensitive column is dropped.',
      },
      {
        question: 'Why should a model be evaluated on a test set it never saw during training?',
        options: [
          'It makes training faster',
          'Results on the training data overstate how well it will work on new cases',
          'Test sets are cheaper to store',
          'It guarantees a perfect score',
        ],
        correct: 1,
        explanation: 'A model can memorise its training examples. Only unseen data shows whether it generalises.',
      },
    ],
  },

  'how-ai-models-work': {
    sessions: [
      {
        title: 'Inside the transformer: attention, in plain English',
        markdown: `## The idea behind modern language models

Most of today's language models are built on an architecture called the **transformer**. Its key idea is **attention**: when the model processes a word, it can look back at *every other word* in the context and decide how much each one matters.

## Why attention helps

Consider: "The trophy didn't fit in the suitcase because **it** was too big." What does "it" refer to? To understand the sentence, a model must link "it" to "trophy". Attention lets the model weigh "trophy" heavily when handling "it", wherever it appears in the text.

## The path through the model

1. **Tokens.** Text is split into tokens.
2. **Embeddings.** Each token becomes a vector of numbers carrying its meaning.
3. **Layers.** The vectors pass through many stacked layers. In each, attention mixes in information from other positions, and further calculations refine the result.
4. **Output.** At the end the model produces a probability for every possible next token, and one is chosen.
5. **Repeat.** The chosen token is added to the text and the process runs again, one token at a time.

## What this explains

- **Why context matters.** The model can only attend to what is in the context window; it has no memory outside it.
- **Why long inputs cost more.** Attention compares many pairs of tokens, so work grows as the text gets longer.
- **Why order and wording matter.** Different phrasing gives different token sequences and different attention patterns.
- **Why it is next-token prediction.** Everything it writes comes from repeating "what comes next?" — which is why it can sound fluent without checking facts.

> **Analyst tip:** you do not need the maths to use this mental model. Attention is "which earlier words should I focus on right now?"

## Key takeaways

- Transformers use attention to weigh how relevant every other token is to the current one.
- Text becomes tokens, then embeddings, then passes through many layers to predict the next token.
- Generation repeats one token at a time, which is why fluency does not guarantee truth.
- Longer contexts cost more because attention compares many pairs of tokens.`,
        videos: [ytSearch('transformers and attention explained visually for beginners')],
        quizzes: [
          {
            question: 'In "The trophy didn\'t fit in the suitcase because it was too big", what does attention help the model do?',
            options: [
              'Count the letters in each word',
              'Weigh how relevant other words are, so "it" can be linked to "trophy"',
              'Translate the sentence into a database query',
              'Remove the punctuation',
            ],
            correct: 1,
            explanation: 'Attention lets the model draw on the most relevant earlier words when handling each token.',
          },
        ],
      },
      {
        title: 'From raw model to assistant: pretraining, fine-tuning and feedback',
        markdown: `## An assistant is built in stages

A chat assistant does not start as a helpful assistant. It is shaped through several stages.

## Stage 1 — Pretraining

The model reads a very large amount of text and learns to **predict the next token**. This is the expensive part. Afterwards it knows a great deal about language, facts and code, but it behaves like a text-completer: ask a question and it may continue with *more questions* rather than an answer.

## Stage 2 — Instruction tuning

The model is trained further on examples of **instructions paired with good responses**. Now it learns the format of being helpful: answer the question, follow the requested style, stay on task.

## Stage 3 — Learning from preferences

People (and sometimes other models) compare pairs of answers and say which is better. The model is then trained to favour responses people prefer — more helpful, more honest, less harmful. A common name for one approach is **reinforcement learning from human feedback (RLHF)**.

## Stage 4 — Safety and policy

Extra training, rules and filters reduce harmful outputs and set the limits on what the assistant will do.

## Why this matters to you

- **Different models behave differently** even if they share a similar base, because their later stages differ.
- **Fluent is not the same as correct.** Preference training rewards answers people *like*, which can include confident-sounding ones.
- **Behaviour can change** when a provider updates a model, so important prompts deserve re-testing.
- **Benchmark scores are only a guide.** A model that tops a public leaderboard may still do worse on your task.

## Fine-tuning in practice

Fine-tuning means training a model further on your own examples. It is good for consistent *style and format*; it is not a reliable way to add new facts — retrieval is usually better for that.

## Key takeaways

- Pretraining teaches language by next-token prediction; later stages teach helpful behaviour.
- Instruction tuning and preference feedback shape how an assistant responds.
- Models differ because of their later training, and updates can change behaviour.
- Test on your own tasks instead of relying only on public benchmarks.`,
        videos: [ytSearch('how ChatGPT is trained pretraining fine-tuning RLHF explained')],
        quizzes: [
          {
            question: 'A model that has only been pretrained is asked "What is the capital of France?" and replies with more quiz questions. Why?',
            options: [
              'It has a bug',
              'Pretraining only teaches it to continue text; instruction tuning teaches it to answer helpfully',
              'It does not know any geography',
              'Capitals cannot be answered by models',
            ],
            correct: 1,
            explanation: 'A pretrained model completes text patterns. Instruction tuning is what turns it into an assistant that answers.',
          },
        ],
      },
    ],
    finalQuiz: [
      {
        question: 'Why does a very long prompt usually cost more and respond more slowly?',
        options: [
          'Attention compares many pairs of tokens, and more tokens means more work',
          'Models are slower in the evening',
          'Long prompts are encrypted',
          'The model reads long text twice on purpose',
        ],
        correct: 0,
        explanation: 'The amount of computation grows with the number of tokens the model must attend to.',
      },
      {
        question: 'Which statement best describes the purpose of instruction tuning?',
        options: [
          'It teaches the model new facts about your company',
          'It trains the model on instruction–response examples so it follows requests helpfully',
          'It shrinks the model to fit on a phone',
          'It deletes the training data',
        ],
        correct: 1,
        explanation: 'Instruction tuning turns a text-completing model into one that responds to instructions in a useful format.',
      },
    ],
  },

  'ai-tools-landscape': {
    sessions: [
      {
        title: 'Open-weight versus closed models, and running AI locally',
        markdown: `## Two broad kinds of model

- **Closed (proprietary) models** are used through a provider's app or API. You cannot download the model; you send requests and receive replies.
- **Open-weight models** have their trained weights published, so you can download and run them yourself, subject to a licence. (This is often loosely called "open source", but the licence terms vary — read them.)

## Trade-offs

| | Closed, via API | Open-weight, self-hosted |
| --- | --- | --- |
| **Quality at the frontier** | Often the strongest | Strong and improving; usually a step behind the very best |
| **Setup effort** | Minutes | Hardware, hosting, updates, monitoring |
| **Data control** | Data goes to the provider (check terms) | Data can stay on your own machines |
| **Cost shape** | Pay per use | Pay for hardware or hosting, whether used or not |
| **Customisation** | Limited | Full: fine-tune, change behaviour |
| **Risk** | Provider changes pricing or models | You own security, patching and quality |

## Running a model on your own computer

Tools exist that let you download a smaller open-weight model and chat with it locally. Models are shrunk with **quantisation** — storing numbers at lower precision — so they fit in less memory, at some cost in quality. Rough rules:

- Bigger models need more memory (RAM or GPU memory).
- A laptop can run small and medium models; the largest need serious hardware.
- Local does not automatically mean *better* — it means *you* are responsible for it.

## How to choose

1. **Is the data sensitive?** If it must not leave your network, self-hosting or an enterprise agreement becomes attractive.
2. **How much usage?** Steady heavy usage can favour self-hosting; occasional use favours pay-per-use.
3. **Do you have the skills** to run and secure infrastructure?
4. **Test on your own tasks** before deciding — benchmarks do not know your work.

## Key takeaways

- Closed models are easy and strong; open-weight models give control and data locality.
- Licences for "open" models differ, so read them.
- Quantisation shrinks models to fit smaller hardware at some quality cost.
- Choose by data sensitivity, usage pattern, skills and real-task tests.`,
        videos: [ytSearch('open source vs closed source LLM run models locally tutorial')],
        quizzes: [
          {
            question: 'A team must keep sensitive documents inside its own network and has the engineering skills to run servers. Which option is worth considering?',
            options: [
              'Only free consumer chat apps',
              'A self-hosted open-weight model, or an enterprise agreement with strong data terms',
              'Posting documents publicly to get help',
              'No AI of any kind, ever',
            ],
            correct: 1,
            explanation: 'When data must stay in-house, self-hosting or contractual protections are the usual routes. The right choice depends on skills and requirements.',
          },
        ],
      },
      {
        title: 'Choosing AI tools for a team: a practical scorecard',
        markdown: `## Don't pick by hype

New AI tools launch every week. A short, repeatable scorecard keeps your team from choosing on buzz — or from re-opening the debate every month.

## A scorecard you can reuse

Score each candidate (for example 1–5) on:

1. **Quality on your tasks.** Test with 10–20 real examples, not the vendor's demo.
2. **Data handling.** Where is data stored, for how long, is it used for training, and what do the business terms say?
3. **Security and admin controls.** Single sign-on, user management, audit logs, permission controls.
4. **Integration.** Does it connect to the tools you already use (drive, chat, ticketing, warehouse)?
5. **Cost at your scale.** Per-seat versus per-use, plus the time you spend maintaining it.
6. **Reliability and support.** Uptime history, rate limits, response when things break.
7. **Lock-in.** How hard is it to leave? Can you export your prompts, data and history?

## Run a fair trial

- Give each candidate the **same tasks** and the same instructions.
- Score outputs against a **rubric**, ideally with people who didn't pick a favourite.
- Record **time saved** and **errors found**, not just impressions.
- Include at least one **failure case** — how does the tool behave when it does not know?

## Plan for change

Models and prices change quickly. Avoid building everything around one vendor's quirks; keep prompts and test cases in your own files so you can re-test another tool in an afternoon.

## Don't forget the people

The best tool is the one your colleagues will actually use safely. Training, shared prompt libraries and clear rules about what may be pasted matter as much as the tool itself.

## Key takeaways

- Use a scorecard: quality, data handling, security, integration, cost, reliability, lock-in.
- Trial each tool on the same real tasks and score with a rubric.
- Keep prompts and tests portable so switching tools is cheap.
- Adoption depends on training and clear rules, not only on features.`,
        videos: [ytSearch('how to evaluate and choose AI tools for your company scorecard')],
        quizzes: [
          {
            question: 'What is the fairest way to compare two AI tools for your team?',
            options: [
              'Watch each vendor\'s demo and pick the one you liked best',
              'Give both the same real tasks and score the outputs against a shared rubric',
              'Choose whichever has the longest feature list',
              'Pick the cheapest without testing',
            ],
            correct: 1,
            explanation: 'Identical tasks and a common rubric turn opinions into comparable evidence about your own work.',
          },
        ],
      },
    ],
    finalQuiz: [
      {
        question: 'What does quantisation do to a model?',
        options: [
          'It stores the model\'s numbers at lower precision so it needs less memory, at some cost in quality',
          'It translates the model into another language',
          'It adds extra training data',
          'It encrypts the model\'s answers',
        ],
        correct: 0,
        explanation: 'Lower-precision weights shrink memory use, which lets larger models run on smaller hardware, usually with a small quality loss.',
      },
      {
        question: 'Which factor is a genuine downside of self-hosting an open-weight model?',
        options: [
          'Your data can never stay private',
          'You become responsible for hardware, security, updates and quality',
          'You are not allowed to test it',
          'It can only run once per day',
        ],
        correct: 1,
        explanation: 'Self-hosting gives control, but the operational burden moves to your team.',
      },
    ],
  },
};
