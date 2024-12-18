# Task1 - Overview

Proposed Pandoc Code Flow (ppcf):

1. HTML (scraped) →
2. DOMPurify (sanitize) →
3. Pandoc Server (to target format) →
4. Download as .{format}

## Scope

Task 1 will begin when the user prompt begins with, "START_TASK1". Task1 will end when the user prompt begins with, "END_TASK1".

## Description

In this task we will examine the folders, files and functions in the `src/services/export/` directory in a step-by-step fashion in order to develop a strategy for implementing the ppcf.

Note: This is a planning task and should not involve any changes to the existing smc files.

## Steps

The `src/services/export/` directory contains 3 folders: `extractor`, `output/` and `scraper/`. It seems likely that the `scraper/` folder will hold code related to the first, `HTML (scraped)`, step in our ppcf, so lets start there.
