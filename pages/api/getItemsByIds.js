import { connectDB } from '@/util/database';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { ids } = req.body;
    const db = (await connectDB).db('blueberryrags');
    const objectIds = ids.map(id => new ObjectId(id));
    const items = await db.collection('item').find({ _id: { $in: objectIds } }).toArray();
    return res.status(200).json({ items });
  } catch (err) {
    console.error('API ERROR:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
