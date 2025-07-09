import { connectDB } from "@/util/database";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { nickName } = req.body;

  const db = (await connectDB).db("blueberryrags");
  const exists = await db.collection("users").findOne({ nickName });

  return res.status(200).json({ exists: !!exists });
}
