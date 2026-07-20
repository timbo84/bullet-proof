"use client";

import { use } from "react";
import { WorkshopDetail } from "@/components/screens/WorkshopDetail";

export default function WorkshopPage({ params }) {
  const { id } = use(params);
  return <WorkshopDetail id={id} />;
}
