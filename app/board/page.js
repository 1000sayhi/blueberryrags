import { connectDB } from "@/util/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Link from "next/link";
import styles from "./board.module.css";

export default async function Board({ searchParams }) {
  const session = await getServerSession(authOptions);

  const page = parseInt(searchParams?.page || "1", 10);
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const db = (await connectDB).db("blueberryrags");
  const totalPosts = await db.collection("boardpost").countDocuments();
  const posts = await db.collection("boardpost")
    .find({})
    .sort({ _id: -1 })
    .skip(skip)
    .limit(pageSize)
    .toArray();

  const totalPages = Math.ceil(totalPosts / pageSize);

  console.log(posts)
  
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>게시판</h2>
      {session?.user?.role === "admin" && (
        <Link className={styles.addBtnWrapper} href="/board/write">+</Link>
      )}
      {posts==[]&&(<div>게시물 x</div>)}
      <div className={styles.postList}>
        {posts.map((post) => (
          <Link
            className={styles.postItemWrapper}
            href={`/board/${post._id}?page=${page}`}
            key={post._id}
          >
            <div className={styles.postItem}>
              <div className={styles.postTitle}>{post.title}</div>
              <div className={styles.postDate}>{post.createdAt.toISOString().slice(0, 10)}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.pagination}>
        {Array.from({ length: totalPages }, (_, i) => (
          <Link
            key={i + 1}
            href={`/board?page=${i + 1}`}
            className={styles.pageLink}
          >
            {i + 1}
          </Link>
        ))}
      </div>
    </div>
  );
}
