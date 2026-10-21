import { connectDB } from "@/lib/mongodb";
import { ContactMessage } from "@/models/ContactMessage";
import { limited, ok, readJson, route, zodFail } from "@/lib/api";
import { contactSchema } from "@/lib/validations/schemas";

export const POST = route(async (req: Request) => {
  const rl = limited(req, "contact", 5, 60 * 60_000);
  if (rl) return rl;
  const parsedBody = await readJson(req);
  if ("response" in parsedBody) return parsedBody.response;
  const parsed = contactSchema.safeParse(parsedBody.body);
  if (!parsed.success) return zodFail(parsed.error);

  await connectDB();
  const doc = await ContactMessage.create(parsed.data);
  return ok({ id: String(doc._id) }, 201);
});
