import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, Loader2, ExternalLink } from "lucide-react";
import {
  sendChatMessage,
  generateMessageId,
  type ChatMessage,
} from "../services/chatService";

export default function ChatPanel() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    setError(null);
    setInput("");

    // Add user message
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { answer, sources } = await sendChatMessage(
        question,
        messages,
        i18n.language
      );

      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        role: "assistant",
        content: answer,
        sources,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setError(
        i18n.language === "fr"
          ? "Une erreur est survenue. Veuillez réessayer."
          : "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, i18n.language]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSourceClick = (sessionId: string) => {
    navigate(`/budget/${sessionId}`);
    setIsOpen(false);
  };

  // Greeting message shown when chat is first opened
  const greeting =
    i18n.language === "fr"
      ? "Bonjour ! Je suis votre assistant de donnees. Posez-moi des questions sur vos sessions — personnel, budget, exploitation, et plus encore."
      : "Hello! I'm your data assistant. Ask me questions about your sessions — personnel, budget, exploitation, and more.";

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95"
          aria-label={t("chat_open")}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[400px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-blue-600 px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-white" />
              <h3 className="text-sm font-semibold text-white">
                {t("chat_title")}
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              aria-label={t("chat_close")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {/* Greeting */}
            {messages.length === 0 && (
              <div className="mb-3 rounded-xl rounded-tl-sm bg-gray-100 px-3 py-2.5 text-sm text-gray-700">
                {greeting}
              </div>
            )}

            {/* Message Bubbles */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-tr-sm bg-blue-600 text-white"
                      : "rounded-tl-sm bg-gray-100 text-gray-800"
                  }`}
                >
                  {/* Render content with basic markdown-style line breaks */}
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Source citations */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 border-t border-gray-200 pt-2">
                      <p className="mb-1 text-xs font-medium text-gray-500">
                        {i18n.language === "fr" ? "Sources :" : "Sources:"}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {msg.sources.map((src) => (
                          <button
                            key={src.sessionId}
                            onClick={() => handleSourceClick(src.sessionId)}
                            className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-0.5 text-xs text-blue-600 transition-colors hover:bg-white hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {src.sessionName}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="mb-3 flex justify-start">
                <div className="flex items-center gap-2 rounded-xl rounded-tl-sm bg-gray-100 px-3 py-2.5 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {i18n.language === "fr" ? "Analyse en cours..." : "Analyzing..."}
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("chat_placeholder")}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={t("chat_send")}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
