"use client";

import { use } from "react";
import { MediaPlayerScreen } from "@/components/screens/MediaPlayerScreen";

export default function MediaPlayerPage({ params }) {
  const { id } = use(params);
  return <MediaPlayerScreen id={id} />;
}
