import { connectDB } from "@/util/database";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { id, currentPassword, newPassword } = req.body;

  if (!id || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "모든 정보를 입력해주세요." });
  }

  try {
    const db = (await connectDB).db("blueberryrags");
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) });

    if (!user)
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "현재 비밀번호가 일치하지 않습니다." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(id) }, { $set: { password: hashed } });

    return res.status(200).json({ message: "비밀번호 변경 완료" });
  } catch (err) {
    return res.status(500).json({ error: "서버 에러" });
  }
}
