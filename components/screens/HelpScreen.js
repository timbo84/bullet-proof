"use client";

import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Button, Card, PageHeader, SectionTitle } from "@/components/ui";

const CONTACT_COPY = {
  Officer: "Got a question or need support? Reach your district chaplain, or message CJ directly.",
  Chaplain: "Got a question about the program? Message CJ directly.",
  Partner: "Got a question or need support? Message CJ directly.",
  Instructor: "Questions about uploads or your account? Message CJ directly.",
};

export function HelpScreen({ role }) {
  const { data: directoryData } = useSWR("/api/users/directory", fetcher);
  const { data: faqData } = useSWR("/api/program-pdf", fetcher);

  const director = directoryData?.users?.find((u) => u.role === "Director");

  return (
    <div className="space-y-6">
      <PageHeader title="Help" subtitle="Support and resources" />

      {role !== "Director" && (
        <Card className="space-y-3">
          <SectionTitle>Get support</SectionTitle>
          <p className="text-sm text-text">{CONTACT_COPY[role] || CONTACT_COPY.Officer}</p>
          {director && (
            <Link href={`/chat/${director.id}`}>
              <Button variant="outline">Message CJ</Button>
            </Link>
          )}
        </Card>
      )}

      {faqData?.pdf_url && (
        <a href={faqData.pdf_url} target="_blank" rel="noopener noreferrer">
          <Card className="flex items-center justify-between">
            <span className="font-semibold text-text">Open FAQ</span>
            <span className="text-primary">&rarr;</span>
          </Card>
        </a>
      )}
    </div>
  );
}
