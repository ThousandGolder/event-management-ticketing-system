import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ticket Management | Admin Dashboard",
  description: "Manage and track all ticket purchases and check-ins",
};

export default function TicketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
