import { Router } from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSETS_DIR = path.resolve(__dirname, '..', 'assets')

const router = Router()

function serveFile(subdir) {
  return (req, res) => {
    const file = path.basename(req.params.file)
    const safePath = path.resolve(ASSETS_DIR, subdir, file)
    const allowedBase = path.resolve(ASSETS_DIR, subdir)
    if (!safePath.startsWith(allowedBase)) {
      return res.status(403).json({ error: 'Acceso denegado' })
    }
    if (!fs.existsSync(safePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' })
    }
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.setHeader('Content-Type', 'image/svg+xml')
    res.sendFile(safePath)
  }
}

function listDir(subdir) {
  const fullPath = path.resolve(ASSETS_DIR, subdir)
  try {
    if (!fs.existsSync(fullPath)) return []
    return fs.readdirSync(fullPath)
      .filter(f => f.endsWith('.svg'))
      .map(f => ({ name: f, url: `/api/assets/${subdir}/${f}` }))
  } catch {
    return []
  }
}

router.get('/backgrounds/:file', serveFile('backgrounds'))
router.get('/icons/:file', serveFile('icons'))

router.get('/list', (_req, res) => {
  res.json({
    backgrounds: listDir('backgrounds'),
    icons: listDir('icons'),
  })
})

export default router
