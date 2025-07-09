import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.query;
  const db = (await connectDB).db('blueberryrags');
  const user = await db
  .collection("users")
  .findOne({ _id: new ObjectId(session.user.id) });
  console.log(user)
  const exist = user?.cart?.some((item) => item.productId.toString() === id);

  res.status(200).json({ exist });
}
