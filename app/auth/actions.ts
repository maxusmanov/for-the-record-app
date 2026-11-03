"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "enter your email and password" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message.toLowerCase() };

  redirect("/home");
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().replace(/^@/, "").toLowerCase();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!name || !username || !email || !password) return { error: "fill in all fields" };
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return { error: "username must be 3–20 letters, numbers or _" };
  }

  const supabase = await createClient();

  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (taken) return { error: "that username is taken" };

  const origin = (await headers()).get("origin");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // The database copies these into the new profiles row.
      data: { display_name: name, username },
      // Where the link in the confirmation email sends them.
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });
  if (error) {
    // Saving the profile fails if someone grabbed the username a moment ago.
    if (error.message.includes("Database error")) return { error: "that username is taken" };
    if (error.code === "over_email_send_rate_limit") {
      return { error: "too many sign ups right now, try again in a bit" };
    }
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return { error: "that email is already registered, try logging in" };
    }
    return { error: error.message.toLowerCase() };
  }

  // With email confirmation on, Supabase hides whether an email is already
  // registered: it returns a placeholder user with no identities and sends nothing.
  if (data.user && data.user.identities?.length === 0) {
    return { error: "that email is already registered, try logging in" };
  }

  // Signed up and logged in straight away (email confirmation is off).
  if (data.session) redirect("/home");

  // Account created, but they're not logged in until they click the email link.
  if (data.user) return { message: "check your email to confirm your account" };

  return { error: "something went wrong, please try again" };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
