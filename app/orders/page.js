'use client';

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./orders.module.css";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchOrders = async () => {
      const session = await getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('/api/getUserOrders');
        const data = await res.json();
        
        if (data.success) {
          // '결제대기' 상태의 주문은 제외하고, 결제가 완료된 주문만 필터링합니다.
          const paidStatuses = ['completed', 'preparing', 'shipping', 'delivered'];
          const paidOrders = data.orders.filter(order => paidStatuses.includes(order.status));
          setOrders(paidOrders);
        } else {
          console.error('주문 내역 조회 실패');
        }
      } catch (err) {
        console.error('주문 내역 조회 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchOrders();
  }, [router]);

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return '결제완료';
      case 'preparing':
        return '상품 준비중';
      case 'shipping':
        return '배송 중';
      case 'delivered':
        return '배송 완료';
      default:
        // 필터링 로직에 의해 이 경우는 나타나지 않아야 합니다.
        return '';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#28a745';
      case 'preparing':
        return '#ffc107';
      case 'shipping':
        return '#17a2b8';
      case 'delivered':
        return '#6f42c1';
      default:
        // 필터링 로직에 의해 이 경우는 나타나지 않아야 합니다.
        return 'transparent';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>주문 내역을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>결제내역</h1>
      
      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>아직 주문 내역이 없습니다.</p>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  <h3 className={styles.orderId}>주문번호: {order.orderId}</h3>
                  <p className={styles.orderDate}>
                    주문일: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  {order.completedAt && (
                    <p className={styles.completedDate}>
                      결제일: {new Date(order.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div 
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusText(order.status)}
                </div>
              </div>

              <div className={styles.orderItems}>
                {order.items && order.items.map((item) => (
                  <div key={item._id} className={styles.itemCard}>
                    <img 
                      src={item.imageUrls && item.imageUrls[0]} 
                      alt={item.title} 
                      className={styles.itemImage}
                    />
                    <div className={styles.itemInfo}>
                      <h4 className={styles.itemTitle}>{item.title}</h4>
                      <p className={styles.itemBrand}>{item.brand}</p>
                      <p className={styles.itemPrice}>
                        {Number(item.price).toLocaleString()}원
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.orderFooter}>
                <div className={styles.totalAmount}>
                  총 결제 금액: {order.totalAmount ? order.totalAmount.toLocaleString() : 0}원
                </div>
                {order.address && (
                  <div className={styles.shippingAddress}>
                    배송지: {order.address} {order.detailAddress}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 