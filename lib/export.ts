export interface LeadRow {
  id: string;
  business_type: string;
  brand_name: string;
  email_content: string;
  score: number;
  tier: string;
  reason: string;
  intent: string;
  urgency: string;
  budget_signal: string;
  drafted_reply: string;
  next_steps: string[];
  created_at: string;
}

export function generateCSV(leads: LeadRow[]): string {
  const headers = [
    "Date",
    "Brand",
    "Business Type",
    "Score",
    "Tier",
    "Intent",
    "Urgency",
    "Budget Signal",
    "Reason",
    "Email Preview",
    "Reply Preview",
  ];

  const escapeCSV = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = leads.map((lead) => {
    const date = new Date(lead.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return [
      escapeCSV(date),
      escapeCSV(lead.brand_name),
      escapeCSV(lead.business_type),
      escapeCSV(lead.score),
      escapeCSV(lead.tier),
      escapeCSV(lead.intent),
      escapeCSV(lead.urgency),
      escapeCSV(lead.budget_signal),
      escapeCSV(lead.reason),
      escapeCSV(lead.email_content.slice(0, 120)),
      escapeCSV(lead.drafted_reply.slice(0, 120)),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
