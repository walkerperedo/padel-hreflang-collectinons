import * as cheerio from 'cheerio'
import fetch from 'node-fetch'

async function getHreflangs(url) {
  const response = await fetch(url)
  const html = await response.text()
  const $ = cheerio.load(html)

  return $('link[rel="alternate"][hreflang]')
    .map((_, elem) => ({
      hreflang: $(elem).attr('hreflang'),
      href: $(elem).attr('href'),
    }))
    .get()
}

async function hasNoindexNofollow(url) {
  try {
    const response = await fetch(url)

    if (response.status === 429) {
      throw new Error(`RATE_LIMIT_429 for ${url}`);
    }

    if (!response.ok) {
      console.log(`Error: Received status ${response.status} for ${url}`);
      return false;
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const robotsMeta = $('meta[name="robots"]').attr('content') || ''
    const normalized = robotsMeta.toLowerCase().replace(/\s+/g, '')
    return normalized.includes('noindex') || normalized.includes('nofollow')
  } catch(error) {
    console.log(`Error fetching URL ${url}:`, error)
    throw error
  }
}

export const seoUtils = { getHreflangs, hasNoindexNofollow }
