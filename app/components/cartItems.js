"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import styles from "./cartItem.module.css";
import { useRouter } from "next/navigation";

// React.memo로 컴포넌트 메모이제이션
const CartItems = React.memo(function CartItems({ cartItem }) {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  // cartItem이 변경될 때만 실행되는 useEffect
  useEffect(() => {
    const fetchItemData = async () => {
      const res = await fetch("/api/getItemsByIds", {
        method: "POST",
        body: JSON.stringify({ ids: cartItem.map((i) => i.productId) }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setItems(data.items);
    };

    fetchItemData();
  }, [cartItem]);

  // useCallback으로 함수 메모이제이션
  const handleDelete = useCallback(async (id) => {
    const res = await fetch(`/api/deleteFromCart?id=${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      window.location.reload();
    } else {
      alert("삭제 실패");
    }
  }, []);

  const toggleSelect = useCallback((id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((_id) => _id !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      const allIds = items.map(item => item._id);
      setSelectedItems(allIds);
    }
  }, [selectedItems.length, items]);

  // useMemo로 계산된 값들 메모이제이션
  const selectedItemCount = useMemo(() => selectedItems.length, [selectedItems.length]);
  
  const isAllSelected = useMemo(() => 
    items.length > 0 && selectedItems.length === items.length, 
    [selectedItems.length, items.length]
  );

  const handleCheckout = useCallback(() => {
    if (selectedItems.length === 0) {
      alert("선택된 상품이 없습니다");
      return;
    }
    const query = selectedItems.map((id) => `id=${id}`).join("&");
    router.push(`/checkout?${query}`);
  }, [selectedItems, router]);

  // 상품 리스트 메모이제이션
  const renderedItems = useMemo(() => items.map((item) => {
    const mainImage = item.imageUrls?.[0] || '/images/default-product.jpg';
    const quantity = cartItem.find((i) => i.productId === item._id)?.quantity || 1;
    return (
      <div
        key={item._id}
        className={`${styles.itemContainer} ${selectedItems.includes(item._id) ? styles.selected : ""}`}
        onClick={() => toggleSelect(item._id)}
      >
        <img src={mainImage} alt={item.title} width={100} />
        <div className={styles.itemInfo}>
          <h5 className={styles.itemBrandName}>{item.brand}</h5>
          <h3 className={styles.itemTitle}>{item.title}</h3>
          <p className={styles.itemCount}>수량: {quantity}</p>
        </div>
        <p className={styles.price}>{Number(item.price).toLocaleString()}원</p>
        <button
          className={styles.removeBtn}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(item._id);
          }}
        >
          x
        </button>
      </div>
    );
  }), [items, selectedItems, cartItem, toggleSelect, handleDelete]);

  return (
    <div className={styles.cartItemContainer}>
      <div className={styles.selectedItemCount}>
        <span>현재 선택된 상품</span>
        <div className={styles.colorBox}></div>
      </div>
      {renderedItems}
      <button onClick={toggleSelectAll} className={styles.selectAllBtn}>
        {isAllSelected ? "해제" : "ALL"}
      </button>
      <button className={styles.checkoutBtn} onClick={handleCheckout}>
        결제하기
      </button>
    </div>
  );
});

export default CartItems;
