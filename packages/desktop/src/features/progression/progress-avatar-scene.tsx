import { Application, extend } from "@pixi/react";
import { Container, Graphics } from "pixi.js";

import type { Unlockable } from "../../lib/api/desktop-api.types";

extend({ Container, Graphics });

export function ProgressAvatarScene({ unlockables }: { unlockables: Array<Unlockable & { accent: string }> }) {
  const cloak = unlockables.find((unlockable) => unlockable.type === "cloak");
  const hat = unlockables.find((unlockable) => unlockable.type === "hat");
  const trail = unlockables.find((unlockable) => unlockable.type === "trail");

  /* eslint-disable react/no-unknown-property */
  return (
    <Application width={180} height={180} backgroundAlpha={0} antialias={false}>
      <pixiContainer>
        <pixiGraphics
          draw={(graphics) => {
            graphics.clear();
            graphics.roundRect(20, 26, 140, 128, 28);
            graphics.fill({ color: "#f5ede3", alpha: 1 });
          }}
        />
        <pixiGraphics
          draw={(graphics) => {
            graphics.clear();
            graphics.circle(92, 64, 24);
            graphics.fill({ color: "#f0d8c5", alpha: 1 });
            graphics.roundRect(64, 88, 56, 54, 16);
            graphics.fill({ color: cloak?.accent ?? "#6b8db5", alpha: 1 });
          }}
        />
        <pixiGraphics
          draw={(graphics) => {
            graphics.clear();
            if (hat) {
              graphics.roundRect(68, 38, 48, 12, 8);
              graphics.fill({ color: hat.accent, alpha: 1 });
            }
            if (trail) {
              graphics.roundRect(36, 130, 108, 10, 8);
              graphics.fill({ color: trail.accent, alpha: 0.55 });
            }
          }}
        />
      </pixiContainer>
    </Application>
  );
  /* eslint-enable react/no-unknown-property */
}
