import { useEffect, useRef, useState } from "react";
import kaboom from "kaboom";
import { Play } from "lucide-react";

export function KaboomGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying || !containerRef.current) return;

    // Create a fresh canvas so StrictMode double-runs don't share state
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.tabIndex = 0;
    containerRef.current.appendChild(canvas);
    canvas.focus();

    const k = kaboom({
      canvas,
      width: 800,
      height: 400,
      background: [173, 216, 230],
      global: false,
    });

    // ── Game State ─────────────────────────────────────────────────
    type Screen = "game" | "gameover" | "win";
    let screen: Screen = "game";
    let currentLevel = 1;
    let goldCollected = 0;
    let goldGoal = 10;
    let baseSpeed = 480;
    let lastFloorX = 0;
    let playerObj: any = null;

    // ── Floor helper ───────────────────────────────────────────────
    const spawnFloor = (x: number, width: number) =>
      k.add([
        k.rect(width, 48),
        k.pos(x, k.height() - 48),
        k.color(167, 243, 208),
        k.outline(4, k.BLACK),
        k.area(),
        k.body({ isStatic: true }),
        "floor",
      ]);

    // ── Spawn the next terrain chunk ────────────────────────────────
    const spawnNextPiece = () => {
      const previousFloorEnd = lastFloorX;
      const minGap = currentLevel >= 3 ? 80 : 50;
      const maxGap = Math.min(360, currentLevel >= 7 ? 340 : currentLevel >= 4 ? 300 : 250);
      const gapSize = k.rand(minGap, maxGap);
      const floorWidth = k.rand(260, 540);
      const x = lastFloorX + gapSize;
      spawnFloor(x, floorWidth);
      lastFloorX = x + floorWidth;

      // If gap is beyond jumpable distance, add a mid-air assist platform.
      const maxJumpGap = Math.max(170, baseSpeed * 0.45);
      if (gapSize > maxJumpGap) {
        const platformWidth = 120;
        const platformCenterX = previousFloorEnd + gapSize / 2;
        k.add([
          k.rect(platformWidth, 20, { radius: 4 }),
          k.pos(platformCenterX - platformWidth / 2, k.height() - 175),
          k.color(100, 210, 160),
          k.outline(4, k.BLACK),
          k.area(),
          k.body({ isStatic: true }),
          "floor",
        ]);
      }

      // Obstacles and treasures on the new chunk
      const slots = Math.max(1, Math.floor(floorWidth / 140));
      const obstacleRules =
        currentLevel <= 4
          ? {
              obstacleChance: 0.2,
              edgeBuffer: 150,
              minSpacing: 200,
              disallowAdjacent: true,
            }
          : currentLevel <= 6
            ? {
                obstacleChance: 0.24,
                edgeBuffer: 130,
                minSpacing: 150,
                disallowAdjacent: true,
              }
            : {
                obstacleChance: 0.28,
                edgeBuffer: 110,
                minSpacing: 110,
                disallowAdjacent: false,
              };
      let lastObstacleX: number | null = null;
      let lastObstacleSlot: number | null = null;

      for (let i = 0; i < slots; i++) {
        const itemX = x + (i + 0.5) * (floorWidth / slots);
        const roll = k.rand();
        const inSafeZone =
          itemX >= x + obstacleRules.edgeBuffer &&
          itemX <= x + floorWidth - obstacleRules.edgeBuffer;
        const spacingOkay =
          lastObstacleX === null ||
          Math.abs(itemX - lastObstacleX) >= obstacleRules.minSpacing;
        const adjacencyOkay =
          !obstacleRules.disallowAdjacent ||
          lastObstacleSlot === null ||
          i - lastObstacleSlot >= 2;

        if (roll < obstacleRules.obstacleChance && inSafeZone && spacingOkay && adjacencyOkay) {
          // Red obstacle — floating in air from level 3
          const floatChance = Math.min(0.5, (currentLevel - 2) * 0.1);
          const isFloating = currentLevel >= 3 && k.rand() < floatChance;
          k.add([
            k.rect(40, 40, { radius: 6 }),
            k.pos(itemX, isFloating ? k.height() - 150 : k.height() - 48),
            k.anchor("bot"),
            k.color(244, 67, 54),
            k.outline(4, k.BLACK),
            k.area(),
            "obstacle",
          ]);
          lastObstacleX = itemX;
          lastObstacleSlot = i;
        } else if (roll < 0.55) {
          // Gold treasure
          k.add([
            k.rect(24, 24, { radius: 4 }),
            k.pos(itemX, k.height() - k.rand(90, 185)),
            k.color(255, 193, 7),
            k.outline(4, k.BLACK),
            k.area(),
            "treasure",
          ]);
        }
      }
    };

    // ── localStorage helpers ────────────────────────────────────────
    const getHS = () => {
      const v = localStorage.getItem("platformerHighScore");
      return v ? parseInt(v) : 0;
    };
    const saveHS = (score: number) => {
      if (score > getHS()) localStorage.setItem("platformerHighScore", String(score));
    };

    // ── Labels (need refs so we can update text) ────────────────────
    let scoreLabel: any = null;

    // ── Start / restart game level ─────────────────────────────────
    const startGame = (level: number, gold: number) => {
      screen = "game";
      currentLevel = level;
      goldCollected = gold;
      goldGoal = level * 10;
      baseSpeed = 480 * (1 + (level - 1) * 0.1);
      lastFloorX = 0;

      k.destroyAll("floor");
      k.destroyAll("obstacle");
      k.destroyAll("treasure");
      k.destroyAll("player");
      k.destroyAll("ui");
      k.destroyAll("overlay");

      k.setGravity(2400);
      k.camPos(k.width() / 2, k.height() / 2);

      // Initial large floor
      spawnFloor(-200, 1100);
      lastFloorX = 900;

      // HUD
      scoreLabel = k.add([
        k.text(`LEVEL ${level}  GOLD: ${gold}/${goldGoal}`, { size: 19, font: "monospace" }),
        k.pos(16, 14),
        k.fixed(),
        k.z(100),
        k.color(10, 10, 10),
        "ui",
      ]);
      k.add([
        k.text(`BEST: ${getHS()}`, { size: 19, font: "monospace" }),
        k.pos(k.width() - 16, 14),
        k.anchor("topright"),
        k.fixed(),
        k.z(100),
        k.color(10, 10, 10),
        "ui",
      ]);

      // Player
      playerObj = k.add([
        k.rect(40, 40, { radius: 8 }),
        k.pos(80, k.height() - 100),
        k.color(255, 235, 59),
        k.outline(4, k.BLACK),
        k.area(),
        k.body(),
        k.scale(1),
        "player",
      ]);

      playerObj.onUpdate(() => {
        if (screen !== "game") return;
        k.camPos(playerObj.pos.x + 200, k.height() / 2);
        if (playerObj.pos.y > k.height() + 80) {
          startGame(currentLevel, goldCollected);
        }
        if (lastFloorX - playerObj.pos.x < 1000) {
          spawnNextPiece();
        }
      });

      playerObj.onCollide("obstacle", () => {
        if (screen !== "game") return;
        k.burp();
        const score = goldCollected * 100 + (currentLevel - 1) * 50;
        saveHS(score);
        showGameOver(score, currentLevel);
      });

      playerObj.onCollide("treasure", (t: any) => {
        if (screen !== "game") return;
        k.destroy(t);
        goldCollected++;
        if (scoreLabel) scoreLabel.text = `LEVEL ${currentLevel}  GOLD: ${goldCollected}/${goldGoal}`;
        if (goldCollected >= goldGoal) {
          if (currentLevel < 10) {
            startGame(currentLevel + 1, goldCollected);
          } else {
            const score = goldCollected * 100 + 500;
            saveHS(score);
            showWin(score);
          }
        }
      });
    };

    // ── Game Over screen ───────────────────────────────────────────
    const showGameOver = (score: number, level: number) => {
      screen = "gameover";
      k.destroyAll("player");

      const cx = k.camPos().x;
      const cy = k.height() / 2;

      const bg = () =>
        k.add([
          k.rect(k.width(), k.height()),
          k.pos(cx - k.width() / 2, 0),
          k.color(0, 0, 0),
          k.opacity(0.65),
          k.z(200),
          "overlay",
        ]);
      const lbl = (txt: string, y: number, size: number, col: [number, number, number]) =>
        k.add([
          k.text(txt, { size, font: "monospace" }),
          k.pos(cx, cy + y),
          k.anchor("center"),
          k.color(...col),
          k.z(201),
          "overlay",
        ]);

      bg();
      lbl("GAME OVER", -70, 52, [244, 67, 54]);
      lbl(`Level: ${level}   Score: ${score}`, -10, 26, [255, 255, 255]);
      lbl(`BEST: ${getHS()}`, 35, 20, [255, 193, 7]);
      lbl("SPACE / click to retry", 82, 18, [200, 200, 200]);
    };

    // ── Win screen ──────────────────────────────────────────────────
    const showWin = (score: number) => {
      screen = "win";
      k.destroyAll("player");

      const cx = k.camPos().x;
      const cy = k.height() / 2;

      k.add([
        k.rect(k.width(), k.height()),
        k.pos(cx - k.width() / 2, 0),
        k.color(0, 0, 0),
        k.opacity(0.65),
        k.z(200),
        "overlay",
      ]);
      k.add([
        k.text("YOU WIN!", { size: 52, font: "monospace" }),
        k.pos(cx, cy - 60),
        k.anchor("center"),
        k.color(76, 200, 80),
        k.z(201),
        "overlay",
      ]);
      k.add([
        k.text(`Final Score: ${score}`, { size: 28, font: "monospace" }),
        k.pos(cx, cy + 10),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.z(201),
        "overlay",
      ]);
      k.add([
        k.text("SPACE / click to play again", { size: 18, font: "monospace" }),
        k.pos(cx, cy + 68),
        k.anchor("center"),
        k.color(200, 200, 200),
        k.z(201),
        "overlay",
      ]);
    };

    // ── Input: jump / screen transition ───────────────────────────
    const doAction = () => {
      if (screen === "game") {
        if (playerObj && playerObj.isGrounded()) {
          playerObj.jump(1000);
          k.tween(
            playerObj.scale, k.vec2(0.8, 1.2), 0.1,
            (v: any) => { playerObj.scale = v; },
            k.easings.easeOutQuad
          ).then(() =>
            k.tween(
              playerObj.scale, k.vec2(1, 1), 0.1,
              (v: any) => { playerObj.scale = v; },
              k.easings.easeInQuad
            )
          );
        }
      } else if (screen === "gameover") {
        startGame(currentLevel, Math.max(0, (currentLevel - 1) * 10));
      } else if (screen === "win") {
        startGame(1, 0);
      }
    };

    k.onKeyPress("space", doAction);
    k.onKeyPress("up", doAction);
    k.onClick(doAction);
    k.onKeyDown("left", () => { if (screen === "game" && playerObj) playerObj.move(-baseSpeed, 0); });
    k.onKeyDown("right", () => { if (screen === "game" && playerObj) playerObj.move(baseSpeed, 0); });

    // ── Kick it off! ───────────────────────────────────────────────
    startGame(1, 0);

    return () => {
      try { (k as any).quit(); } catch (_) {}
      canvas.remove();
    };
  }, [isPlaying]);

  return (
    <div
      className="relative w-full rounded-3xl border-4 border-gray-900 overflow-hidden shadow-xl bg-sky-200"
      style={{ height: "400px" }}
    >
      {!isPlaying && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-sky-100 z-10">
          <p className="text-gray-600 font-semibold mb-8">10 Levels · Collect Gold to Advance</p>
          <button
            onClick={() => setIsPlaying(true)}
            data-testid="button-start"
            className="flex items-center gap-3 px-8 py-4 bg-yellow-400 font-black text-2xl rounded-2xl border-4 border-gray-900 shadow-[4px_4px_0px_#111] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            <Play size={28} fill="currentColor" />
            START GAME
          </button>
          <div className="mt-6 text-gray-700 font-semibold text-center space-y-2">
            <p>
              <kbd className="px-2 py-1 bg-white border-2 border-gray-900 rounded text-sm font-mono">SPACE</kbd>
              {" / Click — Jump  "}
              <kbd className="px-2 py-1 bg-white border-2 border-gray-900 rounded text-sm font-mono">← →</kbd>
              {" — Move"}
            </p>
            <p className="text-sm text-gray-500">Avoid red blocks · Collect gold · Don't fall in gaps!</p>
          </div>
        </div>
      )}
      {/* kaboom canvas is injected here by the useEffect */}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
