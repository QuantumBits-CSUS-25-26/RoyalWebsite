import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import AdminSideBar from "../../Components/AdminSideBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faTrash,
  faSort,
  faCheck,
  faMagnifyingGlass,
  faXmark,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "../../config";
import "./AdminMessages.css";

const SORT_STORAGE_KEY = "admin_messages_sort";
const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { value: "date_desc", label: "Newest" },
  { value: "date_asc", label: "Oldest" },
  { value: "name_asc", label: "Name" },
  { value: "email_asc", label: "Email" },
];

const ORDERING_MAP = {
  date_desc: "-created_at",
  date_asc: "created_at",
  name_asc: "first_name,last_name",
  email_asc: "email",
};

function formatDate(iso) {
  if (!iso) return "";
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

function authHeaders(extra = {}) {
  const token =
    sessionStorage.getItem("authToken") ||
    localStorage.getItem("authToken");
  const headers = { Accept: "application/json", ...extra };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function describeHttpError(status) {
  if (status === 401 || status === 403) {
    return "You are not signed in as staff. Please log in again.";
  }
  return `Request failed (${status})`;
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "absolute";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(ta);
  }
}

// Presentational row
function MessageItem({ m, copiedId, onCopyEmail, onToggleRead, onDelete }) {
  const fullName =
    `${m.first_name || ""} ${m.last_name || ""}`.trim() || "(No name)";
  const isCopied = copiedId === m.message_id;
  return (
    <li className={`admin-messages-item ${m.read ? "" : "unread-row"}`}>
      <div className="admin-messages-body">
        <div className="admin-messages-from">{fullName}</div>
        <div className="admin-messages-contact">
          <span>{m.email}</span>
          {m.phone_number ? <span> - {m.phone_number}</span> : null}
        </div>
        <div className="admin-messages-preview">{m.message}</div>
        <div className="admin-messages-meta">
          <span>{formatDate(m.created_at)}</span>
          {m.response ? (
            <span className="admin-messages-flag flag-callback">
              Wants callback
            </span>
          ) : null}
          {m.current_customer ? (
            <span className="admin-messages-flag flag-customer">
              Current customer
            </span>
          ) : null}
        </div>
      </div>
      <div className="admin-messages-actions">
        <button
          type="button"
          className="admin-messages-toggle"
          onClick={onToggleRead}
          aria-label={
            m.read
              ? `Mark message from ${fullName} as unread`
              : `Mark message from ${fullName} as read`
          }
        >
          {m.read ? "Mark unread" : "Mark read"}
        </button>
        <button
          type="button"
          className="admin-messages-icon-btn"
          onClick={() => onCopyEmail(m)}
          aria-label={`Copy email for ${fullName}`}
          title={isCopied ? "Copied!" : "Copy email"}
        >
          <FontAwesomeIcon icon={isCopied ? faCheck : faCopy} />
        </button>
        <button
          type="button"
          className="admin-messages-icon-btn admin-messages-icon-btn-danger"
          onClick={onDelete}
          aria-label={`Delete message from ${fullName}`}
          title="Delete message"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </li>
  );
}

// Scrollable column with infinite scroll
const ScrollableColumn = forwardRef(function ScrollableColumn(
  {
    isRead,
    sortKey,
    searchQuery,
    copiedId,
    onCopyEmail,
    onToggleRead,
    onDelete,
  },
  ref
) {
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const sentinelRef = useRef(null);
  const fetchingRef = useRef(false);

  const ordering = ORDERING_MAP[sortKey] || "-created_at";

  useImperativeHandle(ref, () => ({
    removeItem(id) {
      setItems((prev) => prev.filter((m) => m.message_id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
    },
  }));

  const buildUrl = useCallback(
    (pageNum) => {
      const p = new URLSearchParams({
        read: String(isRead),
        ordering,
        page: pageNum,
        page_size: PAGE_SIZE,
      });
      if (searchQuery) p.set("search", searchQuery);
      return `${API_BASE_URL}/api/admin/messages/?${p}`;
    },
    [isRead, ordering, searchQuery]
  );

  // Initial / reset load when sort or search changes
  useEffect(() => {
    let cancelled = false;
    fetchingRef.current = true;
    setLoading(true);
    setError("");
    fetch(buildUrl(1), { headers: authHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error(describeHttpError(res.status));
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setItems(data.results || []);
        setTotalCount(data.count || 0);
        setHasMore(Boolean(data.has_next));
        setPage(1);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        fetchingRef.current = false;
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [buildUrl]);

  const loadMore = useCallback(() => {
    if (fetchingRef.current || !hasMore) return;
    const nextPage = page + 1;
    fetchingRef.current = true;
    setLoadingMore(true);
    fetch(buildUrl(nextPage), { headers: authHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error(describeHttpError(res.status));
        return res.json();
      })
      .then((data) => {
        setItems((prev) => [...prev, ...(data.results || [])]);
        setTotalCount(data.count || 0);
        setHasMore(Boolean(data.has_next));
        setPage(nextPage);
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        fetchingRef.current = false;
        setLoadingMore(false);
      });
  }, [buildUrl, hasMore, page]);

  // IntersectionObserver watches sentinel at bottom of list
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const title = isRead ? "Read" : "Unread";
  const variant = isRead ? "read" : "unread";
  const emptyText = searchQuery
    ? `No ${title.toLowerCase()} messages match your search.`
    : isRead
    ? "No read messages yet."
    : "No unread messages.";

  return (
    <section className="admin-messages-column" aria-label={title}>
      <div className={`admin-messages-column-head ${variant}`}>
        <span>{title}</span>
        <span className="admin-messages-badge">{totalCount}</span>
      </div>
      <div className="admin-messages-scroll">
        {error && (
          <div
            className="admin-messages-error admin-messages-error-inline"
            role="alert"
          >
            {error}
          </div>
        )}
        {loading ? (
          <div className="admin-messages-empty">
            <FontAwesomeIcon icon={faSpinner} spin /> Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="admin-messages-empty">{emptyText}</div>
        ) : (
          <ul className="admin-messages-list">
            {items.map((m) => (
              <MessageItem
                key={m.message_id}
                m={m}
                copiedId={copiedId}
                onCopyEmail={onCopyEmail}
                onToggleRead={() => onToggleRead(m)}
                onDelete={() => onDelete(m)}
              />
            ))}
            <li
              ref={sentinelRef}
              className="admin-messages-sentinel"
              aria-hidden="true"
            >
              {loadingMore && (
                <div className="admin-messages-load-more">
                  <FontAwesomeIcon icon={faSpinner} spin /> Loading more...
                </div>
              )}
            </li>
          </ul>
        )}
      </div>
    </section>
  );
});

const Messages = () => {
  const [sortKey, setSortKey] = useState(
    () => sessionStorage.getItem(SORT_STORAGE_KEY) || "date_desc"
  );
  const [copiedId, setCopiedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [searchRaw, setSearchRaw] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef(null);

  const unreadRef = useRef(null);
  const readRef = useRef(null);

  // Remount keys: force a column to refetch when a message moves into it
  const [unreadKey, setUnreadKey] = useState(0);
  const [readKey, setReadKey] = useState(0);

  useEffect(() => {
    sessionStorage.setItem(SORT_STORAGE_KEY, sortKey);
  }, [sortKey]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => setSearchQuery(searchRaw.trim()),
      300
    );
    return () => clearTimeout(debounceRef.current);
  }, [searchRaw]);

  const clearSearch = useCallback(() => {
    setSearchRaw("");
    setSearchQuery("");
  }, []);

  const handleToggleRead = useCallback((msg) => {
    // Optimistically remove from source column
    if (msg.read) {
      readRef.current?.removeItem(msg.message_id);
    } else {
      unreadRef.current?.removeItem(msg.message_id);
    }
    fetch(`${API_BASE_URL}/api/admin/messages/${msg.message_id}/`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ read: !msg.read }),
    }).then((res) => {
      if (!res.ok) return;
      // Refresh destination column so the moved message appears
      if (msg.read) {
        setUnreadKey((k) => k + 1);
      } else {
        setReadKey((k) => k + 1);
      }
    });
  }, []);

  const handleCopyEmail = useCallback(async (msg) => {
    try {
      await copyTextToClipboard(msg.email);
      setCopiedId(msg.message_id);
      setTimeout(
        () => setCopiedId((c) => (c === msg.message_id ? null : c)),
        1500
      );
    } catch {
      /* non-critical */
    }
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleting(true);
    setDeleteError("");
    fetch(`${API_BASE_URL}/api/admin/messages/${target.message_id}/`, {
      method: "DELETE",
      headers: authHeaders(),
    })
      .then((res) => {
        if (!res.ok && res.status !== 204)
          throw new Error(describeHttpError(res.status));
        unreadRef.current?.removeItem(target.message_id);
        readRef.current?.removeItem(target.message_id);
        setDeleteTarget(null);
      })
      .catch((err) => setDeleteError(err.message || "Failed to delete."))
      .finally(() => setDeleting(false));
  }, [deleteTarget]);

  return (
    <div className="admin-messages-layout">
      <AdminSideBar />
      <main className="admin-messages-main">
        <div className="admin-messages-wrap">

          <header className="admin-messages-header">
            <div>
              <h1 className="admin-messages-title">Messages</h1>
            </div>
            <div className="admin-messages-toolbar">
              <div className="admin-messages-search" role="search">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="admin-messages-search-icon"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  className="admin-messages-search-input"
                  placeholder="Search messages..."
                  value={searchRaw}
                  onChange={(e) => setSearchRaw(e.target.value)}
                  aria-label="Search messages"
                />
                {searchRaw ? (
                  <button
                    type="button"
                    className="admin-messages-search-clear"
                    onClick={clearSearch}
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                ) : null}
              </div>
              <div className="admin-messages-sort">
                <FontAwesomeIcon icon={faSort} aria-hidden="true" />
                <label
                  htmlFor="admin-messages-sort-select"
                  className="admin-messages-sort-label"
                >
                  Sort by
                </label>
                <select
                  id="admin-messages-sort-select"
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </header>

          <div className="admin-messages-columns">
            <ScrollableColumn
              key={`unread-${unreadKey}`}
              ref={unreadRef}
              isRead={false}
              sortKey={sortKey}
              searchQuery={searchQuery}
              copiedId={copiedId}
              onCopyEmail={handleCopyEmail}
              onToggleRead={handleToggleRead}
              onDelete={setDeleteTarget}
            />
            <ScrollableColumn
              key={`read-${readKey}`}
              ref={readRef}
              isRead={true}
              sortKey={sortKey}
              searchQuery={searchQuery}
              copiedId={copiedId}
              onCopyEmail={handleCopyEmail}
              onToggleRead={handleToggleRead}
              onDelete={setDeleteTarget}
            />
          </div>
        </div>
      </main>

      {deleteTarget ? (
        <div
          className="admin-modal-overlay"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleting) setDeleteTarget(null);
          }}
        >
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-message-title"
          >
            <div className="admin-modal-header" id="delete-message-title">
              Delete message?
            </div>
            <div className="admin-modal-body">
              Are you sure you want to delete the message from{" "}
              <strong>
                {`${deleteTarget.first_name || ""} ${
                  deleteTarget.last_name || ""
                }`.trim() || deleteTarget.email}
              </strong>
              ? This action cannot be undone.
              {deleteError && (
                <div
                  className="admin-messages-error"
                  style={{ marginTop: 8 }}
                >
                  {deleteError}
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-modal-btn-cancel"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-modal-btn-danger-confirm"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Messages;
