"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { OrderTerminal } from "@/components/order-terminal";

function TicketInner() {
  const params = useSearchParams();
  const orderId = params.get("id") || "";

  if (!orderId) {
    return <p className="text-slate-500">Missing ticket id. Open an order from Tables or Orders.</p>;
  }

  return <OrderTerminal orderId={orderId} />;
}

export default function OrderTicketPage() {
  return (
    <Suspense fallback={<p className="text-slate-500">Loading ticket…</p>}>
      <TicketInner />
    </Suspense>
  );
}
