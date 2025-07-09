"use client";

import { useEffect } from "react";
import CartItems from "../components/cartItems";
import styles from "./cart.module.css";

export default function CartClient({ cartItem }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>CART</h2>
      {cartItem.length === 0 ? (
        <div>카트에 담긴 상품이 존재하지 않습니다.</div>
      ) : (
        <CartItems cartItem={cartItem} />
      )}
    </div>
  );
}
