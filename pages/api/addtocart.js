import { connectDB } from '@/util/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { id } = req.query;
  const session = await getServerSession(req, res, authOptions);
  const userId = session.user.id;
  
  if (!session) {
    return res.status(401).json({ error: "로그인이 필요합니다." });
  }

  try {
    const db = (await connectDB).db('blueberryrags');
    const item = await db.collection('item').findOne({ _id: new ObjectId(id) });

    // 상품이 존재하지 않는 경우
    if (!item) {
      return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
    }

    // 이미 판매된 상품인 경우
    if (item.isSold) {
      return res.status(400).json({ error: "이미 판매된 상품입니다." });
    }

    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $push: { cart: { productId: item._id } } }
    );

    res.status(200).json({ message: 'CART IN' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '다시 시도하시오' });
  }
}
