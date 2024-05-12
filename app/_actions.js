"use server";

import { revalidatePath } from "next/cache";
import dbConnection from "./lib/database";
import { journalSchema, ideaSchema, todoSchema } from "./lib/zodSchemas";

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

export const submitNewTodo = async (prevState, formData) => {
  //check session for user

  //validate form data
  const zodResult = todoSchema.safeParse({
    todo: formData.get("todo"),
    notes: formData.get("notes"),
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
