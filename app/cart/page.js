export const dynamic = 'force-dynamic'; 

import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";
import CartItems from "../components/cartItems";
import styles from "./cart.module.css";
import { redirect } from "next/navigation";

export default async function Cart() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const db = (await connectDB).db('blueberryrags');
  const user = await db.collection('users').findOne({ _id: new ObjectId(session.user.id) });

  const cartItem = (user?.cart || []).map(item => ({
    ...item,
    productId: item.productId.toString()
  }));

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>CART</h2>
      {cartItem.length === 0 ? (
        <div>카트에 담긴 상품이 존재하지 않습니다.</div>
      ) : (
        <CartItems cartItem={cartItem} />
      )}
    </div>
  );
}
