import { createAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request: Request) {
    const { env } = getCloudflareContext();
    const auth = createAuth(env.DB);
    return auth.handler(request);
}

export async function POST(request: Request) {
    const { env } = getCloudflareContext();
    const auth = createAuth(env.DB);
    return auth.handler(request);
}
