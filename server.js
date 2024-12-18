const express = require('express')
const cors = require('cors')
const { rateLimit } = require('express-rate-limit') // Fixed import syntax
const { exec } = require('child_process')
const { writeFile, readFile, unlink, mkdir, rmdir } = require('fs').promises
const { v4: uuidv4 } = require('uuid')
const path = require('path')

const app = express()
const PORT = 8080
const VERSION = '1.0.0'

// Supported format lists (using Pandoc's exact format names)
const SUPPORTED_INPUT_FORMATS = [
  'commonmark', // Standard markdown
  'gfm', // GitHub-flavored markdown
  'html',
  'latex',
  'docx',
  'odt',
  'rst',
  'org',
  'mediawiki', // Changed from 'wiki'
  'textile',
]

const SUPPORTED_OUTPUT_FORMATS = [
  'markdown',
  'html',
  'latex',
  'docx',
  'odt',
  'pdf',
  'epub',
  'plain',
  'rtf',
]

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})

// Apply rate limiting to all routes
app.use(limiter)

// Middleware
app.use(cors())
app.use(
  express.json({
    verify: (req, res, buf, encoding) => {
      try {
        JSON.parse(buf)
      } catch (e) {
        res.status(400).json({
          error: 'Invalid JSON',
          details: 'Please check your JSON syntax',
        })
        throw new Error('Invalid JSON')
      }
    },
  })
)

// Add timestamp to all JSON responses
app.use((req, res, next) => {
  const originalJson = res.json
  res.json = function (obj) {
    obj.timestamp = new Date().toISOString()
    return originalJson.call(this, obj)
  }
  next()
})

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Enhanced formats endpoint
app.get('/formats', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(
    JSON.stringify(
      {
        version: VERSION,
        input: SUPPORTED_INPUT_FORMATS,
        output: SUPPORTED_OUTPUT_FORMATS,
        examples: {
          markdown_to_html: {
            description: 'Convert Markdown to HTML',
            request: {
              content: '# Hello World',
              fromFormat: 'markdown',
              toFormat: 'html',
            },
          },
          html_to_markdown: {
            description: 'Convert HTML to Markdown',
            request: {
              content: '<h1>Hello World</h1>',
              fromFormat: 'html',
              toFormat: 'markdown',
            },
          },
        },
      },
      null,
      2
    )
  )
})

// Pandoc conversion endpoint
app.post('/convert', async (req, res) => {
  const { content, fromFormat, toFormat } = req.body

  // Validate required parameters
  if (!content || !fromFormat || !toFormat) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  // Validate formats
  if (!SUPPORTED_INPUT_FORMATS.includes(fromFormat)) {
    return res.status(400).json({ error: `Unsupported input format: ${fromFormat}` })
  }
  if (!SUPPORTED_OUTPUT_FORMATS.includes(toFormat)) {
    return res.status(400).json({ error: `Unsupported output format: ${toFormat}` })
  }

  const tempDir = path.join(__dirname, 'temp')
  const tempId = uuidv4()
  const inputFile = path.join(tempDir, `${tempId}.${fromFormat}`)
  const outputFile = path.join(tempDir, `${tempId}.${toFormat}`)

  try {
    // Ensure temp directory exists
    await mkdir(tempDir, { recursive: true })

    // Write content to temp file
    await writeFile(inputFile, content)

    // Execute pandoc with better error handling
    await new Promise((resolve, reject) => {
      exec(
        `pandoc "${inputFile}" -f ${fromFormat} -t ${toFormat} -o "${outputFile}"`,
        (error, stdout, stderr) => {
          if (error) {
            console.error('Pandoc execution error:', error)
            console.error('Stderr:', stderr)
            reject(new Error(`Pandoc failed: ${stderr || error.message}`))
          } else resolve(stdout)
        }
      )
    })

    // Read result
    const result = await readFile(outputFile, 'utf8')
    res.json({ result })
  } catch (error) {
    console.error('Conversion error:', error)
    res.status(500).json({
      error: 'Conversion failed',
      details: error.message,
    })
  } finally {
    // Cleanup temp files and empty temp directory if possible
    await Promise.all([unlink(inputFile).catch(() => {}), unlink(outputFile).catch(() => {})])
    await rmdir(tempDir).catch(() => {})
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something broke!' })
})

// Simple server startup
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
