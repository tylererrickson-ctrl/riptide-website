/**
 * Runs before every build (npm "prebuild"). Vercel restores `.next/cache` from the previous deployment,
 * and reusing it has shipped stale output twice:
 *  - `.next/cache/fetch-cache` held old Sanity results, so pages prerendered pre-publish content;
 *  - `.next/cache/turbopack` (persistent compile cache) failed to pick up a globals.css change, so a
 *    deploy built from the new commit still served the previous stylesheet (2026-10-18).
 * The whole cache is cleared so every build compiles and prerenders from the committed source + live CMS.
 * Cost: a slower cold compile (well under a minute for this site).
 */
import { rmSync } from "node:fs";

rmSync(".next/cache", { recursive: true, force: true });
console.log("Cleared .next/cache so this build compiles and prerenders from scratch.");
