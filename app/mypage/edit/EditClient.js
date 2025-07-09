"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./edit.module.css";
import Script from "next/script";

export default function EditClient({session}) {
  const [formData, setFormData] = useState({
    id: "",
    email: "",
    nickName: "",
    address: "",
    detailAddress: "",
    agreeToMarketing: false,
  });
  const [resultMsg, setResultMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (session) {
        const _id = session.user.id;
        const id = session.user.name;
        setFormData((prev) => ({ ...prev, id }));

        const res = await fetch(`/api/getUserInfo?id=${_id}`);
        const data = await res.json();

        if (res.ok) {
          setFormData((prev) => ({
            ...prev,
            email: data.email,
            nickName: data.nickName,
            address: data.address || "",
            detailAddress: data.detailAddress || "",
            agreeToMarketing: data.agreeToMarketing || false,
          }));
        } else {
          console.error("❌ 사용자 정보 조회 실패:", data.error);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePostcode = () => {
    if (!window.daum?.Postcode) {
      alert("주소 검색 기능을 아직 불러오는 중입니다.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: function (data) {
        setFormData((prev) => ({
          ...prev,
          address: data.address,
        }));
      },
    }).open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/updateProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (res.ok) {
        setResultMsg("✅ 개인정보가 성공적으로 변경되었습니다.");
        setTimeout(() => router.push("/mypage"), 1500);
        router.refresh();
      } else {
        setResultMsg(`❌ ${result.error || "변경 실패"}`);
      }
    } catch (err) {
      setResultMsg("❌ 네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
      />
      <div className={styles.container}>
        <h2 className={styles.title}>개인정보 수정</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            아이디
            <input
              name="id"
              type="text"
              value={formData.id}
              disabled
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            이메일
            <input
              name="email"
              type="email"
              value={formData.email}
              disabled
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            닉네임
            <input
              name="nickName"
              type="text"
              value={formData.nickName}
              onChange={handleChange}
              className={styles.input}
            />
          </label>
          <label className={styles.label}>주소 입력</label>
          <div className={styles.inputContainer}>
            <input
              type="text"
              name="address"
              className={styles.input}
              value={formData.address}
              readOnly
            />
            <button
              type="button"
              onClick={handlePostcode}
              className={styles.addressSearchBtn}
            >
              주소 검색
            </button>
          </div>
          <input
            className={styles.input}
            name="detailAddress"
            type="text"
            placeholder="상세 주소 입력 ex) 동, 호수"
            value={formData.detailAddress}
            onChange={handleChange}
          />
          <div className={styles.checkboxRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="agreeToMarketing"
                checked={formData.agreeToMarketing}
                onChange={handleChange}
              />
              이메일을 통한 마케팅 정보 수신에 동의합니다. (option)
            </label>
          </div>
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "처리 중..." : "완료"}
          </button>
        </form>
        {resultMsg && <p className={styles.message}>{resultMsg}</p>}
      </div>
    </>
  );
}
