import { prisma } from "@/lib/prisma";
import PosClient from "./PosClient";

export const dynamic = "force-dynamic";

export default async function POSPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <header style={{ marginBottom: "24px", paddingTop: "20px" }}>
        <h1 style={{ color: "var(--primary)", margin: 0 }}>نقطة البيع والكاشير (POS)</h1>
      </header>

      <PosClient dbProducts={products} dbCustomers={customers} />
    </div>
  );
}
