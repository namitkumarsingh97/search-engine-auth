import { redirect } from "next/navigation";

// The accounts app has no home page: send anyone who lands on / to the sign-in form, keeping the query.
export default function Home({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") query.set(key, value);
  }
  redirect(`/login${query.toString() ? `?${query.toString()}` : ""}`);
}
