"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import styles from "./category.module.css";
import Item from "@/app/components/item";


const CATEGORY_LABELS = {
  all: "ALL",
  top: "TOP",
  bottom: "BOTTOM",
  shoes: "SHOES",
  etc: "ETC",
};

export default function CategoryPage({ params }) {
  const { category } = params;
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [isEnd, setIsEnd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef(null);

  const loadItems = useCallback(async () => {
    if (isEnd || isLoading) return;
    setIsLoading(true);
    let url = "/api/itemlist";
    if (category !== "all") {
      url += `?category=${category}`;
    } else {
      url += `?page=${page}`;
    }
    const res = await fetch(url);
    const newItems = await res.json();
    if (Array.isArray(newItems)) {
      setItems(newItems);
      setIsEnd(true);
    } else {
      if (newItems.length === 0) {
        setIsEnd(true);
      } else {
        setItems((prev) => {
          const existingIds = new Set(prev.map((item) => item._id));
          const filtered = newItems.filter((item) => !existingIds.has(item._id));
          return [...prev, ...filtered];
        });
      }
    }
    setIsLoading(false);
  }, [category, page, isEnd, isLoading]);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setIsEnd(false);
  }, [category]);

  useEffect(() => {
    loadItems();
  }, [page, category]);

  useEffect(() => {
    if (category !== "all") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isEnd && !isLoading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );
    const currentRef = observerRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [isEnd, isLoading, category]);

  if (!CATEGORY_LABELS[category]) {
    return <div className={styles.noItems}>존재하지 않는 카테고리입니다.</div>;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{CATEGORY_LABELS[category]}</h3>
      {items.length !== 0 ? (
        <div className={styles.gridContainer}>
          {items.map((item) => (
            <Item key={item._id} item={item} />
          ))}
        </div>
      ) : (
        <div className={styles.noItems}>현재 등록된 상품이 없습니다.</div>
      )}
      {category === "all" && !isEnd && (
        <div ref={observerRef} style={{ height: 20 }} />
      )}
    </div>
  );
}
