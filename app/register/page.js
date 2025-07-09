"use client";
import { useEffect, useState } from "react";
import styles from "./register.module.css";
import Script from "next/script";

export default function Register() {
  const [email, setEmail] = useState("");
  const [nickName, setNickName] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [idCheckMsg, setIdCheckMsg] = useState("");
  const [nickNameCheckMsg, setNickNameCheckMsg] = useState("");
  const [passwordCheckMsg, setPasswordCheckMsg] = useState("");
  const [idAvailable, setIdAvailable] = useState(false);
  const [phone, setPhone] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [codeCheckMsg, setCodeCheckMsg] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [agreeToMarketing, setAgreeToMarketing] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);
  

  const checkPasswordMatch = () => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

    if (!password || !passwordCheck) return;

    if (!passwordRegex.test(password)) {
      setPasswordCheckMsg("비밀번호는 8자리 이상이고, 영문자와 숫자를 포함해야 합니다.");
    }
    if (password === passwordCheck) {
      setPasswordCheckMsg("비밀번호가 일치합니다.");
    } else {
      setPasswordCheckMsg("비밀번호가 일치하지 않습니다.");
    }
  };

  const checkNickNameDuplicate = async (nickName) => {
    const nickNameRegex = /^[가-힣a-zA-Z0-9]+$/;
    if (nickName.length < 2) {
      setNickNameCheckMsg("닉네임은 최소 2자 이상이어야 합니다.");
      return;
    }
    if(!nickNameRegex.test(nickName)){
      setNickNameCheckMsg("닉네임에 한글/영문/숫자만 사용가능합니다.");
      return;
    }
    const res = await fetch("/api/auth/checkNickName", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickName }),
    });
    const data = await res.json();
    if (data.exists) {
      setNickNameCheckMsg("이미 사용 중인 닉네임입니다.");
    } else {
      setNickNameCheckMsg("사용 가능한 닉네임입니다.");
    }
  };

  const checkIdDuplicate = async () => {
    const idRegex = /^[a-zA-Z0-9]+$/;
    if (id.length < 5) {
      setIdCheckMsg("아이디는 최소 5자 이상이어야 합니다.");
      setIdAvailable(false);
      return;
    }
    if(!idRegex.test(id)){
      setIdCheckMsg("아이디에 영문자와 숫자만 사용가능합니다.");
      setIdAvailable(false);
      return;
    }
    
    const res = await fetch("/api/auth/checkDuplicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();
    if (data.exists) {
      setIdCheckMsg("이미 사용 중인 아이디입니다.");
      setIdAvailable(false);
    } else {
      setIdCheckMsg("사용 가능한 아이디입니다.");
      setIdAvailable(true);
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length <= 3) {
      value = value;
    } else if (value.length <= 7) {
      value = value.slice(0, 3) + "-" + value.slice(3);
    } else {
      value =
        value.slice(0, 3) + "-" + value.slice(3, 7) + "-" + value.slice(7, 11);
    }
    setPhone(value);
  };
  const handlePostcode = () => {
    if (!window.daum?.Postcode) {
      alert("주소 검색 기능을 아직 불러오는 중입니다.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: function (data) {
        setAddress(data.address);
      },
    }).open();
  };
  const sendVerificationCode = () => {
    //실험용 코드
    if (!phone) {
      alert("휴대폰 번호를 입력하세요.");
      return;
    }

    if (resendCooldown > 0) {
      alert(`${resendCooldown}초 후 다시 시도하세요.`);
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setSentCode(code);
    setVerificationCode("");
    setCodeCheckMsg("");
    alert(`인증번호 (테스트용): ${code}`);

    setResendCooldown(15);
  };

  // const sendVerificationCode = async () => {//나중에 실제 배포시 사용 코드
  //   const res = await fetch("/api/sendCode", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ phone }),
  //   });
  //   const data = await res.json();

  //   if (res.ok) {
  //     setSentCode(data.code); // 테스트용으로 받은 인증번호 저장
  //     alert("인증번호를 전송했습니다.");
  //   } else {
  //     alert(data.error || "인증번호 전송 실패");
  //   }
  // };
  const checkCodeMatch = () => {
    if (verificationCode === sentCode) {
      setCodeCheckMsg("✅ 인증번호가 확인되었습니다.");
      setIsPhoneVerified(true);
    } else {
      setCodeCheckMsg("❌ 인증번호가 일치하지 않습니다.");
      setIsPhoneVerified(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const idRegex = /^[a-zA-Z0-9]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    const nickNameRegex = /^[가-힣a-zA-Z0-9]+$/;

  if (id.length < 5 || !idRegex.test(id)) {
    alert("아이디는 5자 이상이며, 영문자와 숫자만 사용 가능합니다.");
    return;
  }

  if (!idAvailable) {
    alert("아이디 중복 확인을 해주세요.");
    return;
  }

  if (nickName.length < 2 || !nickNameRegex.test(nickName)) {
    alert("닉네임은 2자 이상이며, 한글/영문/숫자만 사용 가능합니다.");
    return;
  }

  if (!nickNameCheckMsg.includes("사용 가능한")) {
    alert("닉네임 중복 확인 결과를 확인해주세요.");
    return;
  }

  if (!passwordRegex.test(password)) {
    alert("비밀번호는 8자 이상이며, 영문자와 숫자를 포함해야 합니다.");
    return;
  }

  if (password !== passwordCheck) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  if (!isPhoneVerified) {
    alert("휴대폰 인증을 완료해주세요.");
    return;
  }

  if (!email.trim()) {
    alert("이메일을 입력해주세요.");
    return;
  }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        password,
        nickName,
        email,
        phone,
        address,
        detailAddress,
        agreeToMarketing,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("회원가입 완료! 로그인 페이지로 이동합니다.");
      window.location.href = "/login";
    } else {
      alert(data.error || "회원가입 실패");
    }
  };

  return (
    <>
      <Script
        src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
      />
      <div className={styles.formContainer}>
        <div className={styles.title}>
          <h3>Register</h3>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            아이디 <span className={styles.required}>*</span>
            <span className={styles.formRule}>5자리 이상 / 특수문자 금지</span>
          </label>
          
          <div className={styles.inputContainer}>
            <input
              className={styles.input}
              name="id"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
            <button
              type="button"
              onClick={checkIdDuplicate}
              className={styles.checkBtn}
            >
              중복 확인
            </button>
          </div>
          <div className={styles.checkMsg}>{idCheckMsg}</div>
          <label className={styles.label}>
            닉네임 <span className={styles.required}>*</span>
            <span className={styles.formRule}>2글자 이상 / 특수문자 금지</span>
          </label>
          <div className={styles.inputContainer}>
            <input
              className={styles.input}
              name="nickname"
              type="text"
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
              onBlur={() => checkNickNameDuplicate(nickName)}
            />
          </div>
          <div className={styles.checkMsg}>{nickNameCheckMsg}</div>
          <label className={styles.label}>
            비밀번호 
            <span className={styles.required}>*</span>
            <span className={styles.formRule}>8자리 이상</span>
          </label>
          <input
            className={styles.input}
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label className={styles.label}>
            비밀번호 확인 <span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            name="passwordCheck"
            type="password"
            value={passwordCheck}
            onChange={(e) => setPasswordCheck(e.target.value)}
            onBlur={checkPasswordMatch}
          />
          <div className={styles.checkMsg}>{passwordCheckMsg}</div>
          <label className={styles.label}>
            이메일 <span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className={styles.label}>
            휴대폰 번호 <span className={styles.required}>*</span>
          </label>
          <div className={styles.inputContainer}>
            <input
              className={styles.input}
              type="text"
              placeholder="  000-0000-0000"
              value={phone}
              onChange={handlePhoneChange}
            />
            <button
              type="button"
              onClick={sendVerificationCode}
              className={styles.checkBtn}
              disabled={resendCooldown > 0}
            >
              {resendCooldown > 0 ? `${resendCooldown}초 후 재전송` : '인증번호 전송'}
            </button>

          </div>
          <label className={styles.label}>
            인증번호 확인<span className={styles.required}>*</span>
          </label>
          <div className={styles.inputContainer}>
            <input
              className={styles.input}
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <button
              type="button"
              className={styles.checkBtn}
              onClick={checkCodeMatch}
            >
              인증번호 확인
            </button>
          </div>
          <div className={styles.checkMsg}>{codeCheckMsg}</div>

          <label className={styles.label}>주소 입력 (option)</label>
          <div className={styles.inputContainer}>
            <input
              type="text"
              className={styles.input}
              value={address}
              readOnly
            />
            <button
              type="button"
              onClick={handlePostcode}
              className={styles.checkBtn}
            >
              주소 검색
            </button>
          </div>
          <input
            className={styles.input}
            type="text"
            placeholder="상세 주소 입력 ex) 동, 호수"
            value={detailAddress}
            onChange={(e) => setDetailAddress(e.target.value)}
          />
          <div className={styles.checkboxRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={agreeToMarketing}
                onChange={(e) => setAgreeToMarketing(e.target.checked)}
              />
              이메일을 통한 마케팅 정보 수신에 동의합니다. (option)
            </label>
          </div>

          <button className={styles.registerBtn} type="submit">
            회원가입
          </button>
        </form>
      </div>
    </>
  );
}
