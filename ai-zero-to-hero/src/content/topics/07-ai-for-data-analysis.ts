import { TopicContent, ytSearch } from '../types';

export const topic7: TopicContent = {
  slug: 'ai-for-data-analysis',
  title: 'AI for Data Analysis',
  description: 'Text-to-SQL, pandas help, faster exploration — and how to check every number.',
  sessions: [
    {
      title: 'Where AI fits in an analyst’s workflow',
      markdown: `## AI is a fast junior colleague, not the analyst

An analytics project has stages: **understand the question**, **find and clean the data**, **query and model it**, **communicate the result**. AI can speed up almost every stage — but you are still the person who is accountable for the answer.

Think of it as a very fast, very well-read junior colleague. It drafts quickly and knows a lot of syntax. It also makes confident mistakes and has never seen *your* business.

## Where it helps most

- **Writing first drafts** of SQL, pandas code, regular expressions and spreadsheet formulas.
- **Explaining** code or a query someone else wrote.
- **Translating** between tools: "turn this SQL into pandas", "turn this Excel formula into SQL".
- **Brainstorming** hypotheses, segments and metrics to check.
- **Drafting the narrative**: summaries, slide text, an email to stakeholders.

## Where it is weakest

- **Knowing your data.** It does not know that \`status = 7\` means "refunded" in your warehouse unless you tell it.
- **Arithmetic and exact counting** done "in its head". Make it write code and run the code instead.
- **Judging whether a result is plausible** for your company.

## What to share — and what not to

You almost never need to paste real customer rows. Share the **schema** (table and column names, types, a one-line meaning for each) and, if needed, **a few invented sample rows**. Check your company's AI policy before pasting anything real.

> **Analyst tip:** the question "would I be comfortable emailing this to an outside contractor?" is a good first test for what you may paste into a chat tool.

## Key takeaways

- AI speeds up drafting, explaining and translating — you stay accountable for the answer.
- It does not know your data: give it the schema and the meaning of your columns.
- Have it write code for exact numbers instead of calculating in its head.
- Share schemas and made-up samples, not real personal data.`,
      videos: [ytSearch('how data analysts use ChatGPT and AI in their workflow')],
      quizzes: [
        {
          question: 'What should you usually share with an AI tool to get good SQL for your database?',
          options: [
            'The schema: table names, columns, types and what they mean',
            'A full export of the customer table',
            'Only the business question, with no table details',
            'Your database password so it can check',
          ],
          correct: 0,
          explanation: 'The schema gives the model what it needs without exposing real customer data. Never share passwords.',
        },
      ],
    },
    {
      title: 'Text-to-SQL you can trust',
      markdown: `## A good SQL prompt has four ingredients

1. **The schema** — tables, columns, types, and primary/foreign keys.
2. **The dialect** — PostgreSQL, BigQuery, Snowflake, SQL Server… they differ in date functions, quoting and more.
3. **The question in business terms**, plus any definitions ("an *active* customer ordered in the last 90 days").
4. **The output you want** — which columns, in what order, how many rows.

**Example prompt**

> Dialect: PostgreSQL. Tables: \`customers(id, name, signup_date)\`, \`orders(id, customer_id, order_date, amount)\` — \`orders.customer_id\` references \`customers.id\`. Question: for customers who signed up in 2024, show total spend per customer in their first 30 days, highest first. Return \`customer_id\`, \`total_spend\`. Explain your join and filters in two sentences.

Asking for the explanation is a cheap way to spot a wrong assumption.

## The classic mistakes to look for

- **Fan-out joins.** Joining a table with several matching rows can multiply rows, so a \`SUM\` comes out too large. Check the grain of each table.
- **Wrong date logic** — off-by-one days, time zones, inclusive vs exclusive end dates.
- **Silent NULL handling.** \`WHERE col <> 'x'\` drops rows where \`col\` is NULL.
- **Invented columns** that look plausible but do not exist.
- **Double-counting** when you count rows instead of distinct customers.

## A safe routine

1. Run the query on a small slice first (add \`LIMIT\` or a narrow date range).
2. Compare one or two results to a number you can calculate by hand or already trust.
3. Ask: "What assumptions did you make? What could make this wrong?"
4. Only then run it on the full table.

## Key takeaways

- Give schema, dialect, definitions and the desired output.
- Ask the model to explain its joins and filters.
- Watch for fan-out joins, NULL traps, date errors and invented columns.
- Test on a small slice and reconcile against a known number before trusting the result.`,
      videos: [ytSearch('text to SQL with ChatGPT tutorial for data analysts')],
      quizzes: [
        {
          question: 'Total revenue from your AI-written query is double what finance reports after you join orders to order_items. What is the most likely cause?',
          options: [
            'A fan-out join: each order is repeated once per item, so its amount is summed several times',
            'The database is broken',
            'The model used the wrong programming language',
            'Revenue always doubles after a join',
          ],
          correct: 0,
          explanation: 'Joining a one-row-per-order table to a many-rows-per-order table repeats the order amount. Check the grain before summing.',
        },
        {
          question: 'Why ask the model to explain its SQL after it writes it?',
          options: [
            'It makes the query run faster',
            'It exposes hidden assumptions you can check, such as how it joined tables or treated dates',
            'It is required for the query to run',
            'It stops the model from making any mistakes',
          ],
          correct: 1,
          explanation: 'An explanation shows the reasoning in plain words, which is far quicker to review than reading unfamiliar SQL line by line.',
        },
      ],
    },
    {
      title: 'Python and pandas with an AI pair-programmer',
      markdown: `## Describe the data, not just the goal

With code, the model needs to know what your DataFrame looks like. Instead of pasting the data, paste its **shape**:

\`\`\`
df.shape        # (48210, 7)
df.dtypes       # column names and types
df.head(3)      # three rows (invented or anonymised)
\`\`\`

Then state the goal: "Using this DataFrame, compute monthly active users and plot them as a line chart. Use pandas and matplotlib."

## Work in small steps

Ask for one step at a time — load, clean, transform, plot — and run each before asking for the next. If something breaks, paste the **full error message** back and say what you expected. Models are good at debugging when they can see the actual error.

## Read before you run

Code from a model can be wrong, slow, or do more than you asked. Before running it:

- **Read it.** Ask the model to add a comment to each step if you do not follow.
- **Check anything destructive** — overwriting files, dropping rows, deleting columns.
- **Run it on a copy** or a sample the first time.
- **Prefer well-known libraries.** If it imports a package you have never heard of, check that it is real and maintained before installing it.

## Make it reproducible

Ask for code you can rerun next month: set random seeds, avoid hard-coded file paths, and put the steps in a script or notebook rather than in a chat history. A result nobody can reproduce is hard to defend.

## Key takeaways

- Share the DataFrame's shape, dtypes and a few safe rows — not the real data.
- Build in small steps, running each one; paste back full error messages.
- Read the code and test on a copy before running anything that changes data.
- Keep the final steps in a script or notebook so the analysis is reproducible.`,
      videos: [ytSearch('pandas data analysis with ChatGPT code interpreter tutorial')],
      quizzes: [
        {
          question: 'Your pandas code fails with an error. What is the most effective thing to paste back to the model?',
          options: [
            'The word "broken"',
            'The full error message and what you expected to happen',
            'Nothing — ask it to guess',
            'Your whole dataset',
          ],
          correct: 1,
          explanation: 'The exact error plus your intent lets the model pinpoint the problem instead of guessing.',
        },
      ],
    },
    {
      title: 'Exploring data and building charts faster',
      markdown: `## Use AI to widen your first look

Early exploration is about asking *lots* of questions quickly. AI is useful for:

- **Suggesting checks** — "What would you check in a table of customer orders before trusting it?" (duplicates, missing values, impossible dates, outliers).
- **Proposing hypotheses** — "Give me eight possible reasons weekly sign-ups fell, and the data I'd need to test each."
- **Choosing a chart** — "I want to compare revenue across 12 regions and show the trend over time. Which chart types suit that, and what are the trade-offs?"
- **Drafting chart code** in your library of choice (matplotlib, Plotly, ggplot).

## Numbers come from code, not from the chat

If you paste a table and ask "what is the average?", the model may estimate and sound sure. Instead:

- Ask it to **write code** that computes the average, then run it yourself; or
- Use a tool with a **code-execution feature**, where the model runs real code and shows the result.

The rule: **every figure in your report should come from something you ran**, not from a sentence the model wrote.

## Charts that do not mislead

AI will happily make a chart that looks polished and misleads. Check:

- Does the **y-axis** start where it should (bar charts should start at zero)?
- Are **labels, units and the time period** clear?
- Is the chart showing a **correlation** that the title presents as a cause?
- Would a plain table be clearer?

## Key takeaways

- Use AI to generate checks, hypotheses and chart options — it widens your first look.
- Get numbers by running code, never from the model's prose.
- Review charts for truncated axes, missing units and causal claims.
- Keep what you learn in a notebook so the exploration can be repeated.`,
      videos: [ytSearch('exploratory data analysis with AI tools charts tutorial')],
      quizzes: [
        {
          question: 'You paste a table into a chat and ask for the average order value. What is the safest way to get a number you can report?',
          options: [
            'Trust the number in the reply',
            'Ask for the average again until the answers match',
            'Have the model write code that calculates it, and run that code yourself',
            'Ask for a rounded estimate',
          ],
          correct: 2,
          explanation: 'Models can estimate arithmetic and still sound certain. Running real code gives a number you can check and reproduce.',
        },
      ],
    },
    {
      title: 'Checking AI-made analysis before you share it',
      markdown: `## Assume it is wrong until it reconciles

Analysis that came out of an AI workflow needs the same scrutiny as analysis from a new hire — more, because it is fast and fluent, which makes errors easy to believe.

## A verification checklist

1. **Reconcile totals.** Does the total match a figure you already trust — finance, a dashboard, last quarter's report?
2. **Check row counts at every step.** How many rows went into each join and filter, and how many came out? Unexpected jumps point to fan-out or accidental filtering.
3. **Test edge cases.** Customers with no orders, NULLs, the first and last day of the period, a month with 28 days.
4. **Recompute independently.** Calculate one number a different way (a pivot table, a hand calculation) and compare.
5. **Read the filters.** Is the date range right? Are test accounts, refunds or cancelled orders handled the way the business expects?
6. **Ask for the weak spots.** "List the three assumptions in this analysis most likely to be wrong."

## Be honest about what the AI did

When you share results, say what the tool was used for and what you verified, for example: "Query drafted with an AI assistant; I reviewed the logic and reconciled totals to the finance report." That builds trust, and it makes it easier for someone to spot a problem later.

## Keep the receipts

Save the final query or script, the data extract date, and the checks you ran. If someone asks in three months why a number changed, you can answer.

> **Analyst tip:** a result that looks too good, too round or too surprising deserves extra checks. Surprising is often wrong.

## Key takeaways

- Reconcile totals to a trusted source and track row counts through each step.
- Test edge cases and recompute one figure a second way.
- Ask the model to list its riskiest assumptions, then check them.
- Say how AI was used and keep the query, date and checks on file.`,
      videos: [ytSearch('how to validate data analysis results sanity checks analyst')],
      quizzes: [
        {
          question: 'Which check is most likely to catch an accidental duplicate-row problem after a join?',
          options: [
            'Making the chart colours prettier',
            'Comparing row counts before and after the join and reconciling the total to a trusted figure',
            'Asking the model if it is sure',
            'Running the query a second time',
          ],
          correct: 1,
          explanation: 'Row-count jumps and mismatched totals reveal duplicated rows. Re-running the same query repeats the same mistake.',
        },
      ],
    },
  ],
  finalQuiz: [
    {
      question: 'Which of these is the best use of AI at the start of an analysis?',
      options: [
        'Letting it decide the business question for you',
        'Drafting queries and brainstorming checks and hypotheses that you then review',
        'Publishing its first answer directly to stakeholders',
        'Replacing the need to understand your data',
      ],
      correct: 1,
      explanation: 'AI speeds up drafting and idea generation, but you still own understanding the data and reviewing the result.',
    },
    {
      question: 'A model writes SQL that references a column called customer_segment that does not exist in your warehouse. What happened?',
      options: [
        'The model checked your warehouse and found it',
        'The model invented a plausible-sounding column because it did not have your real schema',
        'Your database is out of date',
        'This can only happen with very old models',
      ],
      correct: 1,
      explanation: 'Without the real schema, models guess names that look reasonable. Supplying tables and columns prevents most of this.',
    },
    {
      question: 'Why should you specify the SQL dialect in a text-to-SQL prompt?',
      options: [
        'Dialects differ in date functions, quoting and syntax, so the query may not run otherwise',
        'It makes the model respond faster',
        'It is only needed for very long queries',
        'It hides your schema from the model',
      ],
      correct: 0,
      explanation: 'PostgreSQL, BigQuery, Snowflake and others differ in many functions. Naming the dialect avoids errors and subtle differences.',
    },
    {
      question: 'What is a "fan-out" join?',
      options: [
        'A join that runs on several servers at once',
        'A join that matches each row to several rows in the other table, multiplying the rows and inflating sums',
        'A join that removes duplicate rows',
        'A join between three or more tables',
      ],
      correct: 1,
      explanation: 'When one row matches many, it is repeated for each match, so aggregates such as SUM can be too high.',
    },
    {
      question: 'What does "WHERE status <> \'cancelled\'" do with rows where status is NULL?',
      options: [
        'It keeps them, because NULL is not "cancelled"',
        'It drops them, because comparing NULL to a value is neither true nor false',
        'It turns them into "cancelled"',
        'It causes an error',
      ],
      correct: 1,
      explanation: 'Comparisons with NULL are unknown, and WHERE keeps only rows that are true. Handle NULL explicitly if you want those rows.',
    },
    {
      question: 'You want to use AI to help with a pandas task without exposing customer data. What is the best approach?',
      options: [
        'Paste the full dataset so the model can see everything',
        'Share column names, dtypes and a few invented or anonymised rows',
        'Share nothing at all, including the goal',
        'Email the data file to the model provider',
      ],
      correct: 1,
      explanation: 'The shape of the data is usually enough for working code. Real personal data should stay out unless policy allows it.',
    },
    {
      question: 'AI-written code is about to overwrite your source file with a cleaned version. What should you do first?',
      options: [
        'Run it straight away to save time',
        'Read it and run it on a copy or a sample first',
        'Delete the original file so there is no confusion',
        'Ask the model to guarantee it is correct',
      ],
      correct: 1,
      explanation: 'Destructive steps deserve a review and a test on a copy. A model cannot guarantee its code is right.',
    },
    {
      question: 'Why is it risky to ask a chat model to "calculate" a statistic from a pasted table without running code?',
      options: [
        'Chat models cannot read tables at all',
        'It may estimate or slip on the arithmetic while sounding confident',
        'Statistics are illegal to calculate with AI',
        'The result will always be too low',
      ],
      correct: 1,
      explanation: 'Language models predict text and can be wrong in exact arithmetic. Code gives a number you can verify and rerun.',
    },
    {
      question: 'A bar chart with the y-axis starting at 95 instead of 0 makes a 2% difference look huge. What is the problem?',
      options: [
        'The chart type is wrong for all data',
        'A truncated axis exaggerates differences and can mislead readers',
        'Bar charts cannot show percentages',
        'Nothing — it is standard practice',
      ],
      correct: 1,
      explanation: 'Bars encode value by length, so cutting the axis distorts the comparison. Start bar charts at zero or choose another chart.',
    },
    {
      question: 'After an AI-assisted analysis, which statement is the best way to share it with colleagues?',
      options: [
        'Say nothing about how it was made',
        'Say AI helped draft the query, and state which checks you ran and what they showed',
        'Claim the AI verified everything',
        'Delete the query so nobody can question it',
      ],
      correct: 1,
      explanation: 'Being open about the tool and your checks builds trust and helps others find mistakes later.',
    },
  ],
};
