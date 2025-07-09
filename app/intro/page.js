import Image from "next/image";
import styles from "./intro.module.css";
export default function Intro() {
  return (
    <div className={styles.introContainer}>
      <div className={styles.imageContainer}>
        <Image
          alt=""
          src={"/images/lilbitimg.jpeg"}
          width={400}
          height={600}
        />
      </div>
      <div className={styles.textInfo}>
        <p>
          <strong className={styles.bbrIs}>BlueBerry Rags</strong><strong>는</strong>&nbsp; 빈티지 셀렉트샵입니다.
          <br />
          과거에 있는 옷들을 가져와, 그 안에 담긴 가치와 이야기를
          소개해드립니다.
          <br />
          시간이 흘러 더 특별해진 물건들을 편하게 즐겨주세요.
        </p>
      </div>
    </div>
  );
}
