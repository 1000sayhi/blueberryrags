import { connectDB } from "@/util/database";
import formidable from "formidable";
import fs from "fs";
import path from "path";

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
    if (err) {
      return res.status(500).json({ error: "form parsing error" });
    }

    const { brand, title, price, description, quantity, category } = fields;

    const measurements = JSON.parse(fields.measurements || "{}");
    const imageFiles = Array.isArray(files.images)
      ? files.images
      : [files.images];
    const imageUrls = imageFiles.map(
      (file) => `/uploads/${path.basename(file.filepath)}`
    );

    const db = (await connectDB).db("blueberryrags");
    await db.collection("item").insertOne({
      brand,
      title,
      price,
      description,
      category,
      quantity,
      imageUrls,
      measurements,
      isSold: false,
      createdAt: new Date(),
    });

    return res.status(200).json({ message: "업로드 성공", imageUrls });
  });
}
