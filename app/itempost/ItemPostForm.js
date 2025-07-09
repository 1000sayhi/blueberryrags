"use client";

import { useState } from "react";
import styles from "./itempost.module.css";
import { useRouter } from "next/navigation";
import { AiFillPicture } from "react-icons/ai";
import MeasurementInputs from "../components/measurementInputs";

export default function ItemPostForm() {
  const router = useRouter();
  const [previewUrls, setPreviewUrls] = useState([])
  const [measurements, setMeasurements] = useState({});
  const [formData, setFormData] = useState({
    brand: "",
    title: "",
    price: "",
    description: "",
    category: "",
    images: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, images: files }));

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.images || formData.images.length === 0) {
      alert("최소 한 장 이상의 이미지를 등록해야 합니다.");
      return;
    }

    const body = new FormData();
    body.append("brand", formData.brand);
    body.append("title", formData.title);
    body.append("price", formData.price);
    body.append("description", formData.description);
    body.append("category", formData.category);
    body.append("quantity", 1);
    body.append("measurements", JSON.stringify(measurements));

    formData.images.forEach((file, idx) => {
      body.append("images", file);
    });

    const res = await fetch("/api/itempost", {
      method: "POST",
      body,
    });

    if (res.ok) {
      router.push("/category/all");
      router.refresh();
    } else {
      alert("업로드 실패");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.gridWrapper}>
        <div className={styles.leftPanel}>
          사진 선택&nbsp;
          <label htmlFor="imageUpload" className={styles.uploadLabel}>
            <AiFillPicture />
          </label>
          <input
            id="imageUpload"
            name="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className={styles.hiddenInput}
          />
          <div className={styles.previewWrapper}>
            {previewUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`preview-${idx}`}
                className={styles.previewImage}
              />
            ))}
          </div>
        </div>

        <div className={styles.rightPanel}>
          <label>브랜드 명</label>
          <input
            className={styles.input}
            name="brand"
            type="text"
            onChange={handleChange}
          />
          <label>이름</label>
          <input
            className={styles.input}
            name="title"
            type="text"
            onChange={handleChange}
          />

          <label>가격 (원)</label>
          <input
            className={styles.input}
            name="price"
            type="text"
            onChange={handleChange}
          />

          <label>카테고리</label>
          <select
            className={styles.selectInput}
            name="category"
            onChange={handleChange}
            value={formData.category}
          >
            <option value="" disabled>
              카테고리 선택
            </option>
            <option value="top">top</option>
            <option value="bottom">bottom</option>
            <option value="shoes">shoes</option>
            <option value="etc">etc</option>
          </select>
          <MeasurementInputs
            category={formData.category}
            measurements={measurements}
            setMeasurements={setMeasurements}
          />
          <label>설명</label>
          <textarea
            className={styles.description}
            name="description"
            placeholder="description"
            onChange={handleChange}
          />
        </div>
      </div>
      <button className={styles.submitBtn} type="submit">
        제출
      </button>
    </form>
  );
}
