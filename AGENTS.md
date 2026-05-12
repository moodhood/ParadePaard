# AGENTS.md

## Main instruction

Every time Codex makes a change in this project, Codex must also update the project rundown file:

C:\Saved Files\Code\ParadePaard\Project Plan\Rundown\ParadePaardRundown.tex

The rundown file must always stay up to date with the actual frontend project.

## What Codex must update

After making any code change, Codex must inspect what changed and update the rundown LaTeX file with a clear description of the frontend changes.

The update should explain what was changed from the user point of view.

Focus on pages, components, forms, buttons, navigation, layout, visible behavior, and user flows.

Do not explain backend logic unless it directly affects the frontend behavior.

## Rundown style

Write in simple and clear language.

Keep the rundown organized by page or feature.

For every page, explain:

1. What the page is for
2. What information is shown
3. What the user can do on the page
4. Any special behavior or important functions

Example structure:

Account Page

The Account Page lets a user view and manage their personal account information. It contains personal details, bank details, and employment details. The page is meant to give the user one place where they can check and update important information related to their profile.

Personal Details

This section shows the user their name, email address, phone number, date of birth, and other basic profile information.

Bank Details

This section shows the user their bank account information, such as IBAN, account holder name, and bank country.

Employment Details

This section shows information about the user their job, contract, start date, pay type, hourly wage, and employment status.

## Change log requirement

Every time Codex updates the project, Codex must also add a short change log entry in the LaTeX rundown file.

The change log must include the current date and a short sentence describing what changed.

Use this format:

\section*{Change Log}

\begin{itemize}
    \item 2026 05 06: Updated the Account Page description after changes to personal details, bank details, and employment details.
\end{itemize}

If the Change Log section already exists, add the newest entry at the top of the list.

If the Change Log section does not exist, create it near the end of the document.

## Date format

Use this date format:

YYYY MM DD

Example:

2026 05 06

## Git requirement

After Codex finishes all requested changes and updates the rundown file, Codex must commit and push the changes to GitHub.

Codex must use an appropriate commit message that summarizes the actual work completed.

Good commit message examples:

Update account page and project rundown

Add employee onboarding UI and update rundown

Refine event scheduling page and update documentation

Fix contract form layout and update rundown

## Git steps Codex should run

Codex should run these commands after finishing the work:

```bash
git status
git add .
git commit -m "Appropriate commit message here"
git push
```
