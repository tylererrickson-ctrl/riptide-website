export const apiVersion = "2026-10-01";

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing NEXT_PUBLIC_SANITY_PROJECT_ID",
);

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing NEXT_PUBLIC_SANITY_DATASET",
);

export const studioUrl = "/studio";

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined || v === "") throw new Error(errorMessage);
  return v;
}
