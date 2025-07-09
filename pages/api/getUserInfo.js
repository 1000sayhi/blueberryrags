import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing id" });

  try {
    const db = (await connectDB).db("blueberryrags");
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) });

    if (!user) return res.status(404).json({ error: "User not found" });

    return res.status(200).json({
      email: user.email || "",
      nickName: user.nickName || "",
      point: user.point || 0,
      coupon: user.coupon || [],
      phone: user.phone || "",
      address: user.address || "",
      detailAddress: user.detailAddress || "",
      agreeToMarketing: user.agreeToMarketing || false,
    });
  } catch (err) {
    return res.status(500).json({ error: "Database error" });
  }
}
