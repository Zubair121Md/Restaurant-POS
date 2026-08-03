import { NextResponse } from "next/server";
import { COMPANY } from "@/lib/brand";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: COMPANY.productName,
    operator: COMPANY.legalName,
    timestamp: new Date().toISOString()
  });
}
