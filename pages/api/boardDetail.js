import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";

export default async function handler(req,res){
  const { id } = req.query;

  try {
    const db = (await connectDB).db('blueberryrags');
    const item = await db.collection('boardpost').findOne({ _id: new ObjectId(id) });

    if (!item) return res.status(404).json({ error: 'Item not found' });

    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Invalid ID or DB error' });
  }
}