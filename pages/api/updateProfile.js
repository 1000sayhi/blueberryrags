import { connectDB } from "@/util/database";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    id,
    nickName,
    address,
    detailAddress,
    agreeToMarketing,
  } = req.body;

  if (!id || !nickName) {
    return res.status(400).json({ error: "아이디와 닉네임은 필수입니다." });
  }

  try {
    const db = (await connectDB).db("blueberryrags");

    const result = await db.collection("users").updateOne(
      { id },
      {
        $set: {
          nickName,
          address: address || "",
          detailAddress: detailAddress || "",
          agreeToMarketing: agreeToMarketing ?? false,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    return res.status(200).json({ message: "업데이트 완료" });
  } catch (err) {
    console.error("❌ 업데이트 중 오류:", err);
    return res.status(500).json({ error: "서버 오류" });
  }
}
