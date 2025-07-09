import { connectDB } from '@/util/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const db = (await connectDB).db('blueberryrags');
  const category = req.query.category;
  const page = parseInt(req.query.page || "1", 10);
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  let filter = {};
  if (category) {
    filter = { category };
  }

  console.log(`this is item page ${page}`)
  const items = await db.collection('item').find(filter).sort({ createdAt: -1 }).skip(skip)
  .limit(pageSize).toArray();

  res.status(200).json(items);
}
