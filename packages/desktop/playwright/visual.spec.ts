import { expect, test, type Page } from "@playwright/test";

// Update these goldens only after a manual comparison against the approved Figma references:
// shell `155:3` and detail `155:233`.
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
    await page.goto("/playwright/harness.html");
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".task-detail-panel")).toBeVisible();
    await hideTransientDesktopChrome(page);

    const detail = page.locator(".task-detail-panel");
    await expect(detail).toHaveScreenshot("task-detail-warm-light.png");
  });
});
