import { connectDB } from "@/util/database";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const db = (await connectDB).db("blueberryrags");
  const { id } = req.body;
  const existingUser = await db.collection("users").findOne({ id });

  return res.status(200).json({ exists: !!existingUser });
}
