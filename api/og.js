import { getShareMeta } from '../src/data/shareMeta.js'

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function requestBase(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost'
  const proto = req.headers['x-forwarded-proto'] || 'https'
  return `${proto}://${host}`
}

function requestPath(req) {
  const raw = req.query?.path
  if (Array.isArray(raw)) return raw[0] || '/'
  if (typeof raw === 'string' && raw.length) return raw.startsWith('/') ? raw : `/${raw}`
  try {
    const url = new URL(req.url, 'http://localhost')
    return url.searchParams.get('path') || '/'
  } catch {
    return '/'
  }
}

function renderOgHtml(meta) {
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  const image = escapeHtml(meta.image)
  const imageAlt = escapeHtml(meta.imageAlt || meta.title)
  const url = escapeHtml(meta.url)
  const siteName = escapeHtml(meta.siteName)
  const type = escapeHtml(meta.type || 'website')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:site_name" content="${siteName}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:alt" content="${imageAlt}" />
    <meta property="og:url" content="${url}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${imageAlt}" />
    <meta http-equiv="refresh" content="0;url=${url}" />
  </head>
  <body>
    <p><a href="${url}">${title}</a></p>
    <p>${description}</p>
  </body>
</html>`
}

export default function handler(req, res) {
  const base = requestBase(req)
  const path = requestPath(req)
  const meta = getShareMeta(path, base)

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400')
  res.statusCode = 200
  res.end(renderOgHtml(meta))
}
