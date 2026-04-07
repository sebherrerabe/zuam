import { buildDemoList, buildDemoTask } from "./demo-task";

describe("mobile shared imports", () => {
  it("FE-UNIT-MONO-002: resolves shared task and list contracts from the public shared entrypoint", () => {
    expect(buildDemoTask()).toEqual({
      id: "task-demo",
      title: "Scaffold the mobile shell",
      status: "todo"
    });

    expect(buildDemoList()).toEqual({
      id: "list-inbox",
      name: "Inbox"
    });
  });
});
