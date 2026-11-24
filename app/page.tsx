import { redirect } from "next/navigation";

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { place } = await searchParams;
  redirect(typeof place === "string" && /^\d+$/.test(place) ? `/map.html?place=${place}` : "/map.html");
}
