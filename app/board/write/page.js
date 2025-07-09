'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './write.module.css';

export default function WriteBoard() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/boardPost', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      router.push('/board');
      router.refresh();
    } else {
      alert('등록 실패');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>게시글 등록</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          className={styles.input}
          name="title"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className={styles.textarea}
          name="content"
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          required
        />
        <button type="submit" className={styles.submitBtn}>
          등록
        </button>
      </form>
    </div>
  );
}
