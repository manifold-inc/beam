import { validateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { User } from "@/server/schema";
import { eq } from "drizzle-orm";
import { createUploadthing } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
 
const f = createUploadthing();
 
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  postImage: f({ image: {maxFileCount: 1} })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      const user = await validateRequest()
 
      // If you throw, the user will not be able to upload
      if (!user.user) throw new UploadThingError("Unauthorized");
 
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.user.id };
    })
    .onUploadComplete(({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return file
    }),
  userAvatar: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      const user = await validateRequest()
 
      // If you throw, the user will not be able to upload
      if (!user.user) throw new UploadThingError("Unauthorized");
 
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
 
      console.log("file url", file.url);
      await db.update(User)
        .set({ image: file.url })
        .where(eq(User.id, metadata.userId))
 
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return 
    }),
};
 
export type OurFileRouter = typeof ourFileRouter;
