"use client";

import { useState } from "react";
import styles from "./couponToggle.module.css";

export default function CouponToggle({ couponList }) {
  const [showCoupons, setShowCoupons] = useState(false);

  return (
    <div>
      <h3 className={styles.toggleHeader}>
        쿠폰
        <span
          onClick={() => setShowCoupons((prev) => !prev)}
          className={`${styles.arrow} ${showCoupons ? styles.down : ""}`}
        >
          ▶
        </span>
      </h3>
      {showCoupons && (
        <ul className={styles.couponList}>
          {couponList?.length > 0 ? (
            couponList.map((coupon, i) => (
              <li key={i}>
                {coupon.title} {coupon.value}
              </li>
            ))
          ) : (
            <li>보유한 쿠폰이 없습니다.</li>
          )}
        </ul>
      )}
    </div>
  );
}
