import { useRouter } from "next/navigation";
import styles from "../category/all/all.module.css";

export default function Item({ item }) {
  const router = useRouter();

  return (
    <div
      className={`${styles.gridItemWrapper} ${item.isSold ? styles.soldItem : ""}`}
      onClick={() => router.push(`/products/${item._id}`)}
    >
      <div className={styles.imageWrapper}>
        <img
          src={item.imageUrls[0]}
          alt="이미지"
          className={styles.gridItem}
        />
        {item.isSold && <div className={styles.soldOverlay}>SOLD</div>}
      </div>

    </div>
  );
}
