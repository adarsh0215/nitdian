import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

/**
 * Signup -> onboarding -> dashboard -> sign out -> login -> dashboard, against
 * the real Supabase project in .env.local (there is no staging environment).
 * Each run creates one throwaway auth user + profile row; mailer_autoconfirm
 * is on for this project so signup logs straight in, no inbox needed.
 * The user is deleted via the admin API once the test finishes either way.
 */

const email = `nitdian-e2e+${Date.now()}@example.com`;
const password = "SmokeTest123!";
const fullName = "E2E Smoke Test";

async function selectOption(page: Page, label: string, option: string) {
  await page.getByLabel(label).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

async function deleteTestUser() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
  if (data?.id) await admin.auth.admin.deleteUser(data.id);
}

test("signup -> onboarding -> dashboard -> logout -> login -> dashboard", async ({ page }) => {
  try {
    await page.goto("/signup");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Create account" }).click();

    await page.waitForURL("**/onboarding");

    await page.getByLabel(/Full name/).fill(fullName);
    await page.getByPlaceholder("XXXXXXXXXX").fill("9800000000");
    await selectOption(page, "Graduation year", "2010");
    await selectOption(page, "Degree", "B.Tech");
    await selectOption(page, "Branch", "Computer Science & Engineering");
    await page.getByLabel("Networking, Business & Services").click();
    await page.locator("#consent_terms_privacy").click();
    await page.getByRole("button", { name: "Save & continue" }).click();

    await page.waitForURL("**/dashboard");
    await expect(page.getByText("Your profile is pending approval")).toBeVisible();

    await page.getByRole("button", { name: `User menu for ${fullName}` }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await page.waitForURL("**/login");

    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await page.waitForURL("**/dashboard");
    await expect(page.getByText("Your profile is pending approval")).toBeVisible();
  } finally {
    await deleteTestUser();
  }
});
