import { updateSession, decrypt } from "@/app/lib/cookieFunctions";
import { NextResponse } from "next/server";

export async function middleware(request) {
  console.log("middleware ran successfully");

  const currentUser = request.cookies.get("session")?.value;

  //   let currentUserObj = null;
  //   if (currentUser) {
  //     currentUserObj = await decrypt(currentUser);
  //   }

  //   const memberType = currentUserObj?.resultObj?.memberType;

  if (
    !currentUser &&
    !["/", "/sign-in"].some((path) =>
      typeof path === "string"
        ? path === request.nextUrl.pathname
        : path.test(request.nextUrl.pathname)
    )
  ) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};

//good to know: middleware can get ip address from request.headers.get('x-real-ip')
