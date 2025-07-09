'use client';

import { Suspense } from "react";
import CheckoutInnerContent from './CheckoutInnerContent';

export const dynamic = 'force-dynamic';

export default function Checkout() {
  return (
    <Suspense fallback={<div>불러오는 중...</div>}>
      <CheckoutInnerContent />
    </Suspense>
  );
}
