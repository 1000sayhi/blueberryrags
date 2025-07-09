import { getServerSession } from 'next-auth';
import ItemPostForm from './ItemPostForm';
import styles from './itempost.module.css'
import { redirect } from 'next/navigation';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function ItemPost() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }
  return(
    <div className={styles.formContainer}>
      <h3 className={styles.title}>아이템 등록</h3>
      <ItemPostForm />
    </div>
  )
    
}