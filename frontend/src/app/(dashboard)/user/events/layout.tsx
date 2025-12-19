import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Details | Ticketing System",
  description: "View event details and purchase tickets",
};

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
