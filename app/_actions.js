"use server";

import { revalidatePath } from "next/cache";
import dbConnection from "./lib/database";
import { journalSchema } from "./lib/zodSchemas";

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
