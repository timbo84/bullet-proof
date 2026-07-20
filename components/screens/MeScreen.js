"use client";

import { useRef, useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/components/AuthProvider";
import { fetcher } from "@/lib/fetcher";
import { Avatar, Badge, Button, Card, Input, SectionTitle, Spinner, Textarea } from "@/components/ui";

export function MeScreen() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const { data } = useSWR("/api/rewards", fetcher);
  const rewards = data?.rewards ?? null;

  async function saveProfile(extra = {}) {
    setSaving(true);
    setError("");
    setSaved(false);
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname, bio, ...extra }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.detail || "Something went wrong.");
      return;
    }
    setUser(data.user);
    setSaved(true);
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setError("Please choose an image under 3MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => saveProfile({ photo: reader.result });
    reader.readAsDataURL(file);
  }

  if (!user) return <Spinner />;

  return (
    <div className="space-y-6">
      <Card className="flex flex-col items-center gap-3 text-center">
        <button onClick={() => fileInputRef.current?.click()} className="relative">
          <Avatar src={user.photo} name={user.full_name} size={88} />
          <span className="absolute inset-x-0 bottom-0 rounded-b-full bg-black/60 py-1 text-[10px] font-semibold text-white">
            Edit
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
        <div>
          <h1 className="text-lg font-bold text-text">{user.full_name}</h1>
          <p className="text-sm text-text-muted">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="primary">{user.role}</Badge>
          <Badge>{user.points ?? 0} pts</Badge>
        </div>
      </Card>

      <Card className="space-y-4">
        <SectionTitle>Profile</SectionTitle>
        <Input label="Nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        <Textarea
          label="Bio"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell your team a little about yourself…"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        {saved && <p className="text-sm text-success">Saved.</p>}
        <Button onClick={() => saveProfile()} loading={saving}>
          Save changes
        </Button>
      </Card>

      <Card className="space-y-3">
        <SectionTitle>Rewards</SectionTitle>
        {rewards === null && <Spinner />}
        {rewards?.length === 0 && <p className="text-sm text-text-muted">No rewards yet — keep going.</p>}
        <ul className="space-y-2">
          {rewards?.map((r) => (
            <li key={r.id} className="flex items-center justify-between text-sm">
              <span className="text-text">{r.label}</span>
              {r.value > 0 && <span className="font-semibold text-primary">${r.value}</span>}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
