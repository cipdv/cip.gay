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
