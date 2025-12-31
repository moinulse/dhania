import { createAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request: Request) {
    const auth = createAuth();
    return auth.handler(request);
}

export async function POST(request: Request) {
    const auth = createAuth();
    return auth.handler(request);
}
