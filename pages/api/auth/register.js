import { connectDB } from "@/util/database";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    id,
    password,
    nickName,
    email,
    phone,
    address,
    detailAddress,
    agreeToMarketing,
  } = req.body;

  if (!id || !password || !nickName || !email) {
    return res.status(400).json({ error: "모든 필드를 입력해주세요." });
  }

  try {
    const db = (await connectDB).db("blueberryrags");

    const existing = await db.collection("users").findOne({ id });
    if (existing) {
      return res.status(409).json({ error: "이미 존재하는 아이디입니다." });
    }

    const hash = await bcrypt.hash(password, 10);
    await db.collection("users").insertOne({
      id,
      password: hash,
      nickName,
      email,
      phone,
      point: 0,
      address,
      detailAddress,
      agreeToMarketing,
      coupon: [{ id: "c1", title: "신규 가입 쿠폰", value: 5000 }],
      role: "user",
      purchaseHistory:[],
      createdAt: new Date(),
    });

    return res.status(200).json({ message: "가입 성공" });
  } catch (err) {
    return res.status(500).json({ error: "서버 에러" });
  }
}
