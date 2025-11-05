"use server"

import { revalidatePath } from "next/cache"

export async function revalidateVideoSessions() {
  revalidatePath("/video-sessions")
  revalidatePath("/dashboard")
}
