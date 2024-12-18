### Mission

Project name: Pandoc Converter Demo (pcd)

Project mission: Integrate **Pandoc** [[^]](https://pandoc.org/) into this forked version of the **Save my Chatbot** (smc) browser extension in order to export files in a wide range of formats.

### Code flow

It is expected that integrating Pandoc will alter the basic flow of the code as indicated below.

Current Code Flow:

1. HTML (scraped) →
2. DOMPurify (sanitize) →
3. TurndownService (to MD) →
4. Download as .md

Proposed Pandoc Code Flow (ppcf):

1. HTML (scraped) →
2. DOMPurify (sanitize) →
3. Pandoc Server (to target format) →
4. Download as .{format}

### Technical notes

Technical Note1: Since Pandoc is a command-line tool that needs to be installed and run on a system, this project will require:

1. A server component to host Pandoc
2. An API to communicate between the browser extension and the server
3. Secure handling of file conversion requests
