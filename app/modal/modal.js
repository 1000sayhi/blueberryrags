'use client'

import Image from 'next/image';
import styles from './modal.module.css';

export default function Modal({ message, onClose }) {
  if(message === "CART IN"){
    return (<div className={styles.modalOverlay}>
      <Image src={'/images/bbcarrycart.png'} width={300} height={300} />
    </div>)
  }
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <p>{message}</p>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}
