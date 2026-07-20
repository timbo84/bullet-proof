"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Badge, Button, Card, Spinner, Textarea } from "@/components/ui";

function getYouTubeId(url) {
  const match = String(url || "").match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}

export function MediaPlayerScreen({ id }) {
  const router = useRouter();
  const { data, mutate } = useSWR(`/api/media/${id}`, fetcher);
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!data) return <Spinner />;
  const { media, completion } = data;
  const youTubeId = getYouTubeId(media.url);

  async function handleComplete(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(`/api/media/${id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reflection }),
    });
    const resData = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(resData.detail || "Something went wrong.");
      return;
    }
    mutate();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <button
        onClick={() => router.back()}
        className="text-sm text-text-secondary hover:text-text"
      >
        &larr; Back
      </button>

      {youTubeId ? (
        <div className="aspect-video overflow-hidden rounded-lg border border-border">
          <iframe
            src={`https://www.youtube.com/embed/${youTubeId}`}
            title={media.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : media.type === "video" ? (
        <video src={media.url} controls className="w-full rounded-lg border border-border" />
      ) : media.type === "podcast" || media.type === "audio" ? (
        <audio src={media.url} controls className="w-full" />
      ) : (
        <Card>
          <a
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary"
          >
            Open resource &rarr;
          </a>
        </Card>
      )}

      <Card className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-lg font-bold text-text">{media.title}</h1>
          <Badge tone="primary">{media.points} pts</Badge>
        </div>
        <p className="text-sm text-text">{media.description}</p>
      </Card>

      <Card className="space-y-3">
        {completion ? (
          <>
            <p className="text-sm font-semibold text-success">
              Completed — {completion.points_awarded} pts awarded.
            </p>
            {completion.reflection && (
              <p className="text-sm text-text-muted">Your reflection: {completion.reflection}</p>
            )}
          </>
        ) : (
          <form onSubmit={handleComplete} className="space-y-3">
            <Textarea
              label="Reflection (optional)"
              rows={4}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What stood out to you?"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" loading={saving}>
              Mark complete
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
