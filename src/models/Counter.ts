import { Schema, model, models, type Model } from "mongoose";

/** Atomic sequence generator (used for order references). */
interface ICounter {
  key: string;
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, required: true, default: 0 },
});

export const Counter: Model<ICounter> = models.Counter || model<ICounter>("Counter", counterSchema);

export async function nextSequence(key: string): Promise<number> {
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  return doc!.seq;
}
