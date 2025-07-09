'use client';

import Loading from "@/app/components/Loading";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from './boardDetail.module.css'; 

export default function BoardDetail() {
    const [item, setItem] = useState(null);
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id;
    const page = searchParams.get("page") || "1";
    const router = useRouter();

    useEffect(() => {
        const fetchItem = async () => {
          const res = await fetch(`/api/boardDetail?id=${id}`);
          const data = await res.json();
          setItem(data);
        };
        
        
        if (id) fetchItem();
      }, [id]);
    
    if (!item) return <Loading />;

    
    return <div className={styles.container}>
    <h2 className={styles.pageTitle}>공지사항</h2>
    <table className={styles.table}>
      <tbody>
        <tr>
          <th>카테고리</th>
          <td>공지사항</td>
        </tr>
        <tr>
          <th>제목</th>
          <td>{item.title}</td>
        </tr>
        <tr>
          <th>날짜</th>
          <td>{item.createdAt.slice(0, 10)}</td>
        </tr>
      </tbody>
    </table>

    <div className={styles.contentSection}>
      <div className={styles.contentTitle}>내용</div>
      <hr className={styles.divider} />
      <div className={styles.contentBody}>
        {item.content}
      </div>
    </div>
    <button
        onClick={() => router.push(`/board?page=${page}`)}
        className={styles.backBtn}
      >
        LIST
      </button>

  </div>
}