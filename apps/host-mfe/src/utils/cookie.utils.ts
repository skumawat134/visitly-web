// authCookies.ts

const DOMAIN = '.visitly.io';
const PATH = '/';

type SameSite = 'Lax' | 'Strict' | 'None';

interface SetCookieOptions {
  days?: number;
  expires?: Date;
  secure?: boolean;
  sameSite?: SameSite;
}

/**
 * Set a cookie
 */
export function setCookie(
  name: string,
  value: string,
  options: SetCookieOptions = {}
): void {
  const {
    days,
    expires,
    secure = true,
    sameSite = 'Lax',
  } = options;

  let cookie = `${name}=${encodeURIComponent(value)}; path=${PATH}; domain=${DOMAIN}`;

  if (expires instanceof Date) {
    cookie += `; expires=${expires.toUTCString()}`;
  }

  if (typeof days === 'number') {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    cookie += `; expires=${date.toUTCString()}`;
  }

  if (secure) cookie += `; Secure`;
  if (sameSite) cookie += `; SameSite=${sameSite}`;
  document.cookie = cookie;
}

/**
 * Get a cookie
 */
export function getCookie(name: string): string | null {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));

  return match ?  decodeURIComponent(match.split('=')[1] || '') : null;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=${PATH}; domain=${DOMAIN}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function deleteAllCookies(path = '/') {
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const name = cookie.split('=')[0]?.trim();

    if (!name) continue; // safety guard

    let cookieStr = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    if (DOMAIN) cookieStr += `; domain=${DOMAIN}`;

    document.cookie = cookieStr;
  }
}


