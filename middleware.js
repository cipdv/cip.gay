import { updateSession, decrypt } from "@/app/lib/cookieFunctions";
import { NextResponse } from "next/server";

export async function middleware(request) {
  console.log("middleware ran successfully");

  const currentUser = request.cookies.get("session")?.value;

  if (!currentUser && !["/", "/sign-in"].includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  } else if (
    currentUser &&
    !request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};

//good to know: middleware can get ip address from request.headers.get('x-real-ip')
