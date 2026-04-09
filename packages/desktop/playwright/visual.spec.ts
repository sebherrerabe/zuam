import { expect, test, type Page } from "@playwright/test";

// Update these goldens only after a manual comparison against the approved Figma references:
// shell `155:3`, detail `155:233`, analytics `271:2`, progression `155:823`,
// unlock `271:119`, and share card `155:946`.
async function hideTransientDesktopChrome(page: Page) {
  await page.addStyleTag({
    content: `
      .nudge-notification-dock,
      .nudge-modal,
      .nudge-blocking-modal,
      .focus-session-dock,
      .focus-break-overlay,
      .modal-backdrop,
      .desktop-view-banner {
        display: none !important;
      }

      * {
        caret-color: transparent !important;
      }
    `
  });
}

test.describe("desktop warm-light visual baselines", () => {
  test("shell matches the approved warm-light baseline", async ({ page }) => {
    await page.goto("/playwright/harness.html");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
    await hideTransientDesktopChrome(page);

    const shell = page.locator("main.desktop-shell");
    await expect(shell).toHaveScreenshot("desktop-shell-warm-light.png");
  });

  test("task detail matches the approved warm-light baseline", async ({ page }) => {
    await page.goto("/playwright/harness.html?view=detail");
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".task-detail-panel")).toBeVisible();
    await hideTransientDesktopChrome(page);

    const detail = page.locator(".task-detail-panel");
    await expect(detail).toHaveScreenshot("task-detail-warm-light.png");
  });

  test("task detail reward explanation matches the approved baseline", async ({ page }) => {
    await page.goto("/playwright/harness.html?view=detail");
    await page.waitForLoadState("networkidle");
    await hideTransientDesktopChrome(page);

    const rewardPanel = page.locator(".task-detail-reward-panel");
    await expect(rewardPanel).toBeVisible();
    await expect(rewardPanel).toHaveScreenshot("task-detail-reward-panel.png");
  });

  test("task detail focus reward preview matches the approved baseline", async ({ page }) => {
    await page.goto("/playwright/harness.html?view=detail");
    await page.waitForLoadState("networkidle");
    await hideTransientDesktopChrome(page);

    const focusRewardPreview = page.locator(".task-detail-footer");
    await expect(focusRewardPreview).toBeVisible();
    await expect(focusRewardPreview).toHaveScreenshot("task-detail-focus-reward-preview.png");
  });

  test("analytics dashboard matches the approved phase 3 baseline", async ({ page }) => {
    await page.goto("/playwright/harness.html?view=analytics");
    await page.waitForLoadState("networkidle");

    const analytics = page.getByLabel("analytics dashboard");
    await expect(analytics).toBeVisible();
    await expect(analytics).toHaveScreenshot("analytics-dashboard-warm-light.png");
  });

  test("progression profile matches the approved phase 3 baseline", async ({ page }) => {
    await page.goto("/playwright/harness.html?view=progression");
    await page.waitForLoadState("networkidle");

    const progression = page.getByLabel("progression profile");
    await expect(progression).toBeVisible();
    await expect(progression).toHaveScreenshot("progression-profile-warm-light.png");
  });

  test("unlock state matches the approved phase 3 baseline", async ({ page }) => {
    await page.goto("/playwright/harness.html?view=unlock");
    await page.waitForLoadState("networkidle");

    const unlock = page.getByLabel("level up and unlock state");
    await expect(unlock).toBeVisible();
    await expect(unlock).toHaveScreenshot("progression-unlock-state-warm-light.png");
  });

  test("share card matches the approved phase 3 baseline", async ({ page }) => {
    await page.goto("/playwright/harness.html?view=share-card");
    await page.waitForLoadState("networkidle");

    const shareCard = page.getByLabel("progress share card");
    await expect(shareCard).toBeVisible();
    await expect(shareCard).toHaveScreenshot("progress-share-card-warm-light.png");
  });
});
