import { connectDB } from "@/util/database";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { ObjectId } from "mongodb";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const form = new formidable.IncomingForm({
    uploadDir: path.join(process.cwd(), "/public/uploads"),
    keepExtensions: true,
    multiples: true,
  });

  fs.mkdirSync(form.uploadDir, { recursive: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "폼 파싱 실패" });

    try {
      const db = (await connectDB).db("blueberryrags");

      const {
        id,
        brand,
        title,
        price,
        description,
        category,
      } = fields;

      if (!id) return res.status(400).json({ error: "id가 없습니다." });

      let measurements = {};
      try {
        measurements = JSON.parse(fields.measurements || "{}");
      } catch (e) {
        return res.status(400).json({ error: "measurements 파싱 실패" });
      }



      let imageUrls = [];
      if (files.images) {
        const imageFiles = Array.isArray(files.images)
          ? files.images
          : [files.images];

        imageUrls = imageFiles.map((file) => `/uploads/${path.basename(file.filepath)}`);
      }

      const isSold = fields.isSold === "true";

      const updateFields = {
        brand,
        title,
        price,
        description,
        category,
        measurements,
        isSold,
        updatedAt: new Date(),
      };


      if (imageUrls.length > 0) {
        updateFields.imageUrls = imageUrls;
      }

      const result = await db.collection("item").updateOne(
        { _id: new ObjectId(id) },
        { $set: updateFields }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "상품을 찾을 수 없습니다." });
      }

      return res.status(200).json({ message: "수정 완료" });
    } catch (err) {
      console.error("업데이트 에러:", err);
      return res.status(500).json({ error: "서버 오류" });
    }
  });
}
