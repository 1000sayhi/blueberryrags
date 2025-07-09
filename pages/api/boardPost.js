import { connectDB } from "@/util/database";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: '입력값이 부족합니다.' });
  }

  try {
    const db = (await connectDB).db('blueberryrags');
    await db.collection('boardpost').insertOne({ title, content, createdAt: new Date() });

    return res.status(200).json({ message: '게시글 등록 완료' });
  } catch (err) {
    console.error('DB 저장 실패:', err);
    return res.status(500).json({ message: '서버 오류' });
  }
}
