"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import styles from "./editPassword.module.css";

export default function EditPasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [resultMsg, setResultMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const session = await getSession();
      if(session.user.provider == "google"){
        router.replace("/mypage");
      }
      if (!session) {
        router.replace("/login");
      }
    };
    check();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setResultMsg("모든 비밀번호 항목을 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResultMsg("❌ 새 비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    setResultMsg("");

    try {
      const session = await getSession();
      const res = await fetch("/api/updatePassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: session.user.id,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResultMsg("✅ 비밀번호가 성공적으로 변경되었습니다.");
        setTimeout(() => router.push("/mypage"), 1500);
      } else {
        setResultMsg(`❌ ${data.error || "변경 실패"}`);
      }
    } catch (err) {
      setResultMsg("❌ 네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>비밀번호 변경</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>현재 비밀번호</label>
        <input
          className={styles.input}
          name="currentPassword"
          type="password"
          value={formData.currentPassword}
          onChange={handleChange}
        />

        <label className={styles.label}>새 비밀번호</label>
        <input
          className={styles.input}
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={handleChange}
        />

        <label className={styles.label}>새 비밀번호 확인</label>
        <input
          className={styles.input}
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "변경 중..." : "비밀번호 변경"}
        </button>
      </form>
      {resultMsg && <p className={styles.message}>{resultMsg}</p>}
    </div>
  );
}
