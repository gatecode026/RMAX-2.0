import { route } from "@/lib/api";
import { refreshRejectedHandler } from "@/lib/auth/api-helpers";

export const POST = route(async () => refreshRejectedHandler("customer"));
