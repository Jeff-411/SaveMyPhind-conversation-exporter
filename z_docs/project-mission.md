### Mission

Project name: Pandoc Converter Demo (pcd)

Project mission: Integrate **Pandoc** [[^]](https://pandoc.org/) into this forked version of the **Save my Chatbot** (smc) browser extension in order to export files in a wide range of formats.

### Technical notes

Technical Note1: Since Pandoc is a command-line tool that needs to be installed and run on a system, this project will require:

1. A server component to host Pandoc
2. An API to communicate between the browser extension and the server
3. Secure handling of file conversion requests
