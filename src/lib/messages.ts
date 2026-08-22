export function formatMessageDate(createdAt: string): string {
  return new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(createdAt));
}

export function messageRecipientLabel(recipients: string[]): string {
  return recipients
    .map((recipient) => {
      if (recipient === "all") {
        return "Alle";
      }

      if (recipient === "parents") {
        return "Foreldre";
      }

      return recipient;
    })
    .join(", ");
}
