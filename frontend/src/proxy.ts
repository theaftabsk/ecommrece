import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  
  // Clean hostname (remove port if any)
  const hostname = host.split(':')[0];
  const parts = hostname.split('.');

  // 1. Super Admin domain: admin.posix.digital or admin.localhost
  const isSuperAdmin = parts[0] === 'admin';

  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'posix.digital';

  // 2. SaaS Landing page: platformDomain, localhost, 127.0.0.1, or www subdomains
  const isLandingPage = 
    hostname === 'localhost' || 
    hostname === 'www.localhost' ||
    hostname === '127.0.0.1' || 
    hostname === platformDomain ||
    hostname === `www.${platformDomain}`;

  if (isSuperAdmin) {
    url.pathname = `/admin-dashboard${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (isLandingPage) {
    url.pathname = `/landing-page${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // 3. Otherwise, it is a brand subdomain (e.g. brand.posix.digital or brand.localhost)
  // Check if accessing merchant dashboard (path starts with /admin or /dashboard)
  const isMerchant = url.pathname.startsWith('/admin') || url.pathname.startsWith('/dashboard');

  if (isMerchant) {
    url.pathname = `/merchant-dashboard${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // 4. Default: storefront pages for this brand
  url.pathname = `/storefront${url.pathname}`;
  return NextResponse.rewrite(url);
}

// Config to run middleware on all paths except static files, favicon, and Next.js internal paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions (e.g. .svg, .png, .jpg)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};
