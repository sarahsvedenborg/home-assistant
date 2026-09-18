import { AddButton } from "@/components/add-button";
import { MarkMessageUnreadButton } from "@/components/mark-message-unread-button";
import { ShortMessageForm } from "@/components/short-message-form";
import { getFamilyMembers, getShortMessages } from "@/lib/data";
import { formatMessageDate, messageRecipientLabel } from "@/lib/messages";
import type { ShortMessage } from "@/lib/types";

function MessageArchive({
  messages,
  emptyText,
}: {
  messages: ShortMessage[];
  emptyText: string;
}) {
  if (messages.length === 0) {
    return <p className="messageArchiveEmpty">{emptyText}</p>;
  }

  return (
    <div className="messageArchive">
      {messages.map((message) => (
        <article className="itemCard messageArchiveItem" key={message.id}>
          {message.createdAt ? (
            <time className="messageDate" dateTime={message.createdAt}>
              {formatMessageDate(message.createdAt)}
            </time>
          ) : null}
          <strong>{message.text}</strong>
          {message.sender ? (
            <span className="itemMeta">
              Fra: {messageRecipientLabel([message.sender])}
            </span>
          ) : null}
          {message.recipients.length > 0 ? (
            <span className="itemMeta">
              Til: {messageRecipientLabel(message.recipients)}
            </span>
          ) : null}
          {message.isRead ? (
            <MarkMessageUnreadButton messageId={message.id} />
          ) : null}
        </article>
      ))}
    </div>
  );
}

export default async function MeldingerPage() {
  const [familyMembers, messages] = await Promise.all([
    getFamilyMembers(),
    getShortMessages(),
  ]);
  const unreadMessages = messages.filter((message) => !message.isRead);
  const readMessages = messages.filter((message) => message.isRead);

  return (
    <main className="shell messagesShell">
      <header className="issueBoardToolbar">
        <div>
          <h1>Meldinger</h1>
        </div>
      </header>

      <section className="listStack">
        <div className="messageArchiveGroups">
          <section className="messageArchiveSection" aria-labelledby="unread-messages-title">
            <h2 id="unread-messages-title">Ulest</h2>
            <MessageArchive
              messages={unreadMessages}
              emptyText="Ingen uleste meldinger."
            />
          </section>

          <section className="messageArchiveSection" aria-labelledby="read-messages-title">
            <h2 id="read-messages-title">Lest</h2>
            <MessageArchive
              messages={readMessages}
              emptyText="Ingen leste meldinger."
            />
          </section>
        </div>
      </section>

      <AddButton
        title="Ny melding"
        label="Ny melding"
        anchor="add-message"
        hideTriggerOnMobile
        modalClassName="formModalMessages"
      >
        <ShortMessageForm familyMembers={familyMembers.map((member) => member.name)} />
      </AddButton>
    </main>
  );
}
