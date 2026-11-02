import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { dirname, extname, resolve, relative, isAbsolute, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

// 只提供本作业的 dist，不依赖 npm 安装，也不连接外部服务。
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const portIndex = process.argv.indexOf('--port')
let port = portIndex >= 0 ? Number(process.argv[portIndex + 1]) : 5185
if (!Number.isInteger(port) || port < 1024 || port > 65525) {
  console.error('端口必须是 1024–65525 之间的整数。')
  process.exit(1)
}
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json', '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
}
try { await stat(resolve(root, 'index.html')) } catch {
  console.error('找不到 dist/index.html。源码目录请先执行 npm ci 和 npm run build。')
  process.exit(1)
}
const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end()
    return
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    if (pathname.includes('\0')) throw new Error('Invalid path')
    const path = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname))
    const rel = relative(root, path)
    if (isAbsolute(rel) || rel === '..' || rel.startsWith('..' + sep)) {
      response.writeHead(403).end('Forbidden')
      return
    }
    const info = await stat(path)
    if (!info.isFile()) { response.writeHead(404).end('Not found'); return }
    response.writeHead(200, {
      'Content-Type': types[extname(path).toLowerCase()] ?? 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    })
    if (request.method === 'HEAD') { response.end(); return }
    createReadStream(path).on('error', () => response.destroy()).pipe(response)
  } catch (error) {
    response.writeHead(error?.code === 'ENOENT' ? 404 : 400).end('Not found')
  }
})
let attempts = 0
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE' && attempts++ < 10) { server.listen(++port, '127.0.0.1'); return }
  console.error('无法启动网站：', error.message)
  process.exitCode = 1
})
server.on('listening', () => {
  const url = `http://127.0.0.1:${port}/`
  console.log(`设计的秘密：${url}\n保持本窗口打开；按 Ctrl+C 关闭。`)
  if (process.argv.includes('--open') && process.platform === 'win32') {
    spawn('cmd.exe', ['/c', 'start', '', url], { windowsHide: true, stdio: 'ignore' })
      .on('error', () => console.log('请在浏览器打开上面的网址。'))
  }
})
server.listen(port, '127.0.0.1')
