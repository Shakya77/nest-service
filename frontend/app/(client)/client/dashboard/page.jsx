"use client";

import { useParams } from "next/navigation";

export default function page() {
  const params = useParams();

  const slug = params.slug;
  return <div>{slug}</div>;
}
