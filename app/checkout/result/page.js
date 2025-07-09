'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./checkoutResult.module.css";

export default function CheckOutResult() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState("처리 중입니다...");
  const [order, setOrder] = useState(null);
  const [itemsInfo, setItemsInfo] = useState([]);

  useEffect(() => {
  const amount = searchParams.get("amount");

  // 세션 스토리지에서 itemIds 꺼냄
  const stored = sessionStorage.getItem("itemIds");
  const items = stored ? JSON.parse(stored) : null;

  if (!items || !amount) {
    setStatus("주문 정보가 올바르지 않습니다.");
    return;
  }

  async function finalizeOrder() {
    try {
      const res = await fetch("/api/orderSuccess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, amount }),
      });
      const data = await res.json();

      if (data.success) {
        setOrder(data.order);
        setStatus("결제가 완료되었습니다. 감사합니다!");
      } else {
        setStatus(data.message || "처리 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error(err);
      setStatus("네트워크 오류가 발생했습니다.");
    }
  }

  finalizeOrder();
}, [searchParams]);


  useEffect(() => {
    if (order && order.items && order.items.length > 0) {
      fetch("/api/getItemsByIds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: order.items }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.items) {
            setItemsInfo(data.items);
          }
        })
        .catch(err => {
          console.error("상품 정보 불러오기 실패:", err);
        });
    }
  }, [order]);

  return (
    <div className={styles.container}>
      <h2 className={styles.status}>{status}</h2>

      {order && (
        <div className={styles.orderDetails}>
          <p className={styles.totalAmount}>
            총 결제 금액: {order.totalAmount ? order.totalAmount.toLocaleString() : 0}원
          </p>
          <p className={styles.paymentDate}>
            결제 일시: {order.completedAt ? new Date(order.completedAt).toLocaleString() : "-"}
          </p>

          {itemsInfo.length > 0 && (
            <div className={styles.itemsSection}>
              <h3 className={styles.itemsTitle}>구매 상품 목록</h3>
              <ul className={styles.itemsList}>
                {itemsInfo.map((item) => (
                  <li key={item._id} className={styles.itemCard}>
                    <img 
                      src={item.imageUrls && item.imageUrls[0]} 
                      alt={item.title} 
                      className={styles.itemImage}
                    />
                    <div className={styles.itemInfo}>
                      <div className={styles.itemTitle}>{item.title}</div>
                      <div className={styles.itemBrand}>{item.brand}</div>
                      <div className={styles.itemPrice}>{Number(item.price).toLocaleString()}원</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <button className={styles.homeButton} onClick={() => router.push("/")}>
        홈으로 돌아가기
      </button>
    </div>
  );
}
