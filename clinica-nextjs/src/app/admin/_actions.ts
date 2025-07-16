"use server";
import { clerkClient } from "@clerk/nextjs/server";
import { checkRole } from "@/utils/roles";
import { revalidatePath } from "next/cache";

export async function setRole(formData: FormData) {
  if (!checkRole("admin")) {
    throw "No eres el admin";
  }

  const client = await clerkClient();
  const userId = formData.get("id") as string;
  const role = formData.get("role") as string;

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      role: role,
    },
  });

  revalidatePath("/admin");
  // Don't return anything
}

export async function removeRole(formData: FormData) {
  if (!checkRole("admin")) {
    return; // or throw an error
  }

  const client = await clerkClient();
  const userId = formData.get("id") as string;

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      role: null,
    },
  });

  revalidatePath("/admin");
  // Don't return anything
}
