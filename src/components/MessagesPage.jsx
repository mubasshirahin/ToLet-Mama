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
  const role = location.state?.role || "Student";
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);

  // Load conversations from API
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchConversations()
      .then((data) => {
        if (!cancelled) {
          const mapped = (Array.isArray(data) ? data : []).map((conv) => ({
            id: conv.user?.id || conv.id,
            name: conv.user?.name || "Unknown",
            role: conv.user?.role || "User",
            listing: conv.last_message?.listing?.title || "General",
            unread: conv.unread_count || 0,
            online: false,
            lastSeen: "Last seen recently",
            preview: conv.last_message?.body || "",
            time: conv.last_message?.created_at ? new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
            avatar: (conv.user?.name || "U").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2),
            accent: "bg-[#2C1810]",
            messages: [],
            _userId: conv.user?.id,
          }));
          setConversations(mapped);
          if (mapped.length > 0) setActiveConversationId(mapped[0].id);
        }
      })
      .catch(() => {
        if (!cancelled) setConversations([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [role]);

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
    }
  }, [activeConversationId, loadConversation]);

  const handleSend = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !activeConversation) return;

    try {
      await apiSendMessage({
        receiver_id: activeConversation._userId || activeConversation.id,
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
    <div className="min-h-screen bg-[#FAF3E0] text-[#2C1810]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(92,58,33,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(44,24,16,0.08),transparent_24%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header className="mb-4 flex flex-col gap-3 border-2 border-[#5C3A21]/20 bg-white p-4 shadow-[4px_4px_0px_rgba(44,24,16,0.05)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard", { state: { role } })}
              aria-label="Back to dashboard"
              className="mt-0.5 border-2 border-[#5C3A21]/20 p-2 text-[#5C3A21] transition-colors hover:border-[#2C1810] hover:text-[#2C1810]"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A89880]">Inbox</p>
              <h1 className="font-serif text-3xl font-black tracking-tight">Messages</h1>
              <p className="mt-1 font-serif text-sm text-[#5C3A21]">
                Student-owner conversations for listings, visits, and follow-ups.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 border-2 border-[#2C1810] bg-[#FAF3E0] px-3 py-2 font-serif text-xs font-bold uppercase tracking-[0.15em]">
              <Sparkles className="h-4 w-4" strokeWidth={1.8} />
              {totalUnread} unread
            </span>
            <span className="inline-flex items-center gap-2 border-2 border-[#5C3A21]/20 px-3 py-2 font-serif text-xs font-bold uppercase tracking-[0.15em] text-[#5C3A21]">
              <Users className="h-4 w-4" strokeWidth={1.8} />
              {role} view
            </span>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[360px_1fr]">
          <aside
            className={`${
              isMobileListOpen ? "block" : "hidden"
            } min-h-0 overflow-hidden border-2 border-[#5C3A21]/20 bg-white shadow-[4px_4px_0px_rgba(44,24,16,0.05)] lg:block`}
          >
            <div className="border-b-2 border-[#2C1810] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A89880]">
                    Conversation list
                  </p>
                  <h2 className="font-serif text-xl font-black">Inbox</h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard", { state: { role } })}
                  aria-label="Back to dashboard"
                  className="lg:hidden border-2 border-[#5C3A21]/20 p-2 text-[#5C3A21] transition-colors hover:border-[#2C1810] hover:text-[#2C1810]"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>

              <label className="mt-4 flex items-center gap-2 border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-3 py-2">
                <Search className="h-4 w-4 text-[#A89880]" strokeWidth={1.8} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search messages, names, listings"
                  className="w-full bg-transparent font-serif text-sm text-[#2C1810] outline-none placeholder:text-[#A89880]"
                />
              </label>

              <button
                type="button"
                onClick={() => setShowUnreadOnly((current) => !current)}
                aria-pressed={showUnreadOnly}
                className={`mt-3 inline-flex w-full items-center justify-between border-2 px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-colors ${
                  showUnreadOnly
                    ? "border-[#2C1810] bg-[#2C1810] text-[#FAF3E0]"
                    : "border-[#5C3A21]/20 bg-white text-[#5C3A21] hover:border-[#2C1810] hover:text-[#2C1810]"
                }`}
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
                <div className="divide-y divide-[#5C3A21]/10">
                  {filteredConversations.map((conversation) => {
                    const isActive = conversation.id === activeConversationId;

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => selectConversation(conversation.id)}
                        aria-current={isActive ? "true" : undefined}
                        className={`flex w-full gap-3 px-4 py-4 text-left transition-colors ${
                          isActive ? "bg-[#F4E8C1]" : "hover:bg-[#FAF3E0]"
                        }`}
                      >
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center border-2 border-[#2C1810] text-sm font-bold text-[#FAF3E0] ${conversation.accent}`}
                        >
                          {conversation.avatar}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-serif text-sm font-bold text-[#2C1810]">
                                {conversation.name}
                              </p>
                              <p className="truncate text-xs uppercase tracking-[0.15em] text-[#A89880]">
                                {conversation.role} - {conversation.listing}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-xs uppercase tracking-[0.15em] text-[#A89880]">
                                {conversation.time}
                              </p>
                              {conversation.unread > 0 && (
                                <span
                                  aria-label={`${conversation.unread} unread messages`}
                                  className="mt-1 inline-flex min-w-6 items-center justify-center border border-[#2C1810] bg-[#2C1810] px-1.5 py-0.5 text-xs font-bold text-[#FAF3E0]"
                                >
                                  {conversation.unread}
                                </span>
                              )}
                            </div>
                          </div>

                          <p
                            className={`mt-2 line-clamp-2 font-serif text-sm ${
                              isActive ? "text-[#2C1810]" : "text-[#5C3A21]"
                            }`}
                          >
                            {conversation.preview}
                          </p>

                          <div className="mt-3 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 border border-[#5C3A21]/20 px-2 py-0.5 text-xs uppercase tracking-[0.14em] text-[#5C3A21]">
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
            } min-h-0 flex-col overflow-hidden border-2 border-[#5C3A21]/20 bg-white shadow-[4px_4px_0px_rgba(44,24,16,0.05)] lg:flex`}
          >
            {!activeConversation ? (
              <div className="flex min-h-[70vh] flex-1 flex-col items-center justify-center p-8 text-center">
                <MessageSquareText className="h-12 w-12 text-[#A89880]" strokeWidth={1.5} />
                <h2 className="mt-4 font-serif text-2xl font-black">
                  {conversations.length === 0 ? "Your inbox is empty" : "Select a conversation"}
                </h2>
                <p className="mt-2 max-w-md font-serif text-sm text-[#5C3A21]">
                  {conversations.length === 0
                    ? "Once a student or owner reaches out, the full thread will appear here."
                    : "Pick a thread from the inbox to read messages, review status, and reply."}
                </p>
                <Link to="/dashboard" state={{ role }} className="btn-rubber-stamp mt-6 px-5 py-3 text-sm">
                  Back to dashboard
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b-2 border-[#2C1810] p-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsMobileListOpen(true)}
                      aria-label="Back to conversations"
                      className="lg:hidden border-2 border-[#5C3A21]/20 p-2 text-[#5C3A21] transition-colors hover:border-[#2C1810] hover:text-[#2C1810]"
                    >
                      <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                    </button>
                    <div
                      className={`flex h-12 w-12 items-center justify-center border-2 border-[#2C1810] text-sm font-bold text-[#FAF3E0] ${activeConversation.accent}`}
                    >
                      {activeConversation.avatar}
                    </div>
                    <div>
                      <p className="font-serif text-lg font-black">{activeConversation.name}</p>
                      <p className="font-serif text-xs uppercase tracking-[0.16em] text-[#A89880]">
                        {activeConversation.role} - {activeConversation.listing}
                      </p>
                    </div>
                  </div>

                  <div className="hidden items-center gap-2 lg:flex">
                    <span className="inline-flex items-center gap-2 border border-[#5C3A21]/20 px-3 py-2 text-xs uppercase tracking-[0.14em] text-[#5C3A21]">
                      <Clock3 className="h-4 w-4" strokeWidth={1.8} />
                      {activeConversation.online ? "Online" : activeConversation.lastSeen}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(250,243,224,0.35),rgba(255,255,255,0.95))] p-4 sm:p-6">
                  <div className="mx-auto flex max-w-4xl flex-col gap-4">
                    <div className="flex items-center justify-center">
                      <span className="border border-[#5C3A21]/20 bg-[#FAF3E0] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#A89880]">
                        Conversation started on listing inquiry
                      </span>
                    </div>

                    {activeConversation.messages.map((message) => (
                      <div key={message.id} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[min(36rem,85%)] border-2 px-4 py-3 shadow-[3px_3px_0px_rgba(44,24,16,0.05)] ${
                            message.sender === "me"
                              ? "border-[#2C1810] bg-[#2C1810] text-[#FAF3E0]"
                              : "border-[#5C3A21]/20 bg-white text-[#2C1810]"
                          }`}
                        >
                          <p className="font-serif text-sm leading-relaxed">{message.text}</p>
                          <div className="mt-2 flex items-center justify-between gap-3">
                            <span
                              className={`text-xs uppercase tracking-[0.16em] ${
                                message.sender === "me" ? "text-[#F4E8C1]/80" : "text-[#A89880]"
                              }`}
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

                <div className="border-t-2 border-[#2C1810] p-4">
                  <form onSubmit={handleSend} className="mx-auto flex max-w-4xl items-end gap-3">
                    <label className="flex-1">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#A89880]">
                        Reply
                      </span>
                      <textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        rows={2}
                        placeholder="Write a message..."
                        className="min-h-[72px] w-full resize-none border-2 border-[#5C3A21]/20 bg-[#FAF3E0] px-4 py-3 font-serif text-sm text-[#2C1810] outline-none transition-colors placeholder:text-[#A89880] focus:border-[#2C1810]"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={!draft.trim()}
                      className="btn-rubber-stamp flex-none px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" strokeWidth={2} />
                      Send
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
      <span className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.16em] text-[#A89880]">
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
    <span className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.16em] text-inherit">
      <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
      {meta.label}
    </span>
  );
}

function EmptyInboxState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <MessageSquareText className="h-12 w-12 text-[#A89880]" strokeWidth={1.4} />
      <h3 className="mt-4 font-serif text-2xl font-black text-[#2C1810]">{title}</h3>
      <p className="mt-2 max-w-sm font-serif text-sm text-[#5C3A21]">{description}</p>
    </div>
  );
}

function MessagesSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAF3E0] px-4 py-4 text-[#2C1810] sm:px-6 lg:px-8 lg:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-4">
        <div className="animate-pulse border-2 border-[#5C3A21]/20 bg-white p-4 shadow-[4px_4px_0px_rgba(44,24,16,0.05)]">
          <div className="h-3 w-24 bg-[#5C3A21]/10" />
          <div className="mt-3 h-8 w-48 bg-[#5C3A21]/10" />
          <div className="mt-3 h-4 w-80 max-w-full bg-[#5C3A21]/10" />
        </div>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[360px_1fr]">
          <div className="animate-pulse border-2 border-[#5C3A21]/20 bg-white p-4 shadow-[4px_4px_0px_rgba(44,24,16,0.05)]">
            <div className="h-4 w-28 bg-[#5C3A21]/10" />
            <div className="mt-4 h-11 bg-[#5C3A21]/10" />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-3">
                  <div className="h-12 w-12 bg-[#5C3A21]/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 bg-[#5C3A21]/10" />
                    <div className="h-3 w-full bg-[#5C3A21]/10" />
                    <div className="h-3 w-5/6 bg-[#5C3A21]/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-pulse border-2 border-[#5C3A21]/20 bg-white p-4 shadow-[4px_4px_0px_rgba(44,24,16,0.05)]">
            <div className="h-16 border-b-2 border-[#2C1810] bg-[#5C3A21]/10" />
            <div className="flex min-h-[42vh] flex-col gap-4 p-4">
              <div className="ml-auto h-16 w-2/3 bg-[#5C3A21]/10" />
              <div className="h-16 w-2/3 bg-[#5C3A21]/10" />
              <div className="ml-auto h-16 w-1/2 bg-[#5C3A21]/10" />
            </div>
            <div className="border-t-2 border-[#2C1810] p-4">
              <div className="h-20 bg-[#5C3A21]/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;
