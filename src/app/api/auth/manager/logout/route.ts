import { route } from "@/lib/api";
import { logoutHandler } from "@/lib/auth/api-helpers";

export const POST = route(async () => logoutHandler("manager"));
