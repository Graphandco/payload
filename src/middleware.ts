import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PAYLOAD_BYPASS_PREFIXES = ['/admin', '/api'] as const

function normalizeHostname(host: string): string {
  const withoutPort = host.split(':')[0]
  return withoutPort.replace(/^www\./, '').toLowerCase()
}

function getTenantKey(hostname: string): string {
  const domain = normalizeHostname(hostname)

  if (domain.endsWith('.localhost')) {
    return domain.slice(0, -'.localhost'.length)
  }

  return domain.replace(/\./g, '-')
}

function shouldBypass(pathname: string): boolean {
  if (pathname.startsWith('/_next')) return true
  if (PAYLOAD_BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true
  if (/\.[a-z0-9]+$/i.test(pathname)) return true
  return false
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const hostname = req.headers.get('host') ?? ''
  const currentDomain = normalizeHostname(hostname)

  if (shouldBypass(url.pathname)) {
    return NextResponse.next()
  }

  if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
    return NextResponse.next()
  }

  const tenantKey = getTenantKey(hostname)
  url.pathname = `/${tenantKey}${url.pathname === '/' ? '' : url.pathname}`

  const response = NextResponse.rewrite(url)
  response.headers.set('x-tenant-domain', currentDomain)
  response.headers.set('x-tenant-key', tenantKey)

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|admin|api).*)'],
}
