'use client'

import { useEffect, useState } from 'react';
import styles from './top.module.css'
import Item from '@/app/components/item';


export default function Top() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch('/api/itemlist?category=top');
      const data = await res.json();
      setItems(data);
    };
    fetchItems();
  }, []);
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>TOP</h3>
      {items.length !== 0 ? (
        <div className={styles.gridContainer}>
          {items.map((item) => (
            <Item key={item._id} item={item} />
          ))}
        </div>
      ) : (
        <div className={styles.noItems}>현재 등록된 상품이 없습니다.</div>
      )}
    </div>
  );
}