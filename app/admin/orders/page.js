'use client';

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./adminOrders.module.css";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchOrders = async () => {
      const session = await getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // 관리자 권한 확인
      if (session.user.role !== 'admin') {
        router.push('/');
        return;
      }

      fetchOrders();
    };

    checkAuthAndFetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/getAllOrders');
      const data = await res.json();
      
      if (data.success) {
        setOrders(data.orders);
      } else {
        console.error('주문 목록 조회 실패');
      }
    } catch (err) {
      console.error('주문 목록 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(prev => ({ ...prev, [orderId]: true }));

    try {
      const res = await fetch('/api/updateOrderStatus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      const data = await res.json();
      
      if (data.success) {
        // 성공하면 주문 목록 새로고침
        fetchOrders();
        alert('주문 상태가 업데이트되었습니다.');
      } else {
        alert('주문 상태 업데이트에 실패했습니다.');
      }
    } catch (err) {
      console.error('주문 상태 업데이트 오류:', err);
      alert('주문 상태 업데이트 중 오류가 발생했습니다.');
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

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
        return '처리중';
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
        return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>주문 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>주문 관리</h1>
      
      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>주문 내역이 없습니다.</p>
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
                  <p className={styles.userInfo}>
                    주문자: {order.userName || '알 수 없음'}
                  </p>
                </div>
                <div className={styles.statusSection}>
                  <div 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </div>
                  <select
                    className={styles.statusSelect}
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                    disabled={updating[order.orderId]}
                  >
                    <option value="completed">결제완료</option>
                    <option value="preparing">상품 준비중</option>
                    <option value="shipping">배송 중</option>
                    <option value="delivered">배송 완료</option>
                  </select>
                  {updating[order.orderId] && (
                    <span className={styles.updating}>업데이트 중...</span>
                  )}
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
                {order.phone && (
                  <div className={styles.phone}>
                    연락처: {order.phone}
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