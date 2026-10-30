import { route } from "@/lib/api";
import { sessionStatusHandler } from "@/lib/auth/api-helpers";

export const GET = route(async () => sessionStatusHandler("customer"));
