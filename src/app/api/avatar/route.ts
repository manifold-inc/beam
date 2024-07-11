import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
const COLOR_NAMES = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
] as const

const COLOR_SHADES = [500, 600, 700, 800] as const

const COLORS: Record<
  typeof COLOR_NAMES[number],
  Record<typeof COLOR_SHADES[number], string>
> = {
  red: {
    500: '#ff455d',
    600: '#dd243c',
    700: '#c11027',
    800: '#8f0718',
  },
  orange: {
    500: '#f35815',
    600: '#c43c02',
    700: '#962d00',
    800: '#672002',
  },
  yellow: {
    500: '#a78103',
    600: '#835c01',
    700: '#5c4716',
    800: '#41320c',
  },
  green: {
    500: '#27b648',
    600: '#13862e',
    700: '#19652a',
    800: '#10481d',
  },
  blue: {
    500: '#1e9de7',
    600: '#0e73cc',
    700: '#144eb6',
    800: '#0e3682',
  },
  purple: {
    500: '#8467f3',
    600: '#624bbb',
    700: '#4b3990',
    800: '#3e1f75',
  },
}

function generateSVG(name: string) {
  const shasum = crypto.createHash('sha1')
  shasum.update(name)
  const hash = shasum.digest('hex')

  const colors = [...Array<unknown>(3)].map((_, idx) => {
    const colorHash = hash.slice(idx * 2, idx * 2 + 2)

    const nameDecimal = parseInt(colorHash[0], 16)
    const colorName = COLOR_NAMES[nameDecimal % COLOR_NAMES.length]

    const shadeDecimal = parseInt(colorHash[1], 16)
    const colorShade = COLOR_SHADES[shadeDecimal % COLOR_SHADES.length]

    return COLORS[colorName][colorShade]
  })

  const svg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="12" fill="url(#gradient)" transform="rotate(-90, 12, 12)" />
  <defs>
    <radialGradient id="gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20.5 2) rotate(127.694) scale(27.8029 21.5408)">
      <stop stop-color="${colors[0]}"/>
      <stop offset="0.751919" stop-color="${colors[1]}"/>
      <stop offset="0.976459" stop-color="${colors[2]}"/>
    </radialGradient>
  </defs>
</svg>
  `.trim()

  return svg
}

export function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')

  if (name == null || typeof name !== 'string') {
    return NextResponse.json({ error: '' }, { status: 400 })
  }

  try {
    const svg = generateSVG(name)
    const res = new NextResponse(svg, { status: 200 })
    res.headers.set('Content-Type', 'image/svg+xml')
    res.headers.set(
      'Cache-Control',
      `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`
    )
    return res
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as { message: string }).message },
      { status: 500 }
    )
  }
}
