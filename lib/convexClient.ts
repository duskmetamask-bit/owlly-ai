const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://astute-gull-629.convex.cloud";

function getConvexHeaders() {
  const CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  const publishableKey = CLERK_PUBLISHABLE_KEY.startsWith("pk_test_")
    ? CLERK_PUBLISHABLE_KEY
    : `pk_test_${CLERK_PUBLISHABLE_KEY.split("pk_test_")[1] ?? ""}`;

  // Get the Clerk auth token from the current session via __session cookie
  // The token is read server-side from the Clerk session JWT
  return {
    "Content-Type": "application/json",
    "ClerkPublishableKey": CLERK_PUBLISHABLE_KEY,
  };
}

export async function getTeacherByClerkUserId(clerkUserId: string) {
  const res = await fetch(`${CONVEX_URL}/api/teachers/getByClerkUserId`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clerkUserId }),
    credentials: "include",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function saveUnitPlanToConvex(args: {
  teacherId: string;
  title: string;
  content: string;
  yearLevel?: string;
  subject?: string;
}) {
  const res = await fetch(`${CONVEX_URL}/api/lessonHistory/saveUnitPlan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
    credentials: "include",
  });
  if (!res.ok) throw new Error(`saveUnitPlan failed: ${res.status}`);
  return res.json();
}

export async function saveLessonPlanToConvex(args: {
  teacherId: string;
  title: string;
  content: string;
  yearLevel?: string;
  subject?: string;
}) {
  const res = await fetch(`${CONVEX_URL}/api/lessonHistory/saveLessonPlan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
    credentials: "include",
  });
  if (!res.ok) throw new Error(`saveLessonPlan failed: ${res.status}`);
  return res.json();
}

export async function listLessonHistoryForTeacher(teacherId: string) {
  const res = await fetch(`${CONVEX_URL}/api/lessonHistory/listForTeacher`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teacherId }),
    credentials: "include",
  });
  if (!res.ok) throw new Error(`listLessonHistoryForTeacher failed: ${res.status}`);
  return res.json();
}
