"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./detail.module.css";
import Modal from "@/app/modal/modal";
import Loading from "@/app/components/Loading";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Detail() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [item, setItem] = useState(null);
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInCart, setIsInCart] = useState(false);



  const addToCart = async () => {
    if (!session) {
      setMessage("로그인이 필요합니다.");
      setIsModalOpen(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
      return;
    }
    
    const res = await fetch(`/api/addtocart?id=${id}`);
    const data = await res.json();
  
    setMessage(data.message);
    setIsModalOpen(true);
  };
  const purchaseBtnHandler = () => {
    if (!session) {
      setMessage("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
      setIsModalOpen(true);

      setTimeout(() => {
        router.push("/login");
      }, 1500);

      return;
    }
      router.push(`/checkout?id=${id}`);
  }


  useEffect(() => {
    const fetchItem = async () => {
      const res = await fetch(`/api/itemdetail?id=${id}`);
      const data = await res.json();
      setItem(data);
    };

    if (id) fetchItem();
  }, [id]);

  useEffect(() => {
    const checkCart = async () => {
      if (!session) return;
  
      const res = await fetch(`/api/existInCart?id=${id}`);
      const data = await res.json();
      console.log(data.exist)
      setIsInCart(data.exist);
    };
  
    checkCart();
  }, [session, id, isModalOpen]);
  

  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => {
        setIsModalOpen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);
  


  if (!item) return <Loading />;
  return (
    <div className={styles.container}>
      <div className={styles.gridWrapper}>
        <div className={styles.leftPanel}>
        {item.imageUrls.map((url, idx) => (
         <img
          src={url}
          alt={`${item.title}-${idx}`}
          className={styles.image}
        />
  ))}
        </div>
        <aside>
          <div className={styles.rightPanel}>
            <h6 className={styles.brand}>{item.brand}</h6>
            <h1 className={styles.title}>{item.title}</h1>
            <p className={styles.price}>{Number(item.price).toLocaleString()}원</p>
            <p className={styles.sizeMeasurements}>
            {item.measurements &&
              Object.entries(item.measurements)
                .map(([key, value]) => `${key} ${value}`)
                .join(" | ")}
            </p>
            <p className={styles.description}>{item.description}</p>
            <p className={styles.cautionContent}>
              [Notice / Please translate before making a purchase]
              <br />
              판매되는 상품들은 새 상품 표기가 돼있지 않는 한 중고 의류이며,
              사진에 나온 구성품이 전부입니다.
              <br />
              제품 상태에 대한 점은 사진, 글로 설명을 드리나 사용감이 있는
              제품들일 수 있기 때문에 제품 상태에 민감하신 분들은 구매 전 유의
              부탁드립니다.
              <br />
              제품 발송 이후 환불이 어려우니 구매 전 유의부탁드립니다.
              <br />
              <br />
              <br />
              배송비 별도 4,000원
            </p>
            <div className={styles.btnContainer}>
            {item.isSold ? (
              <p className={styles.soldLabel}>SOLD</p>
            ) : (
              <>
                <button
                  className={styles.btn}
                  onClick={purchaseBtnHandler}
                >
                  결제
                </button>
                {!isInCart && (
                  <button className={styles.btn} onClick={addToCart}>
                    장바구니
                  </button>
                )}
              </>
            )}
              {session?.user?.role === 'admin' && (
                <button className={styles.btn}>
                  <Link className={styles.editBtn} href={`/products/${id}/edit`}>edit</Link>
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
      {isModalOpen && (
        <Modal
        message={message}
        onClose={() => {
          setIsModalOpen(false);
        }}
      />
      
      )}
    </div>
  );
}
