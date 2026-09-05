import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchConversations, fetchConversation, sendMessage as apiSendMessage } from "../lib/api";
import {
  ArrowLeft,
  CheckCheck,
  Clock3,
  Inbox,
  MessageSquareText,
  Search,
  Send,
  Sparkles,
  Users,
} from "lucide-react";

function MessagesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = useMemo(() => {
    try { const u = JSON.parse(localStorage.getItem("toletmama.api_user") || "{}"); return u.role === 'owner' ? 'Owner' : 'Student'; } catch { return location.state?.role || "Student"; }
  }, [location.state?.role]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);

  // Load conversations from API with polling for real-time
  useEffect(() => {
    let cancelled = false;
    let interval;
    const load = () => {
      fetchConversations()
        .then((data) => {
          if (cancelled) return;
          const mapped = (Array.isArray(data) ? data : []).map((conv) => ({
            id: conv.user?.id || conv.id,
            name: conv.user?.name || "Unknown",
            role: conv.user?.role ? (conv.user.role === 'owner' ? 'Owner' : 'Student') : "User",
            listing: conv.last_message?.listing?.title || "General",
            listingId: conv.last_message?.listing_id || conv.last_message?.listing?.id || null,
            unread: conv.unread_count || 0,
            online: false,
            lastSeen: "Last seen recently",
            preview: conv.last_message?.body || "",
            time: conv.last_message?.created_at ? new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
            avatar: (conv.user?.name || "U").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2),
            accent: "var(--theme-ink)",
            messages: [],
            _userId: conv.user?.id,
          }));
          setConversations((prev) => {
            // Preserve already loaded messages for active conversation
            const prevMap = new Map(prev.map(p=>[p.id,p]));
            const next = mapped.map(m => {
              const p = prevMap.get(m.id);
              return p ? { ...m, messages: p.messages } : m;
            });
            if (prev.length === 0 && next.length > 0) {
              setActiveConversationId(next[0].id);
            }
            return next;
          });
        })
        .catch(() => { if (!cancelled) setConversations([]); })
        .finally(() => { if (!cancelled) setIsLoading(false); });
    };
    setIsLoading(true);
    load();
    interval = setInterval(load, 3000); // real-time poll every 3s
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, [role]);

  useEffect(() => {
    setIsMobileListOpen(true);
    setShowUnreadOnly(false);
    setQuery("");
    setDraft("");
  }, [role]);

  const filteredConversations = useMemo(() => {
    const term = query.trim().toLowerCase();
    const inbox = showUnreadOnly ? conversations.filter((conversation) => conversation.unread > 0) : conversations;
    if (!term) return inbox;

    return inbox.filter((conversation) => {
      const haystack = [
        conversation.name,
        conversation.role,
        conversation.listing,
        conversation.preview,
        conversation.messages.map((message) => message.text).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [conversations, query, showUnreadOnly]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) || null,
    [activeConversationId, conversations]
  );

  const totalUnread = conversations.reduce((count, conversation) => count + conversation.unread, 0);
  const unreadConversationCount = conversations.filter((conversation) => conversation.unread > 0).length;

  useEffect(() => {
    if (!activeConversationId || isLoading) return;

    const isDesktop = typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop && isMobileListOpen) return;

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeConversationId && conversation.unread > 0
          ? { ...conversation, unread: 0 }
          : conversation
      )
    );
  }, [activeConversationId, isLoading, isMobileListOpen]);

  const selectConversation = (conversationId) => {
    setActiveConversationId(conversationId);
    setIsMobileListOpen(false);
  };

  const loadConversation = useCallback(async (userId) => {
    try {
      const messages = await fetchConversation(userId);
      setConversations((current) =>
        current.map((conv) =>
          conv.id === userId || conv._userId === userId
            ? {
                ...conv,
                unread: 0,
                messages: (Array.isArray(messages) ? messages : []).map((msg) => ({
                  id: msg.id,
                  sender: msg.sender_id === userId ? "them" : "me",
                  text: msg.body,
                  time: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  status: msg.read ? "read" : "delivered",
                })),
              }
            : conv
        )
      );
    } catch {
      // Ignore errors for now
    }
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      loadConversation(activeConversationId);
      const interval = setInterval(() => loadConversation(activeConversationId), 1500);
      return () => clearInterval(interval);
    }
  }, [activeConversationId, loadConversation]);

  const handleSend = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !activeConversation) return;

    try {
      await apiSendMessage({
        receiver_id: activeConversation._userId || activeConversation.id,
        listing_id: activeConversation.listingId || undefined,
        body: text,
      });

      const sentMessage = {
        id: Date.now(),
        sender: "me",
        text,
        time: "Just now",
        status: "sent",
      };

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversation.id
            ? {
                ...conversation,
                unread: 0,
                preview: text,
                time: "Just now",
                messages: [...conversation.messages, sentMessage],
              }
            : conversation
        )
      );
      setDraft("");
    } catch {
      setDraft("");
    }
  };

  if (isLoading) {
    return <MessagesSkeleton />;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--theme-bg)", color: "var(--theme-ink)" }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at top left, color-mix(in srgb, var(--theme-ink-muted) 12%, transparent), transparent 28%), radial-gradient(circle at top right, color-mix(in srgb, var(--theme-ink) 8%, transparent), transparent 24%)" }} />

      <div className="relative mx-auto flex min-h-screen w-full max-w-screen-xl flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header className="mb-4 flex flex-col gap-3 glass-pane rounded-3xl p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard", { state: { role } })}
              aria-label="Back to dashboard"
              className="mt-0.5 rounded-full p-2 transition-colors"
              style={{ border: "1px solid var(--theme-border-strong)", color: "var(--theme-ink-muted)" }}
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <div>
              <p className="font-serif text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--theme-ink-muted)" }}>Inbox</p>
              <h1 className="font-serif text-3xl font-black tracking-tight">Messages</h1>
              <p className="mt-1 font-serif text-sm" style={{ color: "var(--theme-ink-muted)" }}>
                Student-owner conversations for listings, visits, and follow-ups.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-serif text-xs font-bold uppercase tracking-[0.15em]" style={{ border: "1px solid var(--theme-border-strong)", background: "var(--theme-surface)" }}>
              <Sparkles className="h-4 w-4" strokeWidth={1.8} />
              {totalUnread} unread
            </span>
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-serif text-xs font-bold uppercase tracking-[0.15em]" style={{ color: "var(--theme-ink-muted)" }}>
              <Users className="h-4 w-4" strokeWidth={1.8} />
              {role} view
            </span>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[360px_1fr]">
          <aside
            className={`${
              isMobileListOpen ? "block" : "hidden"
            } min-h-0 overflow-hidden glass-pane rounded-2xl lg:block`}
          >
            <div className="border-b p-4" style={{ borderColor: "var(--theme-border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-serif text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--theme-ink-muted)" }}>
                    Conversation list
                  </p>
                  <h2 className="font-serif text-xl font-black">Inbox</h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard", { state: { role } })}
                  aria-label="Back to dashboard"
                  className="lg:hidden rounded-full p-2 transition-colors"
                  style={{ border: "1px solid var(--theme-border-strong)", color: "var(--theme-ink-muted)" }}
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>

              <label className="mt-4 flex items-center gap-2 rounded-full px-3 py-2" style={{ background: "var(--theme-surface)", border: "1px solid var(--theme-border)" }}>
                <Search className="h-4 w-4" strokeWidth={1.8} style={{ color: "var(--theme-ink-faded)" }} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search messages, names, listings"
                  className="w-full bg-transparent font-serif text-sm outline-none placeholder:opacity-60"
                  style={{ color: "var(--theme-ink)" }}
                />
              </label>

              <button
                type="button"
                onClick={() => setShowUnreadOnly((current) => !current)}
                aria-pressed={showUnreadOnly}
                className="mt-3 inline-flex w-full items-center justify-between rounded-full px-3 py-2 font-serif text-xs font-bold uppercase tracking-[0.15em] transition-colors"
                style={
                  showUnreadOnly
                    ? { background: "var(--theme-ink)", color: "var(--theme-bg)" }
                    : { border: "1px solid var(--theme-border)", color: "var(--theme-ink-muted)" }
                }
              >
                <span>Unread only</span>
                <span>{unreadConversationCount}</span>
              </button>
            </div>

            <div className="max-h-[calc(100vh-13rem)] overflow-y-auto">
              {conversations.length === 0 ? (
                <EmptyInboxState
                  title="No conversations yet"
                  description="New chats will appear here when someone messages you about a listing."
                />
              ) : filteredConversations.length === 0 ? (
                <EmptyInboxState
                  title="No matches found"
                  description="Try a different name, listing title, or message snippet."
                />
              ) : (
                <div className="divide-y" style={{ borderColor: "var(--theme-border)" }}>
                  {filteredConversations.map((conversation) => {
                    const isActive = conversation.id === activeConversationId;

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => selectConversation(conversation.id)}
                        aria-current={isActive ? "true" : undefined}
                        className="flex w-full gap-3 px-4 py-4 text-left transition-colors"
                        style={isActive ? { background: "var(--theme-surface-2)" } : {}}
                      >
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-sm font-bold"
                          style={{ borderColor: "var(--theme-ink)", background: "var(--theme-ink)", color: "var(--theme-bg)" }}
                        >
                          {conversation.avatar}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-serif text-sm font-bold" style={{ color: "var(--theme-ink)" }}>
                                {conversation.name}
                              </p>
                              <p className="truncate font-serif text-xs uppercase tracking-[0.15em]" style={{ color: "var(--theme-ink-faded)" }}>
                                {conversation.role} - {conversation.listing}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="font-serif text-xs uppercase tracking-[0.15em]" style={{ color: "var(--theme-ink-faded)" }}>
                                {conversation.time}
                              </p>
                              {conversation.unread > 0 && (
                                <span
                                  aria-label={`${conversation.unread} unread messages`}
                                  className="mt-1 inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold"
                                  style={{ background: "var(--theme-ink)", color: "var(--theme-bg)" }}
                                >
                                  {conversation.unread}
                                </span>
                              )}
                            </div>
                          </div>

                          <p
                            className="mt-2 line-clamp-2 font-serif text-sm"
                            style={{ color: isActive ? "var(--theme-ink)" : "var(--theme-ink-muted)" }}
                          >
                            {conversation.preview}
                          </p>

                          <div className="mt-3 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-serif text-xs uppercase tracking-[0.14em]" style={{ border: "1px solid var(--theme-border)", color: "var(--theme-ink-muted)" }}>
                              <Inbox className="h-3.5 w-3.5" strokeWidth={1.8} />
                              {conversation.online ? "Active" : conversation.lastSeen}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          <section
            className={`${
              isMobileListOpen ? "hidden" : "flex"
            } min-h-0 flex-col overflow-hidden glass-pane rounded-2xl lg:flex`}
          >
            {!activeConversation ? (
              <div className="flex min-h-[70vh] flex-1 flex-col items-center justify-center p-8 text-center">
                <MessageSquareText className="h-12 w-12" strokeWidth={1.5} style={{ color: "var(--theme-ink-faded)" }} />
                <h2 className="mt-4 font-serif text-2xl font-black">
                  {conversations.length === 0 ? "Your inbox is empty" : "Select a conversation"}
                </h2>
                <p className="mt-2 max-w-md font-serif text-sm" style={{ color: "var(--theme-ink-muted)" }}>
                  {conversations.length === 0
                    ? "Once a student or owner reaches out, the full thread will appear here."
                    : "Pick a thread from the inbox to read messages, review status, and reply."}
                </p>
                <Link
                  to="/dashboard"
                  state={{ role }}
                  className="mt-6 rounded-full px-5 py-3 font-serif text-sm font-bold uppercase tracking-[0.15em]"
                  style={{ background: "var(--theme-ink)", color: "var(--theme-bg)" }}
                >
                  Back to dashboard
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b p-4" style={{ borderColor: "var(--theme-border)" }}>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsMobileListOpen(true)}
                      aria-label="Back to conversations"
                      className="lg:hidden rounded-full p-2 transition-colors"
                      style={{ border: "1px solid var(--theme-border-strong)", color: "var(--theme-ink-muted)" }}
                    >
                      <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                    </button>
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full border text-sm font-bold"
                      style={{ borderColor: "var(--theme-ink)", background: "var(--theme-ink)", color: "var(--theme-bg)" }}
                    >
                      {activeConversation.avatar}
                    </div>
                    <div>
                      <p className="font-serif text-lg font-black">{activeConversation.name}</p>
                      <p className="font-serif text-xs uppercase tracking-[0.16em]" style={{ color: "var(--theme-ink-faded)" }}>
                        {activeConversation.role} - {activeConversation.listing}
                      </p>
                    </div>
                  </div>

                  <div className="hidden items-center gap-2 lg:flex">
                    <span className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-serif text-xs uppercase tracking-[0.14em]" style={{ border: "1px solid var(--theme-border)", color: "var(--theme-ink-muted)" }}>
                      <Clock3 className="h-4 w-4" strokeWidth={1.8} />
                      {activeConversation.online ? "Online" : activeConversation.lastSeen}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--theme-surface) 35%, transparent), var(--theme-surface))" }}>
                  <div className="mx-auto flex max-w-4xl flex-col gap-4">
                    <div className="flex items-center justify-center">
                      <span className="rounded-full px-3 py-1 font-serif text-xs uppercase tracking-[0.18em]" style={{ border: "1px solid var(--theme-border)", background: "var(--theme-surface)", color: "var(--theme-ink-faded)" }}>
                        Conversation started on listing inquiry
                      </span>
                    </div>

                    {activeConversation.messages.map((message) => (
                      <div key={message.id} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
                        <div
                          className="max-w-[min(36rem,85%)] rounded-2xl px-4 py-3"
                          style={
                            message.sender === "me"
                              ? { background: "var(--theme-ink)", color: "var(--theme-bg)" }
                              : { background: "var(--theme-surface)", border: "1px solid var(--theme-border)", color: "var(--theme-ink)" }
                          }
                        >
                          <p className="font-serif text-sm leading-relaxed">{message.text}</p>
                          <div className="mt-2 flex items-center justify-between gap-3">
                            <span
                              className="font-serif text-xs uppercase tracking-[0.16em]"
                              style={{
                                color: message.sender === "me" ? "rgba(244,232,193,0.7)" : "var(--theme-ink-faded)",
                              }}
                            >
                              {message.time}
                            </span>
                            <MessageMeta message={message} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t p-4" style={{ borderColor: "var(--theme-border)" }}>
                  <form onSubmit={handleSend} className="mx-auto flex max-w-4xl items-end gap-3">
                    <label className="flex-1">
                      <span className="mb-2 block font-serif text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--theme-ink-faded)" }}>
                        Reply
                      </span>
                      <textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        rows={2}
                        placeholder="Write a message..."
                        className="w-full resize-none rounded-2xl px-4 py-3 font-serif text-sm outline-none transition-colors placeholder:opacity-60"
                        style={{ background: "var(--theme-surface)", color: "var(--theme-ink)", border: "1px solid var(--theme-border)" }}
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={!draft.trim()}
                      className="shrink-0 rounded-full px-5 py-3 font-serif text-sm font-bold uppercase tracking-[0.15em] disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ background: "var(--theme-ink)", color: "var(--theme-bg)" }}
                    >
                      <Send className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </form>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function MessageMeta({ message }) {
  if (message.sender !== "me") {
    return (
      <span className="inline-flex items-center gap-1 font-serif text-xs uppercase tracking-[0.16em]" style={{ color: "var(--theme-ink-faded)" }}>
        <Inbox className="h-3.5 w-3.5" strokeWidth={1.8} />
        Received
      </span>
    );
  }

  const statusMap = {
    sent: { label: "Sent", icon: Clock3 },
    delivered: { label: "Delivered", icon: CheckCheck },
    read: { label: "Read", icon: CheckCheck },
  };
  const meta = statusMap[message.status] || statusMap.sent;
  const Icon = meta.icon;

  return (
    <span className="inline-flex items-center gap-1 font-serif text-xs uppercase tracking-[0.16em] text-inherit">
      <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
      {meta.label}
    </span>
  );
}

function EmptyInboxState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <MessageSquareText className="h-12 w-12" strokeWidth={1.4} style={{ color: "var(--theme-ink-faded)" }} />
      <h3 className="mt-4 font-serif text-2xl font-black" style={{ color: "var(--theme-ink)" }}>{title}</h3>
      <p className="mt-2 max-w-sm font-serif text-sm" style={{ color: "var(--theme-ink-muted)" }}>{description}</p>
    </div>
  );
}

function MessagesSkeleton() {
  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8 lg:py-6" style={{ background: "var(--theme-bg)", color: "var(--theme-ink)" }}>
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-screen-xl flex-col gap-4">
        <div className="animate-pulse glass-pane rounded-3xl p-4">
          <div className="h-3 w-24 rounded-full" style={{ background: "var(--theme-border)" }} />
          <div className="mt-3 h-8 w-48 rounded-full" style={{ background: "var(--theme-border)" }} />
          <div className="mt-3 h-4 w-80 max-w-full rounded-full" style={{ background: "var(--theme-border)" }} />
        </div>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[360px_1fr]">
          <div className="animate-pulse glass-pane rounded-2xl p-4">
            <div className="h-4 w-28 rounded-full" style={{ background: "var(--theme-border)" }} />
            <div className="mt-4 h-11 rounded-full" style={{ background: "var(--theme-border)" }} />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-3">
                  <div className="h-12 w-12 rounded-full" style={{ background: "var(--theme-border)" }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded-full" style={{ background: "var(--theme-border)" }} />
                    <div className="h-3 w-full rounded-full" style={{ background: "var(--theme-border)" }} />
                    <div className="h-3 w-5/6 rounded-full" style={{ background: "var(--theme-border)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-pulse glass-pane rounded-2xl p-4">
            <div className="h-16 border-b" style={{ borderColor: "var(--theme-border)", background: "var(--theme-border)" }} />
            <div className="flex min-h-[42vh] flex-col gap-4 p-4">
              <div className="ml-auto h-16 w-2/3 rounded-2xl" style={{ background: "var(--theme-border)" }} />
              <div className="h-16 w-2/3 rounded-2xl" style={{ background: "var(--theme-border)" }} />
              <div className="ml-auto h-16 w-1/2 rounded-2xl" style={{ background: "var(--theme-border)" }} />
            </div>
            <div className="border-t p-4" style={{ borderColor: "var(--theme-border)" }}>
              <div className="h-20 rounded-2xl" style={{ background: "var(--theme-border)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;
