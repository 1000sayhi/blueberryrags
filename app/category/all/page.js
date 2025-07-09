'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import styles from './all.module.css';
import Item from '@/app/components/item';

export default function All() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [isEnd, setIsEnd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef(null);

  const loadItems = useCallback(async () => {
    if (isEnd || isLoading) return;

    setIsLoading(true);
    const res = await fetch(`/api/itemlist?page=${page}`);
    const newItems = await res.json();

    if (newItems.length === 0) {
      setIsEnd(true);
    } else {
      setItems((prev) => {
        const existingIds = new Set(prev.map((item) => item._id));
        const filtered = newItems.filter((item) => !existingIds.has(item._id));
        return [...prev, ...filtered];
      });
    }

    setIsLoading(false);
  }, [page, isEnd, isLoading]);

  useEffect(() => {
    loadItems();
  }, [page]);

  useEffect(() => {
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
  }, [isEnd, isLoading]);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>ALL</h3>
      {items.length !== 0 ? (
        <div className={styles.gridContainer}>
          {items.map((item) => (
            <Item key={item._id} item={item} />
          ))}
          <div ref={observerRef} style={{ height: 1 }}></div>
        </div>
      ) : (
        <div className={styles.noItems}>현재 등록된 상품이 없습니다.</div>
      )}
    </div>
  );
}
