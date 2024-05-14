"use server";

import { revalidatePath } from "next/cache";
import dbConnection from "./lib/database";
import {
  journalSchema,
  ideaSchema,
  todoSchema,
  loginSchema,
} from "./lib/zodSchemas";
import { ObjectId } from "mongodb";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

////////////////////////////////////////////////////////////////
////////////////////AUTH////////////////////////////////////////
////////////////////////////////////////////////////////////////

const secretKey = process.env.SECRET_KEY;
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("6 days")
    .sign(key);
}

export async function decrypt(input) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export const getCurrentUser = async () => {
  const session = await getSession();
  if (session) {
    const _id = new ObjectId(session.resultObj._id);
    const dbClient = await dbConnection;
    const db = await dbClient.db(process.env.DB_NAME);
    const currentUser = await db.collection("members").findOne({ _id });
    delete currentUser?.password;
    return currentUser;
  }
  return null;
};

export async function registerNewMember(prevState, formData) {
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const dbClient = await dbConnection;
    const db = await dbClient.db(process.env.DB_NAME);

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create new user
    const newMember = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    await db.collection("members").insertOne(newMember);

    //remove password from the object
    let resultObj = { ...newMember };
    delete resultObj.password;

    // Create the session
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    const session = await encrypt({ resultObj, expires });

    // Save the session in a cookie
    cookies().set("session", session, { expires, httpOnly: true });
  } catch (error) {
    console.log(error);
    return {
      message:
        "Failed to register: make sure all required fields are completed and try again",
    };
  }
  revalidatePath("/");
  redirect("/");
}

export async function login(prevState, formData) {
  // Convert the form data to an object
  const formDataObj = Object.fromEntries(formData.entries());
  formDataObj.rememberMe = formDataObj.rememberMe === "on";

  // Normalize the email address
  formDataObj.email = formDataObj.email.toLowerCase().trim();

  // Validate the form data
  const { success, data, error } = loginSchema.safeParse(formDataObj);

  if (!success) {
    return { message: error.message };
  }

  const user = data;

  const dbClient = await dbConnection;
  const db = await dbClient.db(process.env.DB_NAME);
  const result = await db.collection("members").findOne({ email: user.email });

  if (!result) {
    return { message: "Invalid credentials" };
  }
  const passwordsMatch = await bcrypt.compare(user.password, result.password);
  if (!passwordsMatch) {
    return { message: "Invalid credentials" };
  }

  //remove password from the object
  let resultObj = { ...result };
  delete resultObj.password;

  // Create a session token
  const expires = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ resultObj, expires });

  // Save the session in a cookie
  //   cookies().set("session", session, { expires, httpOnly: true });
  cookies().set("session", session, { expires, httpOnly: true, secure: true });

  revalidatePath("/");
  redirect("/");
}

export async function logout() {
  // Destroy the session
  cookies().set("session", "", { expires: new Date(0) });
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
    secure: true,
  });
  return res;
}

export const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return secret;
};

export const verifyAuth = async (token) => {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtSecretKey())
    );
    return verified.payload;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

////////////////////////////////////////////////////////////////
////////////////////JOURNAL/////////////////////////////////////
////////////////////////////////////////////////////////////////

export async function submitJournalEntry(prevState, formData) {
  //check session for user

  const entry = formData.get("entry");
  const notes = formData.get("notes");

  //validate form data
  const zodResult = journalSchema.safeParse({
    entry: entry,
    notes: notes,
    images: [],
  });

  const entryError = zodResult?.error?.errors?.find(
    (error) => error?.path[0] === "entry"
  );
  if (entryError) {
    return { message: entryError.message };
  }

  //save to database
  try {
    const dbClient = await dbConnection;
    const db = await dbClient.db(process.env.DB_NAME);

    await db.collection("journal").insertOne({
      entry: zodResult.data.entry,
      notes: zodResult.data.notes,
      images: zodResult.data.images,
      createdAt: new Date(),
    });
  } catch (e) {
    return { message: "Error submitting journal entry" };
  }

  revalidatePath("/journal");
  return { message: "Journal entry submitted" };
}

export const getAllJournalEntries = async () => {
  const dbClient = await dbConnection;
  const db = await dbClient.db(process.env.DB_NAME);

  const entries = await db.collection("journal").find().toArray();
  return entries;
};

////////////////////////////////////////////////////////////////
////////////////////IDEAS///////////////////////////////////////
////////////////////////////////////////////////////////////////

export async function submitNewIdea(prevState, formData) {
  //check session for user

  const idea = formData.get("idea");
  const notes = formData.get("notes");

  //validate form data
  const zodResult = ideaSchema.safeParse({
    idea: idea,
    notes: notes,
    images: [],
  });

  const ideaError = zodResult?.error?.errors?.find(
    (error) => error?.path[0] === "idea"
  );
  if (ideaError) {
    return { message: ideaError.message };
  }

  //save to database
  try {
    const dbClient = await dbConnection;
    const db = await dbClient.db(process.env.DB_NAME);

    await db.collection("ideas").insertOne({
      idea: zodResult.data.idea,
      notes: zodResult.data.notes,
      images: zodResult.data.images,
      createdAt: new Date(),
    });
  } catch (e) {
    return { message: "Error submitting idea" };
  }

  revalidatePath("/ideas");
  return { message: "Idea submitted" };
}

export const getAllIdeas = async () => {
  const dbClient = await dbConnection;
  const db = await dbClient.db(process.env.DB_NAME);

  const ideas = await db.collection("ideas").find().toArray();
  return ideas;
};

//////////////////////////////////////////////////////////////
//////////////TODO////////////////////////////////////////////
//////////////////////////////////////////////////////////////

export const submitNewTodo = async (prevState, formData) => {
  //check session for user

  //validate form data
  const zodResult = todoSchema.safeParse({
    todo: formData.get("todo"),
    notes: formData.get("notes"),
    deadline: formData.get("deadline"),
    images: [],
  });

  const todoError = zodResult?.error?.errors?.find(
    (error) => error?.path[0] === "todo"
  );
  if (todoError) {
    return { message: todoError.message };
  }

  //save to database
  try {
    const dbClient = await dbConnection;
    const db = await dbClient.db(process.env.DB_NAME);

    await db.collection("todos").insertOne({
      todo: zodResult.data.todo,
      notes: zodResult.data.notes,
      images: zodResult.data.images,
      deadline: zodResult.data.deadline,
      createdAt: new Date(),
    });
  } catch (e) {
    return { message: "Error submitting to-do" };
  }

  revalidatePath("/todos");
  return { message: "To-do submitted" };
};

export const getAllTodos = async () => {
  const dbClient = await dbConnection;
  const db = await dbClient.db(process.env.DB_NAME);

  const todos = await db.collection("todos").find().toArray();
  return todos;
};

export const deleteTodo = async (id) => {
  const dbClient = await dbConnection;
  const db = await dbClient.db(process.env.DB_NAME);

  await db.collection("todos").deleteOne({ _id: new ObjectId(id) });
  revalidatePath("/todos");
  return { message: "To-do deleted" };
};
