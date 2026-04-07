"use client";

import ProductDetail from "@/components/ecommerce/productDetails/ProductDetail";
import { useParams } from "next/navigation";

export default function page() {
  const { id } = useParams();
  return <ProductDetail id={id} />;
}
