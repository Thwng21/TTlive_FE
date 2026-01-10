import createMiddleware from 'next-intl/middleware';
import {routing} from './src/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
 
const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check auth for protected routes
  const protectedPaths = ['/stranger', '/profile', '/messages', '/video'];
  const isProtected = protectedPaths.some(path => pathname.includes(path));
  const hasToken = request.cookies.has('accessToken');

  if (isProtected && !hasToken) {
    const locale = request.cookies.get('NEXT_LOCALE')?.value || 'vi';
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // Check auth for auth routes (redirect to app if already logged in)
  const authPaths = ['/login', '/register'];
  const isAuthPage = authPaths.some(path => pathname.includes(path));
  
  if (isAuthPage && hasToken) {
     const locale = request.cookies.get('NEXT_LOCALE')?.value || 'vi';
     return NextResponse.redirect(new URL(`/${locale}/stranger`, request.url));
  }

  return intlMiddleware(request);
}
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(vi|en|zh)/:path*']
};
