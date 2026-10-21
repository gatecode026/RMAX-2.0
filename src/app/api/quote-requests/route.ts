import { connectDB, isDatabaseUnavailable } from "@/lib/mongodb";
import { QuoteRequest } from "@/models/QuoteRequest";
import { fail, limited, ok, readJson, zodFail, route } from "@/lib/api";
import { quoteRequestSchema } from "@/lib/validations/schemas";

export const POST = route(async (req: Request) => {
  const rl = limited(req, "quote", 5, 60 * 60_000);
  if (rl) return rl;
  const parsedBody = await readJson(req);
  if ("response" in parsedBody) return parsedBody.response;
  const parsed = quoteRequestSchema.safeParse(parsedBody.body);
  if (!parsed.success) return zodFail(parsed.error);

  try {
    await connectDB();
    const doc = await QuoteRequest.create(parsed.data);
    return ok({ id: String(doc._id) }, 201);
  } catch (err) {
    if (isDatabaseUnavailable(err)) throw err;
    return fail("We could not save your request. Please try again.", 500);
  }
});
