# CubeDasher Game Intent (Current)

## Core Intent
- Build a fast, playful side-scrolling platformer where the player jumps gaps, avoids hazards, and collects gold.
- Progression should feel level-based and increasingly challenging, but still fair and readable.
- Collecting gold is the main progression objective for advancing through levels.

## Intended Traversal Design
- Gap sizes should vary over time, not feel repetitive.
- Some gaps should become too large for a normal jump.
- When a gap is too large, helper platforms should appear so the player can traverse with skillful timing.
- Platform placement should create interesting movement decisions, not random frustration.

## Current Difficulty Rules
- Gap distances are randomized per chunk with an upper cap.
- If a generated gap exceeds jumpable distance, a mid-air assist platform is spawned for safe traversal.
- Assist platforms are traversal-only: no obstacle or treasure spawns are placed on them.
- Red obstacle placement is constrained by level:
  - Levels 1-4:
    - 20% obstacle chance per slot
    - 150px no-obstacle buffer from both floor edges
    - 200px minimum spacing between red obstacles
    - adjacent obstacle slots are disallowed
  - Levels 5-6:
    - 24% obstacle chance
    - 130px edge buffer
    - 150px minimum spacing
    - adjacent obstacle slots are disallowed
  - Levels 7+:
    - 28% obstacle chance
    - 110px edge buffer
    - 110px minimum spacing
    - adjacent obstacle slots are allowed

## Progression Intent
- Early levels should teach rhythm and movement without forcing near-consecutive jump reactions.
- Mid levels should raise pressure gradually while preserving readability.
- Late levels should feel challenging and faster, but still avoid unfair gap-edge traps.

## Success Criteria for Upcoming Iterations
- Players regularly encounter both small and large gaps.
- Large gaps are usually paired with a viable traversal platform route.
- Obstacle pressure feels challenging but not overwhelming.
- Levels 1-4 avoid sequential-jump obstacle traps and protect gap takeoff/landing zones.
- Early levels are accessible; later levels become meaningfully harder.
