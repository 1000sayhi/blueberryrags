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

  // 관리자 권한 확인
  if (session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const db = (await connectDB).db("blueberryrags");

    // 모든 주문을 가져오기 (최신순)
    const orders = await db.collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // 각 주문의 상품 정보와 사용자 정보도 함께 가져오기
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        // 기존 주문에 status가 없으면 'completed'로 설정
        if (!order.status) {
          order.status = 'completed';
        }

        let items = [];
        if (order.items && order.items.length > 0) {
          const itemIds = order.items.map(id => new ObjectId(id));
          items = await db.collection("item")
            .find({ _id: { $in: itemIds } })
            .toArray();
        }

        // 사용자 정보 가져오기
        let userName = '알 수 없음';
        if (order.userId) {
          const user = await db.collection("users").findOne({ _id: order.userId });
          if (user) {
            userName = user.name || user.nickName || '알 수 없음';
          }
        }
        
        return {
          ...order,
          items: items,
          userName: userName
        };
      })
    );

    return res.status(200).json({ 
      success: true, 
      orders: ordersWithDetails 
    });
  } catch (err) {
    console.error('전체 주문 목록 조회 오류:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
} 