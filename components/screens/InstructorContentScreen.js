"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useAuth } from "@/components/AuthProvider";
import { MEDIA_CATEGORIES } from "@/lib/constants";
import { Badge, Button, Card, Input, PageHeader, SectionTitle, Spinner } from "@/components/ui";

const EMPTY_WORKSHOP = { title: "", description: "", date: "", location: "", points: "" };
const EMPTY_MEDIA = {
  title: "",
  description: "",
  url: "",
  media_type: "video",
  category: MEDIA_CATEGORIES[0],
  points_on_complete: "",
};

function StatusBadge({ status }) {
  if (status === "pending") return <Badge tone="primary">Pending review</Badge>;
  if (status === "rejected") return <Badge tone="danger">Rejected</Badge>;
  return <Badge tone="success">Approved</Badge>;
}

function MySubmissions({ items, emptyLabel, onEdit }) {
  return (
    <div className="space-y-2">
      {items === null && <Spinner />}
      {items?.length === 0 && <p className="text-sm text-text-muted">{emptyLabel}</p>}
      {items?.map((item) => (
        <Card key={item.id} className="flex items-center justify-between gap-2">
          <p className="font-semibold text-text">{item.title}</p>
          <div className="flex items-center gap-2">
            {item.status === "pending" && (
              <Button variant="outline" onClick={() => onEdit(item)}>
                Edit
              </Button>
            )}
            <StatusBadge status={item.status} />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function InstructorContentScreen() {
  const { user } = useAuth();
  const { data: workshopData, mutate: mutateWorkshops } = useSWR("/api/workshops", fetcher);
  const { data: mediaData, mutate: mutateMedia } = useSWR("/api/media", fetcher);
  const [workshopForm, setWorkshopForm] = useState(EMPTY_WORKSHOP);
  const [mediaForm, setMediaForm] = useState(EMPTY_MEDIA);
  const [editingWorkshopId, setEditingWorkshopId] = useState(null);
  const [editingMediaId, setEditingMediaId] = useState(null);
  const [savingWorkshop, setSavingWorkshop] = useState(false);
  const [savingMedia, setSavingMedia] = useState(false);
  const [mediaError, setMediaError] = useState("");

  const myWorkshops = workshopData?.workshops?.filter((w) => w.uploader_id === user?.id) ?? null;
  const myMedia = mediaData?.media?.filter((m) => m.uploader_id === user?.id) ?? null;

  function startEditWorkshop(item) {
    setEditingWorkshopId(item.id);
    setWorkshopForm({
      title: item.title,
      description: item.description || "",
      date: item.date || "",
      location: item.location || "",
      points: item.points ?? "",
    });
  }

  function cancelEditWorkshop() {
    setEditingWorkshopId(null);
    setWorkshopForm(EMPTY_WORKSHOP);
  }

  function startEditMedia(item) {
    setEditingMediaId(item.id);
    setMediaForm({
      title: item.title,
      description: item.description || "",
      url: item.url || "",
      media_type: item.media_type || "video",
      category: item.category || MEDIA_CATEGORIES[0],
      points_on_complete: item.points_on_complete ?? "",
    });
  }

  function cancelEditMedia() {
    setEditingMediaId(null);
    setMediaForm(EMPTY_MEDIA);
  }

  async function handleWorkshopSubmit(e) {
    e.preventDefault();
    setSavingWorkshop(true);
    const url = editingWorkshopId ? `/api/workshops/${editingWorkshopId}` : "/api/workshops";
    await fetch(url, {
      method: editingWorkshopId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workshopForm),
    });
    setSavingWorkshop(false);
    cancelEditWorkshop();
    mutateWorkshops();
  }

  async function handleMediaSubmit(e) {
    e.preventDefault();
    setSavingMedia(true);
    setMediaError("");
    const url = editingMediaId ? `/api/media/${editingMediaId}` : "/api/media";
    const res = await fetch(url, {
      method: editingMediaId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...mediaForm, audience: ["Officer", "Chaplain", "Partner"] }),
    });
    setSavingMedia(false);
    if (!res.ok) {
      const d = await res.json();
      setMediaError(d.detail || "Something went wrong.");
      return;
    }
    cancelEditMedia();
    mutateMedia();
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Content" subtitle="Submit workshops and media for Director approval" />

      <div className="space-y-3">
        <SectionTitle>{editingWorkshopId ? "Edit workshop" : "New workshop"}</SectionTitle>
        <Card>
          <form onSubmit={handleWorkshopSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Title"
              required
              value={workshopForm.title}
              onChange={(e) => setWorkshopForm((f) => ({ ...f, title: e.target.value }))}
            />
            <Input
              label="Points"
              type="number"
              value={workshopForm.points}
              onChange={(e) => setWorkshopForm((f) => ({ ...f, points: e.target.value }))}
            />
            <Input
              label="Date"
              type="date"
              required
              value={workshopForm.date}
              onChange={(e) => setWorkshopForm((f) => ({ ...f, date: e.target.value }))}
            />
            <Input
              label="Location"
              value={workshopForm.location}
              onChange={(e) => setWorkshopForm((f) => ({ ...f, location: e.target.value }))}
            />
            <div className="sm:col-span-2">
              <Input
                label="Description"
                value={workshopForm.description}
                onChange={(e) => setWorkshopForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" loading={savingWorkshop} className="flex-1">
                {editingWorkshopId ? "Save changes" : "Submit for approval"}
              </Button>
              {editingWorkshopId && (
                <Button type="button" variant="ghost" onClick={cancelEditWorkshop}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>
        <MySubmissions
          items={myWorkshops}
          emptyLabel="No workshops submitted yet."
          onEdit={startEditWorkshop}
        />
      </div>

      <div className="space-y-3">
        <SectionTitle>{editingMediaId ? "Edit media" : "New media"}</SectionTitle>
        <Card>
          <form onSubmit={handleMediaSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Title"
              required
              value={mediaForm.title}
              onChange={(e) => setMediaForm((f) => ({ ...f, title: e.target.value }))}
            />
            <Input
              label="Points"
              type="number"
              value={mediaForm.points_on_complete}
              onChange={(e) => setMediaForm((f) => ({ ...f, points_on_complete: e.target.value }))}
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-secondary">Category</span>
              <select
                value={mediaForm.category}
                onChange={(e) => setMediaForm((f) => ({ ...f, category: e.target.value }))}
                className="rounded-md border border-border bg-surface-raised px-3 py-2.5 text-text focus:border-primary focus:outline-none"
              >
                {MEDIA_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-secondary">Type</span>
              <select
                value={mediaForm.media_type}
                onChange={(e) => setMediaForm((f) => ({ ...f, media_type: e.target.value }))}
                className="rounded-md border border-border bg-surface-raised px-3 py-2.5 text-text focus:border-primary focus:outline-none"
              >
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="link">Link</option>
              </select>
            </label>
            <div className="sm:col-span-2">
              <Input
                label="URL"
                required
                value={mediaForm.url}
                onChange={(e) => setMediaForm((f) => ({ ...f, url: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Description"
                value={mediaForm.description}
                onChange={(e) => setMediaForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            {mediaError && <p className="text-sm text-danger sm:col-span-2">{mediaError}</p>}
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" loading={savingMedia} className="flex-1">
                {editingMediaId ? "Save changes" : "Submit for approval"}
              </Button>
              {editingMediaId && (
                <Button type="button" variant="ghost" onClick={cancelEditMedia}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>
        <MySubmissions items={myMedia} emptyLabel="No media submitted yet." onEdit={startEditMedia} />
      </div>
    </div>
  );
}
