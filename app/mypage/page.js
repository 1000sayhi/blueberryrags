import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { connectDB } from "@/util/database";
import Link from "next/link";
import styles from "./mypage.module.css";
import CouponToggle from "../components/couponToggle";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";

export default async function Mypage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const db = (await connectDB).db("blueberryrags");

  const user = await db
    .collection("users")
    .findOne({ id: session.user.name });

  if (!user) return <div>사용자 정보를 찾을 수 없습니다.</div>;

  const productIdsInCart = user.cart?.map((item) => item.productId) || [];

  const cartItems =
    productIdsInCart.length > 0
      ? await db
          .collection("item")
          .find({ _id: { $in: productIdsInCart } })
          .toArray()
      : [];

  // 최근 주문 3개 가져오기
  const recentOrders = await db
    .collection("orders")
    .find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(3)
    .toArray();

  // 주문에 상품 정보 추가
  const ordersWithItems = await Promise.all(
    recentOrders.map(async (order) => {
      if (!order.status) {
        order.status = 'completed';
      }

      let items = [];
      if (order.items && order.items.length > 0) {
        const itemIds = order.items.map(id => new ObjectId(id));
        items = await db.collection("item")
          .find({ _id: { $in: itemIds } })
          .toArray();
      }
      
      return {
        ...order,
        items: items
      };
    })
  );

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
      case 'pending':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{user.nickName}님의 마이페이지</h2>
      <section className={styles.section}>
        <Link href="/mypage/edit">
          <button className={styles.button}>개인정보 수정</button>
        </Link>
        {session.user.provider==="credentials" && <Link href="/mypage/edit-password">
          <button className={styles.button}>비밀번호 변경</button>
        </Link>}
        
        <h3>포인트: {user.point}p</h3>
        <CouponToggle couponList={user.coupon || []} />
      </section>

      <section className={styles.section}>
        <h3>장바구니</h3>
        {cartItems.length === 0 ? (
          <p>장바구니가 비어 있습니다.</p>
        ) : (
          <ul className={styles.cartList}>
            {cartItems.map((item) => (
              <li key={item._id} className={styles.cartItem}>
                <img
                  src={item.imageUrls[0]}
                  alt={item.title}
                  className={styles.thumbnail}
                />
                <div>
                  <p>{item.title}</p>
                  <p>{Number(item.price).toLocaleString()}원</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>최근 주문 내역</h3>
          <Link href="/orders">
            <button className={styles.moreButton}>더보기</button>
          </Link>
        </div>
        
        {ordersWithItems.length === 0 ? (
          <p>주문 내역이 없습니다.</p>
        ) : (
          <div className={styles.recentOrders}>
            {ordersWithItems.map((order) => (
              <div key={order._id} className={styles.orderPreview}>
                <div className={styles.orderPreviewHeader}>
                  <span className={styles.orderId}>주문번호: {order.orderId}</span>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className={styles.orderPreviewItems}>
                  {order.items && order.items.slice(0, 2).map((item) => (
                    <div key={item._id} className={styles.orderPreviewItem}>
                      <img 
                        src={item.imageUrls && item.imageUrls[0]} 
                        alt={item.title} 
                        className={styles.orderPreviewImage}
                      />
                      <div className={styles.orderPreviewInfo}>
                        <p className={styles.orderPreviewTitle}>{item.title}</p>
                        <p className={styles.orderPreviewPrice}>
                          {Number(item.price).toLocaleString()}원
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items && order.items.length > 2 && (
                    <p className={styles.moreItems}>
                      외 {order.items.length - 2}개 상품
                    </p>
                  )}
                </div>
                <div className={styles.orderPreviewFooter}>
                  <span className={styles.orderPreviewDate}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span className={styles.orderPreviewTotal}>
                    총 {order.totalAmount ? order.totalAmount.toLocaleString() : 0}원
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {session.user.role === 'admin' && (
          <div className={styles.adminSection}>
            <Link href="/admin/orders">
              <button className={styles.adminButton}>주문 관리</button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
