"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Loader2, Check } from "lucide-react";
import { useTranslation } from "@/components/I18nProvider";

const RATINGS = [
  { value: 1, emoji: "😞", label: "Not great" },
  { value: 2, emoji: "😐", label: "Okay" },
  { value: 3, emoji: "🙂", label: "Good" },
  { value: 4, emoji: "😊", label: "Great" },
  { value: 5, emoji: "🤩", label: "Amazing" },
];

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = useCallback(async () => {
    if (!rating) return;
    setLoading(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || null }),
      });
      setSubmitted(true);
    } catch {
      // Silently fail — feedback is non-critical
    } finally {
      setLoading(false);
    }
  }, [rating, comment]);

  const handleReset = () => {
    setOpen(false);
    setRating(null);
    setComment("");
    setSubmitted(false);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-copper text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Give feedback"
      >
        <MessageSquare size={20} />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleReset}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-20 right-6 z-[70] w-[360px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-2xl p-6"
            >
              {/* Close */}
              <button
                onClick={handleReset}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
              >
                <X size={14} />
              </button>

              {submitted ? (
                /* Success state */
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-4 py-6"
                >
                  <motion.div
                    className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.4 }}
                  >
                    <Check size={28} className="text-emerald-500" />
                  </motion.div>
                  <p className="text-lg font-bold text-foreground">{t("feedback.thank_you")}</p>
                  <p className="text-sm text-muted-foreground text-center">{t("feedback.thank_you_desc")}</p>
                </motion.div>
              ) : (
                /* Feedback form */
                <div className="space-y-5">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{t("feedback.title")}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{t("feedback.subtitle")}</p>
                  </div>

                  {/* Star ratings */}
                  <div className="flex justify-center gap-2">
                    {RATINGS.map((r) => (
                      <motion.button
                        key={r.value}
                        onClick={() => setRating(r.value)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                          rating === r.value
                            ? "bg-copper/10 border border-copper/30 scale-110"
                            : "hover:bg-muted border border-transparent"
                        }`}
                      >
                        <span className="text-2xl">{r.emoji}</span>
                        <span className="text-[10px] font-medium text-muted-foreground">{r.label}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Comment */}
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t("feedback.placeholder")}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-copper/30 focus:border-copper/50 transition-all"
                  />

                  {/* Submit */}
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!rating || loading}
                    className={`w-full py-2.5 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                      rating && !loading
                        ? "bg-copper text-primary-foreground hover:opacity-90"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                    whileHover={rating && !loading ? { scale: 1.02 } : {}}
                    whileTap={rating && !loading ? { scale: 0.98 } : {}}
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={14} />
                        {t("feedback.submit")}
                      </>
                    )}
                  </motion.button>

                  <p className="text-center text-[11px] text-muted-foreground">
                    {t("feedback.privacy")}
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
