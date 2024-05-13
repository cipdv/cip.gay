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
