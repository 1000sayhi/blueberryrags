"use client";

import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { signIn } from "next-auth/react";
import { useState } from "react";
import ErrorModal from "./ErrorModal";

export default function LoginClient() {
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const id = formData.get("id");
    const password = formData.get("password");

    const result = await signIn("credentials", {
      id,
      password,
      redirect: false,
    });

    if (result.ok) {
      router.push("/");
      router.refresh();
    } else {
      setErrorMessage(result.error || "로그인 실패");
      setIsErrorModalOpen(true);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.title}>
        <h3>Login</h3>
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          name="id"
          type="text"
          placeholder="아이디"
        />
        <input
          className={styles.input}
          name="password"
          type="password"
          placeholder="비밀번호"
        />
        <button className={styles.loginBtn} type="submit">
          로그인
        </button>
      </form>
      <div
        onClick={() => {
          router.push("/register");
        }}
        className={styles.registerBtn}
      >
        Register
      </div>
      <button
        className={styles.oAuthLoginBtn}
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        구글 로그인
      </button>
      <button className={styles.oAuthLoginBtn}>카카오 로그인</button>
      {isErrorModalOpen && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setIsErrorModalOpen(false)}
        />
      )}
    </div>
  );
}
