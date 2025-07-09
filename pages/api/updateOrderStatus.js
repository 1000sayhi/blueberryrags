import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  console.log('hi - API 호출됨');

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // 관리자만 상태 변경 가능
  if (session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // 허용된 상태값들
  const allowedStatuses = ['completed', 'preparing', 'shipping', 'delivered'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const db = (await connectDB).db("blueberryrags");

    const order = await db.collection("orders").findOne({ orderId });

    // 상품 정보 조회
    const productIds = order.items.map(id => typeof id === 'string' ? new ObjectId(id) : id);
    const products = await db.collection('products').find({ _id: { $in: productIds } }).toArray();

    // 상태가 '상품 준비중'으로 바뀌는 경우에만 메일 발송
    console.log('order:', order, 'order.status:', order?.status, 'newStatus:', status);
    if (order && order.status !== 'preparing' && status === 'preparing') {
      console.log('메일 발송 시도!');
      // 1. 구매자 이메일 조회
      const user = await db.collection('users').findOne({ _id: new ObjectId(order.userId) });
      const email = user?.email;

      if (email) {
        // 2. nodemailer로 메일 발송
        const transporter = nodemailer.createTransport({
          service: 'gmail', // 또는 SMTP 정보
          auth: {
            user: process.env.EMAIL_USER, // 환경변수로 관리
            pass: process.env.EMAIL_PASS,
          },
        });

        const productHtml = products.map(product => `
          <div style="margin-bottom:20px; border-bottom:1px solid #eee; padding-bottom:10px;">
            <img src="https://your-domain.com${product.imageUrls?.[0] || '/images/default-product.jpg'}" alt="${product.title}" style="width:120px; border-radius:8px; margin-bottom:8px;" />
            <div style="font-size:16px; font-weight:bold;">${product.title}</div>
            <div style="color:#888;">가격: ${Number(product.price).toLocaleString()}원</div>
          </div>
        `).join('');

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: '구매 확정 및 상품 준비중 안내',
          html: `
            <div style="font-family: 'Apple SD Gothic Neo', Arial, sans-serif; background:#f9f9f9; padding:32px;">
              <div style="background:#fff; border-radius:12px; max-width:480px; margin:auto; box-shadow:0 2px 8px #eee; padding:32px;">
                <h2 style="color:#4a90e2;">구매가 확정되었습니다!</h2>
                <p>주문번호: <b style="color:#333;">${orderId}</b></p>
                <p>고객님의 주문이 결제 완료되어 <b>상품 준비중</b>입니다.<br/>
                곧 배송을 시작할 예정이니 조금만 기다려주세요.<br/>
                감사합니다!</p>
                <hr style="margin:24px 0;"/>
                <h3 style="color:#222;">주문 상품</h3>
                ${productHtml}
                <hr style="margin:24px 0;"/>
                <div style="font-size:13px; color:#888;">
                  문의사항이 있으시면 언제든 고객센터로 연락주세요.<br/>
                  <a href="https://your-domain.com" style="color:#4a90e2;">블루베리 랙스</a>
                </div>
              </div>
            </div>
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log('메일 발송 성공:', email);
        } catch (err) {
          console.error('메일 발송 에러:', err);
        }
      }
    }

    const result = await db.collection("orders").updateOne(
      { orderId },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Order status updated successfully' 
    });
  } catch (err) {
    console.error('주문 상태 업데이트 오류:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
} 