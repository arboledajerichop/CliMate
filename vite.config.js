import { Buffer } from 'node:buffer'
import { readFileSync } from 'node:fs'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import weatherWorker from './worker/index.js'

const workerSource = readFileSync(
  new URL('./worker/index.js', import.meta.url),
  'utf8'
)

const staticWorker = {
  name: 'jerichomood-static-worker',
  configureServer(server) {
    const localEnv = loadEnv('development', process.cwd(), '')

    server.middlewares.use(async (request, response, next) => {
      if (!request.url?.startsWith('/api/ask')) {
        next()
        return
      }

      const chunks = []
      for await (const chunk of request) chunks.push(chunk)
      const body = Buffer.concat(chunks)
      const webRequest = new Request(
        new URL(request.url, `http://${request.headers.host || 'localhost'}`),
        {
          method: request.method,
          headers: request.headers,
          body: body.length ? body : undefined,
        }
      )
      const webResponse = await weatherWorker.fetch(webRequest, {
        GROQ_API_KEY: localEnv.GROQ_API_KEY,
        GROQ_MODEL: localEnv.GROQ_MODEL,
      })

      response.statusCode = webResponse.status
      webResponse.headers.forEach((value, key) => response.setHeader(key, value))
      response.end(Buffer.from(await webResponse.arrayBuffer()))
    })
  },
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'server/index.js',
      source: workerSource,
    })
  },
}

export default defineConfig({
  plugins: [react(), staticWorker],
})
