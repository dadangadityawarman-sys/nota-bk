import { cookies } from "next/headers";

export const AUTH_COOKIE = "bk_auth";

export function isAuthed(): boolean {
  const cookieStore = cookies();
  const val = cookieStore.get(AUTH_COOKIE)?.value;
  return val === process.env.ADMIN_PASSWORD;
}
