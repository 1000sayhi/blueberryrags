import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const db = (await connectDB).db("blueberryrags");
    const userId = new ObjectId(session.user.id);

    // 사용자의 모든 주문을 가져오기 (최신순)
    const orders = await db.collection("orders")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    // 각 주문의 상품 정보도 함께 가져오기
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        // 기존 주문에 status가 없으면 'completed'로 설정
        if (!order.status) {
          order.status = 'completed';
        }
        
        if (order.items && order.items.length > 0) {
          const itemIds = order.items.map(id => new ObjectId(id));
          const items = await db.collection("item")
            .find({ _id: { $in: itemIds } })
            .toArray();
          
          return {
            ...order,
            items: items
          };
        }
        return order;
      })
    );

    return res.status(200).json({ 
      success: true, 
      orders: ordersWithItems 
    });
  } catch (err) {
    console.error('주문 내역 조회 오류:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
} 