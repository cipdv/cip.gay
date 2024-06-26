import { z } from "zod";

const isImageFile = (path) => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
  const extension = path.split(".").pop();
  return imageExtensions.includes(extension.toLowerCase());
};

export const journalSchema = z.object({
  entry: z.string().min(1, "Journal entry is empty"),
  notes: z.string().optional(),
  images: z
    .array(
      z.string().refine(isImageFile, {
        message: "Must be an image file",
      })
    )
    .optional()
    .default([]),
});

export const ideaSchema = z.object({
  idea: z.string().min(1, "Idea is empty"),
  notes: z.string().optional(),
  images: z
    .array(
      z.string().refine(isImageFile, {
        message: "Must be an image file",
      })
    )
    .optional()
    .default([]),
});

export const todoSchema = z.object({
  todo: z.string().min(1, "Todo is empty"),
  notes: z.string().optional(),
  deadline: z.string().optional(),
  images: z
    .array(
      z.string().refine(isImageFile, {
        message: "Must be an image file",
      })
    )
    .optional()
    .default([]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password is too short"),
});

export const WRDSchema = z.object({
  type: z.string().min(1, "Type is empty"),
  notes: z.string().optional(),
  images: z
    .array(
      z.string().refine(isImageFile, {
        message: "Must be an image file",
      })
    )
    .optional()
    .default([]),
});

export const MemoriesSchema = z.object({
  month: z.string().min(1, "Month is empty"),
  year: z.string().min(4, "Year is empty"),
  notes: z.string().optional(),
  images: z
    .array(
      z.string().refine(isImageFile, {
        message: "Must be an image file",
      })
    )
    .optional()
    .default([]),
});
