'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import styles from "./checkout.module.css";
import { getSession } from "next-auth/react";
import { HiOfficeBuilding } from "react-icons/hi";

export default function CheckoutInnerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState([]);
  const [points, setPoints] = useState(0);
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [userPoint, setUserPoint] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const SHIPPING_FEE = 10;
  
  const couponDiscount = useMemo(() => 
    selectedCoupon ? selectedCoupon.value : 0, 
    [selectedCoupon]
  );
  const toNumber = useCallback((value) => {
    return Number(String(value).replace(/[^\d]/g, ""));
  }, []);

  const pointDiscount = useMemo(() => 
    toNumber(points), 
    [points, toNumber]
  );
  const totalPrice = useMemo(() => 
    items.reduce((sum, item) => sum + toNumber(item.price), 0), 
    [items, toNumber]
  );
  
  const rawFinalPrice = useMemo(() => 
    totalPrice - couponDiscount - pointDiscount + SHIPPING_FEE, 
    [totalPrice, couponDiscount, pointDiscount]
  );
  
  const finalPrice = useMemo(() => 
    Math.max(0, rawFinalPrice), 
    [rawFinalPrice]
  );

  // 6자리 영문+숫자 랜덤 주문번호 생성 함수
  function generateOrderId(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  const handlePostcode = useCallback(() => {
    if (!window.daum?.Postcode) {
      alert("주소 검색 기능을 아직 불러오는 중입니다.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: function (data) {
        setAddress(data.address);
      },
    }).open();
  }, []);

  const handlePhoneChange = useCallback((e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length <= 3) {
      value = value;
    } else if (value.length <= 7) {
      value = value.slice(0, 3) + "-" + value.slice(3);
    } else {
      value =
        value.slice(0, 3) + "-" + value.slice(3, 7) + "-" + value.slice(7, 11);
    }

    setPhone(value);
  }, []);

  const handlePointChange = useCallback((e) => {
    const value = Number(e.target.value);
    setPoints(value > userPoint ? userPoint : value);
  }, [userPoint]);

  const handleDetailAddressChange = useCallback((e) => {
    setDetailAddress(e.target.value);
  }, []);

  const handleCouponChange = useCallback((e) => {
    const selected = availableCoupons.find((c) => c.id === e.target.value);
    if (selected && selected.value >= totalPrice) {
      alert("쿠폰 금액은 상품 총액보다 작아야 합니다.");
      setSelectedCoupon(null);
    } else {
      setSelectedCoupon(selected);
    }
  }, [availableCoupons, totalPrice]);

  const handleCheckout = useCallback(async () => {
    if(address === "" || detailAddress === ""){
      alert("주소 입력란을 완성해주세요.");
      return;
    }
    if (phone === "") {
      alert("전화번호를 입력하세요.");
      return;
    }
    const session = await getSession();
    const orderId = generateOrderId(); // 6자리 주문번호
    const amount = Math.max(0, finalPrice);

    console.log("전송할 totalAmount:", amount);

    sessionStorage.setItem("itemIds", JSON.stringify(items.map((i) => i._id)));
    
    const res = await fetch("/api/readyToss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        itemIds: items.map((i) => i._id),
        usedPoint: points,
        usedCouponId: selectedCoupon?.id || null,
        address,
        detailAddress,
        phone,
        totalAmount: amount,
      }),
    });
  
    const tossPayments = window.TossPayments("test_ck_5OWRapdA8dvDY6L1AY19Vo1zEqZK");
    tossPayments.requestPayment("카드", {
      amount,
      orderId,
      orderName: items.map((i) => i.title).join(", "),
      customerName: session.user.name,
      successUrl: `${window.location.origin}/checkout/result`,
      failUrl: `${window.location.origin}/payment/fail`,
    });
  }, [address, detailAddress, phone, finalPrice, items, points, selectedCoupon, router]);

  useEffect(() => {
    const ids = searchParams.getAll("id");
    if (!ids || ids.length === 0) return;

    const fetchData = async () => {
      const session = await getSession();

      if (!session) {
        router.replace("/login");
        return;
      }
      const res = await fetch("/api/getItemsByIds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      
      // 판매된 상품이 있는지 확인하고, 있다면 리디렉션
      const hasSoldItem = data.items.some(item => item.isSold);
      if (hasSoldItem) {
        alert("이미 판매된 상품이 포함되어 있어 결제를 진행할 수 없습니다. 상품 목록으로 돌아갑니다.");
        router.push("/category/all");
        return;
      }
      setItems(data.items);

      const _id = session.user.id;

      const userRes = await fetch(`/api/getUserInfo?id=${_id}`);
      const userData = await userRes.json();

      setUserPoint(userData.point || 0);
      setAvailableCoupons(userData.coupon || []);
      setAddress(userData.address || '')
      setDetailAddress(userData.detailAddress || '')
      setPhone(userData.phone || '')
    };

    fetchData();
  }, [searchParams, router]);

  if (items.length === 0) return <div>불러오는 중...</div>;

  return (
    <>
      <Script
        src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://js.tosspayments.com/v1/payment"
        strategy="afterInteractive"
      />
      <div className={styles.container}>
        <h2 className={styles.title}>결제할 상품</h2>
        
        {items.length > 0 && (
          <ul className={styles.itemList}>
            {items.map((item) => (
              <li key={item._id} className={styles.item}>
                <img src={item.imageUrls[0]} width={100} alt={item.title} />
                <div>
                  <div className={styles.itemTitle}>{item.title}</div>
                  <p className={styles.price}>{item.price.toLocaleString()}원</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        
            <div className={styles.section}>
              <label className={styles.label}>보유 쿠폰</label>
              <select
                className={styles.input}
                value={selectedCoupon?.id || ""}
                onChange={handleCouponChange}
              >
                <option value="">쿠폰 선택</option>
                {availableCoupons.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.value.toLocaleString()}원 할인)
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.section}>
              <label className={styles.label}>
                포인트 사용 (보유: {userPoint.toLocaleString()}P)
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="사용할 포인트 입력"
                value={points}
                onChange={handlePointChange}
              />
            </div>

            <div className={styles.section}>
              <label className={styles.label}>배송지 주소</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="주소"
                  value={address}
                  readOnly
                />
                <button
                  type="button"
                  onClick={handlePostcode}
                  className={styles.postcodeButton}
                >
                  <HiOfficeBuilding />
                </button>
              </div>
            </div>

            <div className={styles.section}>
              <label className={styles.label}>상세 주소</label>
              <input
                type="text"
                className={styles.input}
                placeholder="상세 주소"
                value={detailAddress}
                onChange={handleDetailAddressChange}
              />
            </div>

            <div className={styles.section}>
              <label className={styles.label}>전화번호</label>
              <input
                type="text"
                className={styles.input}
                placeholder="전화번호"
                value={phone}
                onChange={handlePhoneChange}
              />
            </div>

            <div className={styles.total}>
              <div className={styles.summaryRow}>
                <span>상품 금액:</span>
                <span>{totalPrice.toLocaleString()}원</span>
              </div>
              {couponDiscount > 0 && (
                <div className={styles.summaryRow}>
                  <span>쿠폰 할인:</span>
                  <span>-{couponDiscount.toLocaleString()}원</span>
                </div>
              )}
              {pointDiscount > 0 && (
                <div className={styles.summaryRow}>
                  <span>포인트 할인:</span>
                  <span>-{pointDiscount.toLocaleString()}원</span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span>배송비:</span>
                <span>{SHIPPING_FEE.toLocaleString()}원</span>
              </div>
              <div className={styles.summaryRow}>
                <span>최종 결제 금액:</span>
                <span>{finalPrice.toLocaleString()}원</span>
              </div>
            </div>

            <button
              className={styles.checkoutBtn}
              onClick={handleCheckout}
            >
              결제하기
            </button>
        
      </div>
    </>
  );
}
