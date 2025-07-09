import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const itemId = req.query.id;

  try {
    const db = (await connectDB).db("blueberryrags");
    await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      { $pull: { cart: { productId: new ObjectId(itemId) } } }
    );

    return res.status(200).json({ message: "삭제 완료" });
  } catch (err) {
    console.error("삭제 실패:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
}
