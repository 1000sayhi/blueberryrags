import { connectDB } from "@/util/database";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ success: false });

  const {
    itemIds,
    usedPoint,
    usedCouponId,
    address,
    detailAddress,
    phone,
    totalAmount,
    orderId,
  } = req.body;

  const userId = new ObjectId(session.user.id);
  const itemObjectIds = itemIds.map(id => new ObjectId(id));
  const now = new Date();

  const db = (await connectDB).db("blueberryrags");

  await db.collection("pending_orders").updateOne(
    {
      userId,
      // 같은 item 집합인지 확인: items 배열 크기와 포함 항목이 동일해야 매치
      $and: [
        { items: { $size: itemObjectIds.length } },
        { items: { $all: itemObjectIds } }
      ]
    },
    {
      $set: {
        usedPoint,
        usedCouponId,
        address,
        detailAddress,
        phone,
        totalAmount,
        updatedAt: now,
      },
      $setOnInsert: {
        userId,
        items: itemObjectIds,
        createdAt: now,
        orderId,
      }
    },
    { upsert: true }
  );

  return res.status(200).json({ success: true });
}
