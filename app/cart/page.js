export const dynamic = 'force-dynamic'; 

import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { connectDB } from "@/util/database";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import CartClient from "./CartClient";

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

  return <CartClient cartItem={cartItem} />;
}
