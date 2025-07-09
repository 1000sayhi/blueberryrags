import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  try {
    console.log("✅ orderSuccess API 호출됨");

    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      console.log("❌ 세션 없음");
      return res.status(401).json({ success: false, message: "세션이 없습니다." });
    }

    const { items, amount } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "상품 정보가 올바르지 않습니다." });
    }

    const db = (await connectDB).db("blueberryrags");
    const userId = new ObjectId(session.user.id);
    const itemObjectIds = items.map(id => new ObjectId(id));

    // ✅ items 배열이 정확히 같은지 (길이 + 값)
    const pendingOrder = await db.collection("pending_orders").findOne({
      userId,
      $and: [
        { items: { $size: itemObjectIds.length } },
        { items: { $all: itemObjectIds } }
      ]
    });

    if (!pendingOrder) {
      console.log("❌ 일치하는 pendingOrder 없음");
      return res.status(400).json({ success: false, message: '결제 대기 중인 주문을 찾을 수 없습니다.' });
    }

    if (pendingOrder.totalAmount !== Number(amount)) {
      console.log("❌ 금액 불일치");
      return res.status(400).json({ success: false, message: '주문 금액이 일치하지 않습니다.' });
    }

    const order = {
      ...pendingOrder,
      status: "completed",
      completedAt: new Date(),
    };

    await db.collection("orders").insertOne(order);
    await db.collection("pending_orders").deleteOne({ _id: pendingOrder._id });

    await db.collection("item").updateMany(
      { _id: { $in: itemObjectIds } },
      { $set: { isSold: true } }
    );

    await db.collection("users").updateOne(
      { _id: userId },
      { $inc: { point: -order.usedPoint } }
    );

    if (order.usedCouponId) {
      await db.collection("users").updateOne(
        { _id: userId },
        { $pull: { coupon: { id: order.usedCouponId } } }
      );
    }

    await db.collection("users").updateOne(
      { _id: userId },
      { $pull: { cart: { productId: { $in: itemObjectIds } } } }
    );

    console.log("✅ 결제 완료");

    return res.status(200).json({
      success: true,
      order: {
        totalAmount: order.totalAmount,
        items: order.items,
        completedAt: order.completedAt.toISOString(),
      },
    });

  } catch (err) {
    console.error("❌ 서버 오류:", err);
    return res.status(500).json({ success: false, message: "서버 오류 발생" });
  }
}
