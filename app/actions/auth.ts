"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { field, firstIssue, type ActionState } from "@/lib/form";
import { loginSchema, registerSchema } from "@/lib/validation";

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: field(formData, "name"),
    email: field(formData, "email"),
    password: field(formData, "password"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists." };

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });

  await createSession(user.id);
  redirect("/projects");
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: field(formData, "email"),
    password: field(formData, "password"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "Email or password is incorrect." };
  }

  await createSession(user.id);
  redirect("/projects");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
