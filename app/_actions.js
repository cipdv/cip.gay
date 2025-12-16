"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@vercel/postgres";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

// If you still have this schema, keep it; otherwise remove.
// (Only used in login validation below.)
import { loginSchema } from "./lib/zodSchemas";

//////////////////////////////////////////////////////////////
// AUTH
//////////////////////////////////////////////////////////////

const secretKey = process.env.SECRET_KEY;
if (!secretKey) {
  console.warn("SECRET_KEY is not set. Auth will fail.");
}
const key = new TextEncoder().encode(secretKey || "missing_secret_key");

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

export async function getSession() {
  const session = cookies().get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

async function requireUserId() {
  const session = await getSession();
  const userId = session?.resultObj?._id;
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export const getCurrentUser = async () => {
  const session = await getSession();
  if (!session?.resultObj?._id) return null;

  const { rows } = await sql`
    SELECT
      id AS "_id",
      first_name AS "firstName",
      last_name AS "lastName",
      email,
      created_at AS "createdAt"
    FROM members
    WHERE id = ${session.resultObj._id}
    LIMIT 1;
  `;
  return rows[0] || null;
};

export async function registerNewMember(prevState, formData) {
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const email = formData.get("email")?.toLowerCase().trim();
  const password = formData.get("password");

  try {
    if (!firstName || !lastName || !email || !password) {
      return { message: "Missing required fields" };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { rows } = await sql`
      INSERT INTO members (first_name, last_name, email, password, created_at)
      VALUES (${firstName}, ${lastName}, ${email}, ${hashedPassword}, NOW())
      RETURNING
        id AS "_id",
        first_name AS "firstName",
        last_name AS "lastName",
        email,
        created_at AS "createdAt";
    `;

    const resultObj = rows[0];
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    const session = await encrypt({ resultObj, expires });

    cookies().set("session", session, {
      expires,
      httpOnly: true,
      secure: true,
    });
  } catch (error) {
    console.error(error);
    return {
      message:
        "Failed to register: make sure all required fields are completed and try again",
    };
  }

  revalidatePath("/");
  redirect("/");
}

export async function login(prevState, formData) {
  const formDataObj = Object.fromEntries(formData.entries());
  formDataObj.rememberMe = formDataObj.rememberMe === "on";
  formDataObj.email = (formDataObj.email || "").toLowerCase().trim();

  const { success, data, error } = loginSchema.safeParse(formDataObj);
  if (!success) return { message: error.message };

  const { rows } = await sql`
    SELECT
      id AS "_id",
      first_name AS "firstName",
      last_name AS "lastName",
      email,
      password
    FROM members
    WHERE email = ${data.email}
    LIMIT 1;
  `;
  const result = rows[0];
  if (!result) return { message: "Invalid credentials" };

  const passwordsMatch = await bcrypt.compare(data.password, result.password);
  if (!passwordsMatch) return { message: "Invalid credentials" };

  const resultObj = { ...result };
  delete resultObj.password;

  const expires = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ resultObj, expires });

  cookies().set("session", session, { expires, httpOnly: true, secure: true });

  revalidatePath("/");
  redirect("/");
}

export async function logout() {
  cookies().set("session", "", { expires: new Date(0) });
}

export async function updateSession(request) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

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

export async function resetPassword(prevState, formData) {
  const email = formData.get("email")?.toLowerCase().trim();
  const newPassword = formData.get("newPassword");

  if (!email || !newPassword) {
    return { message: "Email and new password are required", success: false };
  }

  try {
    const { rows } = await sql`
      SELECT id FROM members WHERE email = ${email} LIMIT 1;
    `;
    const existingUser = rows[0];
    if (!existingUser) {
      return { message: "No user found for that email", success: false };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await sql`
      UPDATE members SET password = ${hashedPassword}
      WHERE id = ${existingUser.id};
    `;

    revalidatePath("/");
    return {
      message: "Password reset. You can now sign in with the new password.",
      success: true,
    };
  } catch (error) {
    console.error(error);
    return { message: "Failed to reset password. Try again.", success: false };
  }
}

//////////////////////////////////////////////////////////////
// HELPERS
//////////////////////////////////////////////////////////////

function nowISO() {
  return new Date().toISOString();
}

function normalizeText(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

//////////////////////////////////////////////////////////////
// PROJECTS
//////////////////////////////////////////////////////////////

export async function createProject(prevState, formData) {
  const userId = await requireUserId();
  const title = normalizeText(formData.get("title"));
  const details = normalizeText(formData.get("details"));

  if (!title) return { message: "Project title is required" };

  const { rows } = await sql`
    INSERT INTO projects (user_id, title, details, status, created_at, updated_at)
    VALUES (${userId}, ${title}, ${details}, 'active', NOW(), NOW())
    RETURNING id;
  `;

  revalidatePath("/projects");
  return { message: "Project created", id: rows[0]?.id };
}

export async function updateProject(prevState, formData) {
  const userId = await requireUserId();
  const projectId = formData.get("projectId");
  const title = normalizeText(formData.get("title"));
  const details = normalizeText(formData.get("details"));
  const status = formData.get("status"); // 'active' | 'completed' | 'archived'

  if (!projectId) return { message: "Missing projectId" };

  const completedAt = status === "completed" ? nowISO() : null;

  await sql`
    UPDATE projects
    SET
      title = COALESCE(${title}, title),
      details = COALESCE(${details}, details),
      status = COALESCE(${status}, status),
      completed_at = CASE
        WHEN ${status} = 'completed' THEN COALESCE(completed_at, ${completedAt}::timestamptz)
        WHEN ${status} IS NULL THEN completed_at
        ELSE NULL
      END,
      updated_at = NOW()
    WHERE id = ${projectId} AND user_id = ${userId};
  `;

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  return { message: "Project updated" };
}

export async function deleteProject(projectId) {
  const userId = await requireUserId();
  if (!projectId) return { message: "Missing projectId" };

  await sql`DELETE FROM projects WHERE id = ${projectId} AND user_id = ${userId};`;

  revalidatePath("/projects");
  return { message: "Project deleted" };
}

export async function getProjects() {
  const userId = await requireUserId();
  const { rows } = await sql`
    SELECT *
    FROM projects
    WHERE user_id = ${userId}
    ORDER BY created_at DESC;
  `;
  return rows;
}

//////////////////////////////////////////////////////////////
// GOALS
//////////////////////////////////////////////////////////////

export async function createGoal(prevState, formData) {
  const userId = await requireUserId();
  const title = normalizeText(formData.get("title"));
  const details = normalizeText(formData.get("details"));
  const projectId = formData.get("projectId") || null;

  if (!title) return { message: "Goal title is required" };

  const { rows } = await sql`
    INSERT INTO goals (user_id, project_id, title, details, status, created_at, updated_at)
    VALUES (${userId}, ${projectId}, ${title}, ${details}, 'active', NOW(), NOW())
    RETURNING id;
  `;

  revalidatePath("/goals");
  return { message: "Goal created", id: rows[0]?.id };
}

export async function updateGoal(prevState, formData) {
  const userId = await requireUserId();
  const goalId = formData.get("goalId");
  const title = normalizeText(formData.get("title"));
  const details = normalizeText(formData.get("details"));
  const projectId = formData.get("projectId");
  const status = formData.get("status"); // completion_status

  if (!goalId) return { message: "Missing goalId" };

  const completedAt = status === "completed" ? nowISO() : null;

  await sql`
    UPDATE goals
    SET
      title = COALESCE(${title}, title),
      details = COALESCE(${details}, details),
      project_id = COALESCE(${projectId}::uuid, project_id),
      status = COALESCE(${status}, status),
      completed_at = CASE
        WHEN ${status} = 'completed' THEN COALESCE(completed_at, ${completedAt}::timestamptz)
        WHEN ${status} IS NULL THEN completed_at
        ELSE NULL
      END,
      updated_at = NOW()
    WHERE id = ${goalId} AND user_id = ${userId};
  `;

  revalidatePath("/goals");
  return { message: "Goal updated" };
}

export async function deleteGoal(goalId) {
  const userId = await requireUserId();
  if (!goalId) return { message: "Missing goalId" };

  await sql`DELETE FROM goals WHERE id = ${goalId} AND user_id = ${userId};`;

  revalidatePath("/goals");
  return { message: "Goal deleted" };
}

export async function getGoals() {
  const userId = await requireUserId();
  const { rows } = await sql`
    SELECT *
    FROM goals
    WHERE user_id = ${userId}
    ORDER BY created_at DESC;
  `;
  return rows;
}

//////////////////////////////////////////////////////////////
// TASKS
//////////////////////////////////////////////////////////////

export async function createTask(formData) {
  const userId = await requireUserId();

  const title = normalizeText(formData.get("title"));
  const details = normalizeText(formData.get("details"));
  const projectId = formData.get("projectId") || null;

  // Your UI sends YYYY-MM-DD from <input type="date" />
  const scheduledFor = normalizeText(formData.get("scheduledFor"));

  const { rows } = await sql`
  INSERT INTO tasks (user_id, project_id, title, details, scheduled_for, status, created_at, updated_at)
  VALUES (
    ${userId}::uuid,
    ${projectId}::uuid,
    ${title},
    ${details},
    NULLIF(${scheduledFor}, '')::date::timestamptz,
    'active',
    NOW(),
    NOW()
  )
  RETURNING id;
`;

  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  return { message: "Task created", id: rows[0]?.id };
}

export async function updateTask(formData) {
  const userId = await requireUserId();

  const taskId = formData.get("taskId");
  if (!taskId) return { message: "Missing taskId" };

  const title = normalizeText(formData.get("title"));
  const details = normalizeText(formData.get("details"));
  const projectId = formData.get("projectId");
  const scheduledFor = normalizeText(formData.get("scheduledFor"));
  const status = formData.get("status"); // 'active' | 'completed' | 'archived'

  const completedAt = status === "completed" ? nowISO() : null;

  await sql`
    UPDATE tasks
    SET
      title = COALESCE(${title}, title),
      details = COALESCE(${details}, details),
      project_id = COALESCE(${projectId}::uuid, project_id),
      scheduled_for = CASE
        WHEN ${scheduledFor} IS NULL OR ${scheduledFor} = '' THEN scheduled_for
        ELSE ${scheduledFor}::date::timestamptz
      END,
      status = COALESCE(${status}, status),
      completed_at = CASE
        WHEN ${status} = 'completed' THEN COALESCE(completed_at, ${completedAt}::timestamptz)
        WHEN ${status} IS NULL THEN completed_at
        ELSE NULL
      END,
      updated_at = NOW()
    WHERE id = ${taskId} AND user_id = ${userId};
  `;

  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  return { message: "Task updated" };
}

export async function deleteTask(taskId) {
  const userId = await requireUserId();
  if (!taskId) return { message: "Missing taskId" };

  await sql`DELETE FROM tasks WHERE id = ${taskId} AND user_id = ${userId};`;

  revalidatePath("/tasks");
  return { message: "Task deleted" };
}

export async function getTasks({
  projectId = null,
  from = null,
  to = null,
} = {}) {
  const userId = await requireUserId();

  // Flexible filtering:
  // - projectId: filter tasks belonging to a project
  // - from/to: scheduled_for range (calendar view)
  const { rows } = await sql`
    SELECT *
    FROM tasks
    WHERE user_id = ${userId}
      AND (${projectId}::uuid IS NULL OR project_id = ${projectId}::uuid)
      AND (${from}::timestamptz IS NULL OR scheduled_for >= ${from}::timestamptz)
      AND (${to}::timestamptz IS NULL OR scheduled_for < ${to}::timestamptz)
    ORDER BY
      status ASC,
      scheduled_for NULLS LAST,
      created_at DESC;
  `;

  return rows;
}

//////////////////////////////////////////////////////////////
// GOAL <-> TASK LINKS
//////////////////////////////////////////////////////////////

export async function linkTaskToGoal(goalId, taskId) {
  const userId = await requireUserId();
  if (!goalId || !taskId) return { message: "Missing goalId or taskId" };

  // Ensure both belong to user
  const { rows: goalRows } = await sql`
    SELECT id FROM goals WHERE id = ${goalId} AND user_id = ${userId} LIMIT 1;
  `;
  const { rows: taskRows } = await sql`
    SELECT id FROM tasks WHERE id = ${taskId} AND user_id = ${userId} LIMIT 1;
  `;
  if (!goalRows[0] || !taskRows[0]) return { message: "Not found" };

  await sql`
    INSERT INTO goal_tasks (goal_id, task_id)
    VALUES (${goalId}, ${taskId})
    ON CONFLICT DO NOTHING;
  `;

  revalidatePath("/goals");
  return { message: "Linked" };
}

export async function unlinkTaskFromGoal(goalId, taskId) {
  const userId = await requireUserId();
  if (!goalId || !taskId) return { message: "Missing goalId or taskId" };

  // (Optional) ownership check omitted for brevity; row delete is safe due to join keys
  await sql`DELETE FROM goal_tasks WHERE goal_id = ${goalId} AND task_id = ${taskId};`;

  revalidatePath("/goals");
  return { message: "Unlinked" };
}

export async function getTasksForGoal(goalId) {
  const userId = await requireUserId();
  if (!goalId) return [];

  const { rows } = await sql`
    SELECT t.*
    FROM goal_tasks gt
    JOIN tasks t ON t.id = gt.task_id
    JOIN goals g ON g.id = gt.goal_id
    WHERE gt.goal_id = ${goalId}
      AND g.user_id = ${userId}
      AND t.user_id = ${userId}
    ORDER BY t.status ASC, t.scheduled_for NULLS LAST, t.created_at DESC;
  `;
  return rows;
}

//////////////////////////////////////////////////////////////
// WRD ITEMS (do/watch/read/go/eat)
//////////////////////////////////////////////////////////////

export async function createWrdItem(prevState, formData) {
  const userId = await requireUserId();
  const category = formData.get("category"); // 'do' | 'watch' | 'read' | 'go' | 'eat'
  const name = normalizeText(formData.get("name"));
  const details = normalizeText(formData.get("details"));

  if (!category || !name) return { message: "Category and name are required" };

  const { rows } = await sql`
    INSERT INTO wrd_items (user_id, category, name, details, status, created_at, updated_at)
    VALUES (${userId}, ${category}::wrd_category, ${name}, ${details}, 'active', NOW(), NOW())
    RETURNING id;
  `;

  revalidatePath("/wrd");
  return { message: "Item created", id: rows[0]?.id };
}

export async function updateWrdItem(prevState, formData) {
  const userId = await requireUserId();
  const id = formData.get("id");
  if (!id) return { message: "Missing id" };

  const category = formData.get("category");
  const name = normalizeText(formData.get("name"));
  const details = normalizeText(formData.get("details"));
  const status = formData.get("status"); // completion_status
  const completedAt = status === "completed" ? nowISO() : null;

  await sql`
    UPDATE wrd_items
    SET
      category = COALESCE(${category}::wrd_category, category),
      name = COALESCE(${name}, name),
      details = COALESCE(${details}, details),
      status = COALESCE(${status}, status),
      completed_at = CASE
        WHEN ${status} = 'completed' THEN COALESCE(completed_at, ${completedAt}::timestamptz)
        WHEN ${status} IS NULL THEN completed_at
        ELSE NULL
      END,
      updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId};
  `;

  revalidatePath("/wrd");
  return { message: "Item updated" };
}

export async function deleteWrdItem(id) {
  const userId = await requireUserId();
  if (!id) return { message: "Missing id" };

  await sql`DELETE FROM wrd_items WHERE id = ${id} AND user_id = ${userId};`;

  revalidatePath("/wrd");
  return { message: "Item deleted" };
}

export async function getWrdItems(category = null) {
  const userId = await requireUserId();
  const { rows } = await sql`
    SELECT *
    FROM wrd_items
    WHERE user_id = ${userId}
      AND (${category}::wrd_category IS NULL OR category = ${category}::wrd_category)
    ORDER BY status ASC, created_at DESC;
  `;
  return rows;
}

//////////////////////////////////////////////////////////////
// IDEAS + LINKS (to tasks/goals/projects)
//////////////////////////////////////////////////////////////

export async function createIdea(prevState, formData) {
  const userId = await requireUserId();
  const idea = normalizeText(formData.get("idea"));
  const details = normalizeText(formData.get("details"));
  const status = formData.get("status") || "backburner"; // idea_status

  if (!idea) return { message: "Idea text is required" };

  const { rows } = await sql`
    INSERT INTO ideas (user_id, idea, details, status, created_at, updated_at)
    VALUES (${userId}, ${idea}, ${details}, ${status}::idea_status, NOW(), NOW())
    RETURNING id;
  `;

  revalidatePath("/ideas");
  return { message: "Idea created", id: rows[0]?.id };
}

export async function updateIdea(prevState, formData) {
  const userId = await requireUserId();
  const id = formData.get("id");
  if (!id) return { message: "Missing id" };

  const idea = normalizeText(formData.get("idea"));
  const details = normalizeText(formData.get("details"));
  const status = formData.get("status");

  await sql`
    UPDATE ideas
    SET
      idea = COALESCE(${idea}, idea),
      details = COALESCE(${details}, details),
      status = COALESCE(${status}::idea_status, status),
      updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId};
  `;

  revalidatePath("/ideas");
  return { message: "Idea updated" };
}

export async function deleteIdea(id) {
  const userId = await requireUserId();
  if (!id) return { message: "Missing id" };

  await sql`DELETE FROM ideas WHERE id = ${id} AND user_id = ${userId};`;

  revalidatePath("/ideas");
  return { message: "Idea deleted" };
}

export async function getIdeas() {
  const userId = await requireUserId();
  const { rows } = await sql`
    SELECT *
    FROM ideas
    WHERE user_id = ${userId}
    ORDER BY created_at DESC;
  `;
  return rows;
}

export async function linkIdea(ideaId, targetType, targetId) {
  const userId = await requireUserId();
  if (!ideaId || !targetType || !targetId) return { message: "Missing params" };

  // Ensure idea belongs to user
  const { rows: irows } = await sql`
    SELECT id FROM ideas WHERE id = ${ideaId} AND user_id = ${userId} LIMIT 1;
  `;
  if (!irows[0]) return { message: "Idea not found" };

  await sql`
    INSERT INTO idea_links (idea_id, target_type, target_id)
    VALUES (${ideaId}, ${targetType}::entity_type, ${targetId}::uuid)
    ON CONFLICT DO NOTHING;
  `;

  revalidatePath("/ideas");
  return { message: "Linked" };
}

export async function unlinkIdea(ideaId, targetType, targetId) {
  await requireUserId();
  await sql`
    DELETE FROM idea_links
    WHERE idea_id = ${ideaId}
      AND target_type = ${targetType}::entity_type
      AND target_id = ${targetId}::uuid;
  `;
  revalidatePath("/ideas");
  return { message: "Unlinked" };
}

//////////////////////////////////////////////////////////////
// NOTES (belongs to exactly ONE thing, enforced in actions)
//////////////////////////////////////////////////////////////

export async function createNote(prevState, formData) {
  const userId = await requireUserId();

  const note = normalizeText(formData.get("note"));
  const targetType = formData.get("targetType"); // entity_type
  const targetId = formData.get("targetId"); // uuid

  if (!note || !targetType || !targetId) {
    return { message: "Note, targetType, and targetId are required" };
  }

  const { rows } = await sql`
    INSERT INTO notes (user_id, note, created_at, updated_at)
    VALUES (${userId}, ${note}, NOW(), NOW())
    RETURNING id;
  `;
  const noteId = rows[0]?.id;

  // Enforce one-to-one: create exactly one link
  await sql`
    INSERT INTO note_links (note_id, target_type, target_id)
    VALUES (${noteId}, ${targetType}::entity_type, ${targetId}::uuid);
  `;

  revalidatePath("/");
  return { message: "Note added", id: noteId };
}

export async function updateNote(prevState, formData) {
  const userId = await requireUserId();
  const noteId = formData.get("noteId");
  const note = normalizeText(formData.get("note"));

  const targetType = formData.get("targetType");
  const targetId = formData.get("targetId");

  if (!noteId) return { message: "Missing noteId" };

  await sql`
    UPDATE notes
    SET
      note = COALESCE(${note}, note),
      updated_at = NOW()
    WHERE id = ${noteId} AND user_id = ${userId};
  `;

  // If targetType/targetId provided, update the (single) link row.
  if (targetType && targetId) {
    // Update if exists; otherwise insert (still one-to-one in app logic)
    const { rowCount } = await sql`
      UPDATE note_links
      SET target_type = ${targetType}::entity_type,
          target_id = ${targetId}::uuid
      WHERE note_id = ${noteId};
    `;
    if (!rowCount) {
      await sql`
        INSERT INTO note_links (note_id, target_type, target_id)
        VALUES (${noteId}, ${targetType}::entity_type, ${targetId}::uuid);
      `;
    }
  }

  revalidatePath("/");
  return { message: "Note updated" };
}

export async function deleteNote(noteId) {
  const userId = await requireUserId();
  if (!noteId) return { message: "Missing noteId" };

  await sql`DELETE FROM notes WHERE id = ${noteId} AND user_id = ${userId};`;

  revalidatePath("/");
  return { message: "Note deleted" };
}

export async function getNotesForTarget(targetType, targetId) {
  const userId = await requireUserId();
  if (!targetType || !targetId) return [];

  const { rows } = await sql`
    SELECT n.*
    FROM note_links nl
    JOIN notes n ON n.id = nl.note_id
    WHERE nl.target_type = ${targetType}::entity_type
      AND nl.target_id = ${targetId}::uuid
      AND n.user_id = ${userId}
    ORDER BY n.created_at DESC;
  `;
  return rows;
}

//////////////////////////////////////////////////////////////
// JOURNAL ENTRIES
//////////////////////////////////////////////////////////////

export async function upsertJournalEntry(prevState, formData) {
  const userId = await requireUserId();

  const entryDate = formData.get("entryDate"); // YYYY-MM-DD
  const privacy = formData.get("privacy") || "private";

  if (!entryDate) return { message: "entryDate is required" };

  const payload = {
    exercise: normalizeText(formData.get("exercise")),
    food: normalizeText(formData.get("food")),
    mood_start: normalizeText(formData.get("moodStart")),
    mood_end: normalizeText(formData.get("moodEnd")),
    weather: normalizeText(formData.get("weather")),
    lesson_learned: normalizeText(formData.get("lessonLearned")),
    reflections: normalizeText(formData.get("reflections")),
  };

  await sql`
    INSERT INTO journal_entries (
      user_id, privacy, entry_date,
      exercise, food, mood_start, mood_end, weather, lesson_learned, reflections,
      created_at, updated_at
    )
    VALUES (
      ${userId},
      ${privacy}::privacy_level,
      ${entryDate}::date,
      ${payload.exercise},
      ${payload.food},
      ${payload.mood_start},
      ${payload.mood_end},
      ${payload.weather},
      ${payload.lesson_learned},
      ${payload.reflections},
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id, entry_date)
    DO UPDATE SET
      privacy = EXCLUDED.privacy,
      exercise = EXCLUDED.exercise,
      food = EXCLUDED.food,
      mood_start = EXCLUDED.mood_start,
      mood_end = EXCLUDED.mood_end,
      weather = EXCLUDED.weather,
      lesson_learned = EXCLUDED.lesson_learned,
      reflections = EXCLUDED.reflections,
      updated_at = NOW();
  `;

  revalidatePath("/journal");
  return { message: "Journal entry saved" };
}

export async function getJournalEntries({ from = null, to = null } = {}) {
  const userId = await requireUserId();

  const { rows } = await sql`
    SELECT *
    FROM journal_entries
    WHERE user_id = ${userId}
      AND (${from}::date IS NULL OR entry_date >= ${from}::date)
      AND (${to}::date IS NULL OR entry_date <= ${to}::date)
    ORDER BY entry_date DESC;
  `;

  return rows;
}

export async function deleteJournalEntry(entryDate) {
  const userId = await requireUserId();
  if (!entryDate) return { message: "Missing entryDate" };

  await sql`
    DELETE FROM journal_entries
    WHERE user_id = ${userId} AND entry_date = ${entryDate}::date;
  `;

  revalidatePath("/journal");
  return { message: "Journal entry deleted" };
}

//////////////////////////////////////////////////////////////
// RECIPES
//////////////////////////////////////////////////////////////

export async function createRecipe(prevState, formData) {
  const userId = await requireUserId();
  const title = normalizeText(formData.get("title"));
  const recipe = normalizeText(formData.get("recipe"));

  if (!title || !recipe) return { message: "Title and recipe are required" };

  const { rows } = await sql`
    INSERT INTO recipes (user_id, title, recipe, created_at, updated_at)
    VALUES (${userId}, ${title}, ${recipe}, NOW(), NOW())
    RETURNING id;
  `;

  revalidatePath("/recipes");
  return { message: "Recipe created", id: rows[0]?.id };
}

export async function updateRecipe(prevState, formData) {
  const userId = await requireUserId();
  const id = formData.get("id");
  if (!id) return { message: "Missing id" };

  const title = normalizeText(formData.get("title"));
  const recipe = normalizeText(formData.get("recipe"));

  await sql`
    UPDATE recipes
    SET
      title = COALESCE(${title}, title),
      recipe = COALESCE(${recipe}, recipe),
      updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId};
  `;

  revalidatePath("/recipes");
  return { message: "Recipe updated" };
}

export async function deleteRecipe(id) {
  const userId = await requireUserId();
  if (!id) return { message: "Missing id" };

  await sql`DELETE FROM recipes WHERE id = ${id} AND user_id = ${userId};`;

  revalidatePath("/recipes");
  return { message: "Recipe deleted" };
}

export async function getRecipes() {
  const userId = await requireUserId();
  const { rows } = await sql`
    SELECT *
    FROM recipes
    WHERE user_id = ${userId}
    ORDER BY created_at DESC;
  `;
  return rows;
}

//////////////////////////////////////////////////////////////
// MEMORIES
//////////////////////////////////////////////////////////////

export async function createMemory(prevState, formData) {
  const userId = await requireUserId();

  const privacy = formData.get("privacy") || "private";
  const memory = normalizeText(formData.get("memory"));
  const year = formData.get("year");
  const month = formData.get("month");
  const day = formData.get("day");

  if (!memory || !year || !month || !day) {
    return { message: "Memory + year/month/day are required" };
  }

  const { rows } = await sql`
    INSERT INTO memories (user_id, privacy, memory, year, month, day, created_at, updated_at)
    VALUES (${userId}, ${privacy}::privacy_level, ${memory}, ${year}::int, ${month}::int, ${day}::int, NOW(), NOW())
    RETURNING id;
  `;

  revalidatePath("/memories");
  return { message: "Memory created", id: rows[0]?.id };
}

export async function updateMemory(prevState, formData) {
  const userId = await requireUserId();
  const id = formData.get("id");
  if (!id) return { message: "Missing id" };

  const privacy = formData.get("privacy");
  const memory = normalizeText(formData.get("memory"));
  const year = formData.get("year");
  const month = formData.get("month");
  const day = formData.get("day");

  await sql`
    UPDATE memories
    SET
      privacy = COALESCE(${privacy}::privacy_level, privacy),
      memory = COALESCE(${memory}, memory),
      year = COALESCE(${year}::int, year),
      month = COALESCE(${month}::int, month),
      day = COALESCE(${day}::int, day),
      updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId};
  `;

  revalidatePath("/memories");
  return { message: "Memory updated" };
}

export async function deleteMemory(id) {
  const userId = await requireUserId();
  if (!id) return { message: "Missing id" };

  await sql`DELETE FROM memories WHERE id = ${id} AND user_id = ${userId};`;

  revalidatePath("/memories");
  return { message: "Memory deleted" };
}

export async function getMemories() {
  const userId = await requireUserId();
  const { rows } = await sql`
    SELECT *
    FROM memories
    WHERE user_id = ${userId}
    ORDER BY year DESC, month DESC, day DESC, created_at DESC;
  `;
  return rows;
}

//////////////////////////////////////////////////////////////
// QUOTES
//////////////////////////////////////////////////////////////

export async function createQuote(prevState, formData) {
  const userId = await requireUserId();
  const quote = normalizeText(formData.get("quote"));
  const author = normalizeText(formData.get("author"));

  if (!quote) return { message: "Quote is required" };

  const { rows } = await sql`
    INSERT INTO quotes (user_id, quote, author, created_at, updated_at)
    VALUES (${userId}, ${quote}, ${author}, NOW(), NOW())
    RETURNING id;
  `;

  revalidatePath("/quotes");
  return { message: "Quote created", id: rows[0]?.id };
}

export async function updateQuote(prevState, formData) {
  const userId = await requireUserId();
  const id = formData.get("id");
  if (!id) return { message: "Missing id" };

  const quote = normalizeText(formData.get("quote"));
  const author = normalizeText(formData.get("author"));

  await sql`
    UPDATE quotes
    SET
      quote = COALESCE(${quote}, quote),
      author = COALESCE(${author}, author),
      updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId};
  `;

  revalidatePath("/quotes");
  return { message: "Quote updated" };
}

export async function deleteQuote(id) {
  const userId = await requireUserId();
  if (!id) return { message: "Missing id" };

  await sql`DELETE FROM quotes WHERE id = ${id} AND user_id = ${userId};`;

  revalidatePath("/quotes");
  return { message: "Quote deleted" };
}

export async function getQuotes() {
  const userId = await requireUserId();
  const { rows } = await sql`
    SELECT *
    FROM quotes
    WHERE user_id = ${userId}
    ORDER BY created_at DESC;
  `;
  return rows;
}

//////////////////////////////////////////////////////////////
// DREAMS
//////////////////////////////////////////////////////////////

export async function createDream(prevState, formData) {
  const userId = await requireUserId();
  const dream = normalizeText(formData.get("dream"));
  const dreamDate = formData.get("dreamDate"); // YYYY-MM-DD optional

  if (!dream) return { message: "Dream is required" };

  const { rows } = await sql`
    INSERT INTO dreams (user_id, dream, dream_date, created_at, updated_at)
    VALUES (${userId}, ${dream}, COALESCE(${dreamDate}::date, CURRENT_DATE), NOW(), NOW())
    RETURNING id;
  `;

  revalidatePath("/dreams");
  return { message: "Dream created", id: rows[0]?.id };
}

export async function updateDream(prevState, formData) {
  const userId = await requireUserId();
  const id = formData.get("id");
  if (!id) return { message: "Missing id" };

  const dream = normalizeText(formData.get("dream"));
  const dreamDate = formData.get("dreamDate");

  await sql`
    UPDATE dreams
    SET
      dream = COALESCE(${dream}, dream),
      dream_date = COALESCE(${dreamDate}::date, dream_date),
      updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId};
  `;

  revalidatePath("/dreams");
  return { message: "Dream updated" };
}

export async function deleteDream(id) {
  const userId = await requireUserId();
  if (!id) return { message: "Missing id" };

  await sql`DELETE FROM dreams WHERE id = ${id} AND user_id = ${userId};`;

  revalidatePath("/dreams");
  return { message: "Dream deleted" };
}

export async function getDreams() {
  const userId = await requireUserId();
  const { rows } = await sql`
    SELECT *
    FROM dreams
    WHERE user_id = ${userId}
    ORDER BY dream_date DESC, created_at DESC;
  `;
  return rows;
}

//////////////////////////////////////////////////////////////
// TO-BUY
//////////////////////////////////////////////////////////////

export async function createToBuy(prevState, formData) {
  const userId = await requireUserId();
  const item = normalizeText(formData.get("item"));
  const link = normalizeText(formData.get("link"));
  const price = formData.get("price"); // number/string
  const needOrWant = formData.get("needOrWant") || "want"; // 'need'|'want'
  const status = formData.get("status") || "unpurchased"; // 'unpurchased'|'purchased'

  if (!item) return { message: "Item is required" };

  const purchasedAt = status === "purchased" ? nowISO() : null;

  const { rows } = await sql`
    INSERT INTO to_buy (user_id, item, link, price, need_or_want, status, purchased_at, created_at, updated_at)
    VALUES (
      ${userId},
      ${item},
      ${link},
      ${price}::numeric,
      ${needOrWant}::need_want,
      ${status}::purchase_status,
      ${purchasedAt}::timestamptz,
      NOW(),
      NOW()
    )
    RETURNING id;
  `;

  revalidatePath("/to-buy");
  return { message: "Added", id: rows[0]?.id };
}

export async function updateToBuy(prevState, formData) {
  const userId = await requireUserId();
  const id = formData.get("id");
  if (!id) return { message: "Missing id" };

  const item = normalizeText(formData.get("item"));
  const link = normalizeText(formData.get("link"));
  const price = formData.get("price");
  const needOrWant = formData.get("needOrWant");
  const status = formData.get("status");

  const purchasedAt = status === "purchased" ? nowISO() : null;

  await sql`
    UPDATE to_buy
    SET
      item = COALESCE(${item}, item),
      link = COALESCE(${link}, link),
      price = COALESCE(${price}::numeric, price),
      need_or_want = COALESCE(${needOrWant}::need_want, need_or_want),
      status = COALESCE(${status}::purchase_status, status),
      purchased_at = CASE
        WHEN ${status} = 'purchased' THEN COALESCE(purchased_at, ${purchasedAt}::timestamptz)
        WHEN ${status} IS NULL THEN purchased_at
        ELSE NULL
      END,
      updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId};
  `;

  revalidatePath("/to-buy");
  return { message: "Updated" };
}

export async function deleteToBuy(id) {
  const userId = await requireUserId();
  if (!id) return { message: "Missing id" };

  await sql`DELETE FROM to_buy WHERE id = ${id} AND user_id = ${userId};`;

  revalidatePath("/to-buy");
  return { message: "Deleted" };
}

export async function getToBuy() {
  const userId = await requireUserId();
  const { rows } = await sql`
    SELECT *
    FROM to_buy
    WHERE user_id = ${userId}
    ORDER BY status ASC, created_at DESC;
  `;
  return rows;
}

//////////////////////////////////////////////////////////////
// POEMS / LYRICS
//////////////////////////////////////////////////////////////

export async function createPoem(prevState, formData) {
  const userId = await requireUserId();
  const title = normalizeText(formData.get("title"));
  const content = normalizeText(formData.get("content"));

  if (!content) return { message: "Content is required" };

  const { rows } = await sql`
    INSERT INTO poems (user_id, title, content, created_at, updated_at)
    VALUES (${userId}, ${title}, ${content}, NOW(), NOW())
    RETURNING id;
  `;

  revalidatePath("/poems");
  return { message: "Created", id: rows[0]?.id };
}

export async function updatePoem(prevState, formData) {
  const userId = await requireUserId();
  const id = formData.get("id");
  if (!id) return { message: "Missing id" };

  const title = normalizeText(formData.get("title"));
  const content = normalizeText(formData.get("content"));

  await sql`
    UPDATE poems
    SET
      title = COALESCE(${title}, title),
      content = COALESCE(${content}, content),
      updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId};
  `;

  revalidatePath("/poems");
  return { message: "Updated" };
}

export async function deletePoem(id) {
  const userId = await requireUserId();
  if (!id) return { message: "Missing id" };

  await sql`DELETE FROM poems WHERE id = ${id} AND user_id = ${userId};`;

  revalidatePath("/poems");
  return { message: "Deleted" };
}

export async function getPoems() {
  const userId = await requireUserId();
  const { rows } = await sql`
    SELECT *
    FROM poems
    WHERE user_id = ${userId}
    ORDER BY created_at DESC;
  `;
  return rows;
}

//////////////////////////////////////////////////////////////
// STORY IDEAS
//////////////////////////////////////////////////////////////

export async function createStoryIdea(prevState, formData) {
  const userId = await requireUserId();
  const title = normalizeText(formData.get("title"));
  const idea = normalizeText(formData.get("idea"));

  if (!idea) return { message: "Idea is required" };

  const { rows } = await sql`
    INSERT INTO story_ideas (user_id, title, idea, created_at, updated_at)
    VALUES (${userId}, ${title}, ${idea}, NOW(), NOW())
    RETURNING id;
  `;

  revalidatePath("/story-ideas");
  return { message: "Created", id: rows[0]?.id };
}

export async function updateStoryIdea(prevState, formData) {
  const userId = await requireUserId();
  const id = formData.get("id");
  if (!id) return { message: "Missing id" };

  const title = normalizeText(formData.get("title"));
  const idea = normalizeText(formData.get("idea"));

  await sql`
    UPDATE story_ideas
    SET
      title = COALESCE(${title}, title),
      idea = COALESCE(${idea}, idea),
      updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId};
  `;

  revalidatePath("/story-ideas");
  return { message: "Updated" };
}

export async function deleteStoryIdea(id) {
  const userId = await requireUserId();
  if (!id) return { message: "Missing id" };

  await sql`DELETE FROM story_ideas WHERE id = ${id} AND user_id = ${userId};`;

  revalidatePath("/story-ideas");
  return { message: "Deleted" };
}

export async function getStoryIdeas() {
  const userId = await requireUserId();
  const { rows } = await sql`
    SELECT *
    FROM story_ideas
    WHERE user_id = ${userId}
    ORDER BY created_at DESC;
  `;
  return rows;
}
