"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import styles from "./edit.module.css";
import { AiFillPicture } from "react-icons/ai";
import MeasurementInputs from "@/app/components/measurementInputs";

export default function EditItemPage() {
  const { id } = useParams();
  const router = useRouter();
  const [previewUrls, setPreviewUrls] = useState([]);
  const [measurements, setMeasurements] = useState({});
  const [formData, setFormData] = useState({
    brand: "",
    title: "",
    price: "",
    description: "",
    category: "",
    images: [],
    isSold: false,
  });
  useEffect(() => {
    const checkAdmin = async () => {
      const session = await getSession();
      if (!session || session.user.role !== 'admin') {
        router.back();
      }
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    const fetchItem = async () => {
      const res = await fetch(`/api/itemdetail?id=${id}`);
      const data = await res.json();
      setFormData({
        brand: data.brand || "",
        title: data.title || "",
        price: data.price || "",
        description: data.description || "",
        category: data.category || "",
        isSold: data.isSold || false,
        images: [],
      });
      setMeasurements(data.measurements || {});
      setPreviewUrls(data.imageUrls || []);
    };

    if (id) fetchItem();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, images: files }));

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = new FormData();
    body.append("id", id);
    body.append("brand", formData.brand);
    body.append("title", formData.title);
    body.append("price", formData.price);
    body.append("description", formData.description);
    body.append("category", formData.category);
    body.append("measurements", JSON.stringify(measurements));
    body.append("isSold", formData.isSold);


    formData.images.forEach((file) => {
      body.append("images", file);
    });

    const res = await fetch("/api/itemupdate", {
      method: "POST",
      body,
    });

    if (res.ok) {
      router.push(`/products/${id}`);
    } else {
      alert("수정 실패");
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.title}>아이템 수정</h3>
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
              value={formData.brand}
              onChange={handleChange}
            />
            <label>이름</label>
            <input
              className={styles.input}
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
            />
            <label>가격 (원)</label>
            <input
              className={styles.input}
              name="price"
              type="text"
              value={formData.price}
              onChange={handleChange}
            />
            <label>카테고리</label>
            <select
              className={styles.selectInput}
              name="category"
              value={formData.category}
              onChange={handleChange}
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
              value={formData.description}
              onChange={handleChange}
            />
            <div className={styles.checkboxRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isSold"
                checked={formData.isSold}
                onChange={handleChange}
              />
              isSold
            </label>
          </div>
          </div>
        </div>
        <button className={styles.submitBtn} type="submit">
          제출
        </button>
      </form>
    </div>
  );
}
