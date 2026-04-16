import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminSideBar from "../../Components/AdminSideBar";
import "./AdminMessages.css";

const STORAGE_KEY = "royal_admin_messages_v1";

const defaultMessages = () => [
  {
    id: "m1",
    from: "Jordan Lee",
    subject: "Question about brake estimate",
    body: "Hi, I got an estimate last week for front pads and rotors. Can you confirm if that includes labor?",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: false,
  },
  {
    id: "m2",
    from: "Maria Santos",
    subject: "Pickup time tomorrow",
    body: "What time should I plan to pick up my Camry tomorrow afternoon?",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    read: false,
  },
  {
    id: "m3",
    from: "Alex Kim",
    subject: "Thanks for the oil change",
    body: "Quick service and friendly staff. Appreciate it!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    read: true,
  },
  {
    id: "m4",
    from: "Pat Rivera",
    subject: "Insurance claim follow-up",
    body: "Body shop said they sent paperwork—did you receive it for claim #44291?",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    read: true,
  },
];

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    /* ignore */
  }
  return defaultMessages();
}

function saveStored(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const Messages = () => {
  const [messages, setMessages] = useState(() => loadStored());

  useEffect(() => {
    saveStored(messages);
  }, [messages]);

  const toggleRead = useCallback((id) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, read: !m.read } : m))
    );
  }, []);

  const { unreadSorted, readSorted } = useMemo(() => {
    const unread = messages.filter((m) => !m.read);
    const read = messages.filter((m) => m.read);
    const byNew = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
    unread.sort(byNew);
    read.sort(byNew);
    return { unreadSorted: unread, readSorted: read };
  }, [messages]);

  const renderColumn = (title, list, variant, emptyText) => (
    <section className="admin-messages-column" aria-label={title}>
      <div className={`admin-messages-column-head ${variant}`}>
        <span>{title}</span>
        <span className="admin-messages-badge">{list.length}</span>
      </div>
      {list.length === 0 ? (
        <div className="admin-messages-empty">{emptyText}</div>
      ) : (
        <ul className="admin-messages-list">
          {list.map((m) => (
            <li
              key={m.id}
              className={`admin-messages-item ${m.read ? "" : "unread-row"}`}
            >
              <div className="admin-messages-body">
                <div className="admin-messages-from">{m.from}</div>
                <div className="admin-messages-subject">{m.subject}</div>
                <div className="admin-messages-preview">{m.body}</div>
                <div className="admin-messages-meta">{formatDate(m.createdAt)}</div>
              </div>
              <div className="admin-messages-actions">
                <button
                  type="button"
                  className="admin-messages-toggle"
                  onClick={() => toggleRead(m.id)}
                  aria-label={m.read ? `Mark message from ${m.from} as unread` : `Mark message from ${m.from} as read`}
                >
                  {m.read ? "Mark unread" : "Mark read"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <div className="admin-messages-layout">
      <AdminSideBar />
      <main className="admin-messages-main">
        <div className="admin-messages-wrap">
          <header className="admin-messages-header">
            <div>
              <h1 className="admin-messages-title">Messages</h1>
              <p className="admin-messages-sub">
                Unread and read messages in two columns. Use the button on each row to switch status.
              </p>
            </div>
          </header>

          <div className="admin-messages-columns">
            {renderColumn("Unread", unreadSorted, "unread", "No unread messages.")}
            {renderColumn("Read", readSorted, "read", "No read messages yet.")}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
