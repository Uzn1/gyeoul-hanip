import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";
import { handleCommunity } from "../../../lib/api.mjs";

export const dynamic = "force-dynamic";

async function handle(request: Request) {
  const user = await getChatGPTUser();
  const config = env as Cloudflare.Env & { ADMIN_EMAILS?: string };
  const adminEmails = config.ADMIN_EMAILS?.split(",").map(email => email.trim().toLowerCase()) ?? [];
  const admin = !!user && (adminEmails.includes(user.email.toLowerCase()) ||
    (import.meta.env.DEV && user.email === "seedy@sites.test"));
  return handleCommunity(request, env.DB, user ? { id: user.userId, admin } : null);
}

export const GET = handle;
export const POST = handle;
