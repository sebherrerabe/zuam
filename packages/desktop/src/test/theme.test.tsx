import { render, screen } from "@testing-library/react";

import { shellTheme } from "../lib/theme";

function ThemeProbe() {
  return (
    <div>
      <span>{shellTheme.accent}</span>
      <span>{shellTheme.bodyFont}</span>
    </div>
  );
}

describe("desktop shared imports", () => {
  it("FE-UNIT-MONO-001: resolves shared theme tokens and typography through the shared public entrypoint", () => {
    render(<ThemeProbe />);

    expect(screen.getByText("#5B6AF0")).toBeInTheDocument();
    expect(screen.getByText("Inter")).toBeInTheDocument();
  });
});
