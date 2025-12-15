"use server";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// const secretKey = process.env.SECRET_KEY;
// const key = new TextEncoder().encode(secretKey);

const getSecretKey = () => {
  const secretKey = process.env["SECRET_KEY"];

  if (!secretKey) {
    throw new Error(
      "SECRET_KEY is not defined. Set it in your environment variables."
    );
  }

  return secretKey;
};

const getEncodedKey = () => new TextEncoder().encode(getSecretKey());

export async function encrypt(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10 min from now")
    // .sign(key);
    .sign(getEncodedKey());
}

export async function decrypt(input) {
  // const { payload } = await jwtVerify(input, key, {
  const { payload } = await jwtVerify(input, getEncodedKey(), {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function getSession() {
  const session = cookies().get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function updateSession(request) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 10 * 60 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}
