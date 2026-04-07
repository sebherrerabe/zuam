import { AuthController, AuthEventBus, AuthService, GoogleAuthProviderStub, InMemoryAuthDao } from "../src/modules/auth";

function createHarness() {
  const dao = new InMemoryAuthDao();
  const provider = new GoogleAuthProviderStub();
  const eventBus = new AuthEventBus();
  const service = new AuthService(dao, provider, eventBus);
  const controller = new AuthController(service);
  const events: Array<{ userId: string; authenticated: boolean; inviteRequired: boolean }> = [];

  eventBus.on("auth:session-updated", (event) => {
    events.push(event);
  });

  return { dao, provider, eventBus, service, controller, events };
}

function expectHttpError(fn: () => unknown, status: number, message: string) {
  try {
    fn();
    throw new Error("Expected function to throw");
  } catch (error) {
    expect(error).toHaveProperty("getStatus");
    expect((error as { getStatus: () => number }).getStatus()).toBe(status);
    expect((error as { getResponse: () => unknown }).getResponse()).toEqual(
      expect.objectContaining({ message })
    );
  }
}

describe("auth-invite-onboarding backend flows", () => {
  it("BE-E2E-AUTH-001: Google OAuth happy path issues a session and returns the authenticated user payload", () => {
    const { controller, dao } = createHarness();
    dao.seedInvite("invite-valid");

    const start = controller.startGoogle({ returnTo: "/today" });
    expect(start.authorizationUrl).toContain("accounts.google.com");

    controller.validateInvite({ token: "invite-valid" });

    const callback = controller.googleCallback({
      code: "alpha",
      state: "state-1",
      inviteToken: "invite-valid"
    });

    expect(callback.user.googleSubject).toBe("subject-alpha");
    expect(callback.isNewUser).toBe(true);
    expect(callback.inviteRequired).toBe(false);
    expect(callback.cookies).toHaveLength(2);
    expect(callback.session.accessToken).toMatch(/^access_/);

    const repeatCallback = controller.googleCallback({
      code: "alpha",
      state: "state-1"
    });

    expect(repeatCallback.user.id).toBe(callback.user.id);
    expect(repeatCallback.isNewUser).toBe(false);
  });

  it("BE-E2E-AUTH-002: invite token is required on first login and validation is deterministic", () => {
    const { controller, dao } = createHarness();
    dao.seedInvite("invite-valid");

    expect(controller.validateInvite({ token: "invite-valid" })).toEqual({
      valid: true,
      inviteId: expect.any(String),
      expiresAt: expect.any(Date)
    });

    const callback = controller.googleCallback({
      code: "bravo",
      state: "state-2"
    });

    expect(callback.inviteRequired).toBe(true);
    expect(callback.isNewUser).toBe(true);
  });

  it("BE-E2E-AUTH-003: invalid invite tokens fail cleanly and cannot be validated twice", () => {
    const { controller, dao } = createHarness();
    dao.seedInvite("invite-one");

    expectHttpError(() => controller.validateInvite({ token: "" }), 400, "Invite token is required");
    expectHttpError(() => controller.validateInvite({ token: "missing" }), 404, "Invite token not found");

    controller.validateInvite({ token: "invite-one" });

    expectHttpError(
      () => controller.validateInvite({ token: "invite-one" }),
      409,
      "Invite token already validated"
    );
  });

  it("BE-E2E-AUTH-004: refresh and logout rotate or revoke cleanly", () => {
    const { controller, events } = createHarness();

    const first = controller.googleCallback({
      code: "charlie",
      state: "state-3"
    });

    const refreshed = controller.refresh({ refreshToken: first.session.refreshToken });
    expect(refreshed.session.refreshToken).not.toBe(first.session.refreshToken);
    expect(refreshed.session.accessToken).not.toBe(first.session.accessToken);

    expect(events).toContainEqual({
      userId: first.user.id,
      authenticated: false,
      inviteRequired: true
    });

    controller.logout({ refreshToken: refreshed.session.refreshToken });
    expect(events.at(-1)).toEqual({
      userId: first.user.id,
      authenticated: false,
      inviteRequired: true
    });
  });

  it("BE-E2E-AUTH-005: OAuth failure surfaces safe errors without creating a session", () => {
    const { controller, provider } = createHarness();
    provider.setConfigured(false);

    expectHttpError(() => controller.startGoogle({ returnTo: "/today" }), 401, "Google auth is not configured");

    expectHttpError(
      () =>
        controller.googleCallback({
          code: "delta",
          state: "state-4",
          error: "access_denied"
        }),
      400,
      "Google callback returned an error"
    );
  });
});
