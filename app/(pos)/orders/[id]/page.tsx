import { OrderTerminal } from "@/components/order-terminal";

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderTerminal orderId={id} />;
}
