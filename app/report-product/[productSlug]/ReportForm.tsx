"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  AlertTriangle,
  Baby,
  HelpCircle,
  ImagePlus,
  X,
  Loader2,
} from "lucide-react";
import {
  submitProductReport,
  uploadReportAttachment,
  type ProductReportReason,
} from "@/lib/api";

interface ReasonOption {
  value: ProductReportReason;
  label: string;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
}

const REASONS: ReasonOption[] = [
  {
    value: "trademark",
    label: "It violates a trademark",
    helper:
      "Logo, brand name, or copyrighted artwork that the seller doesn't own.",
    icon: ShieldAlert,
  },
  {
    value: "community_standards",
    label: "It violates our community standards",
    helper:
      "Hateful, sexual, violent, or otherwise abusive content.",
    icon: AlertTriangle,
  },
  {
    value: "unsuitable_for_kids",
    label: "It's unsuitable for kids products",
    helper: "Adult themes on items marketed to children.",
    icon: Baby,
  },
  {
    value: "other",
    label: "Other",
    helper: "Tell us what's wrong below — at least a sentence.",
    icon: HelpCircle,
  },
];

const MAX_ATTACHMENTS = 3;
const MAX_FILE_BYTES = 8 * 1024 * 1024; // matches backend cap
const ALLOWED_MIMES = ["image/png", "image/jpeg", "image/webp"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Attachment {
  id: string;
  name: string;
  status: "uploading" | "ready" | "error";
  localPreview: string;
  url?: string;
  error?: string;
}

interface FieldErrors {
  reason?: string;
  comments?: string;
  name?: string;
  email?: string;
  attachments?: string;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function ReportForm({ productId }: { productId: number }) {
  const [reason, setReason] = useState<ProductReportReason>("trademark");
  const [comments, setComments] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (reason === "other" && comments.trim().length < 10) {
      next.comments =
        'Please describe the issue (at least 10 characters) when selecting "Other".';
    }
    if (name.trim().length < 2) {
      next.name = "Enter your name (at least 2 characters).";
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }
    const stillUploading = attachments.some((a) => a.status === "uploading");
    if (stillUploading) {
      next.attachments = "Wait for uploads to finish.";
    }
    return next;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (remaining <= 0) {
      setErrors((e) => ({
        ...e,
        attachments: `Maximum ${MAX_ATTACHMENTS} attachments.`,
      }));
      return;
    }
    const slice = Array.from(files).slice(0, remaining);
    for (const file of slice) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      if (!ALLOWED_MIMES.includes(file.type)) {
        setAttachments((prev) => [
          ...prev,
          {
            id,
            name: file.name,
            status: "error",
            localPreview: "",
            error: "Unsupported file type (JPG/PNG/WEBP only).",
          },
        ]);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        setAttachments((prev) => [
          ...prev,
          {
            id,
            name: file.name,
            status: "error",
            localPreview: "",
            error: "File exceeds 8MB.",
          },
        ]);
        continue;
      }

      const localPreview = URL.createObjectURL(file);
      setAttachments((prev) => [
        ...prev,
        { id, name: file.name, status: "uploading", localPreview },
      ]);

      try {
        const dataUrl = await fileToDataUrl(file);
        const { url } = await uploadReportAttachment(dataUrl);
        setAttachments((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, status: "ready", url } : a,
          ),
        );
        setErrors((e) => ({ ...e, attachments: undefined }));
      } catch (err) {
        console.error(err);
        setAttachments((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, status: "error", error: "Upload failed." }
              : a,
          ),
        );
      }
    }
    // Reset input so the same file can be re-picked after removal.
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target?.localPreview) URL.revokeObjectURL(target.localPreview);
      return prev.filter((a) => a.id !== id);
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    setServerError(null);
    const readyAttachments = attachments
      .filter((a) => a.status === "ready" && a.url)
      .map((a) => a.url!) as string[];
    try {
      await submitProductReport(productId, {
        reason,
        comments: comments.trim() || undefined,
        name: name.trim(),
        email: email.trim(),
        attachments: readyAttachments.length ? readyAttachments : undefined,
      });
      setSent(true);
      // Free object URLs once we're past submission.
      attachments.forEach((a) => a.localPreview && URL.revokeObjectURL(a.localPreview));
    } catch (err) {
      console.error(err);
      setServerError(
        err instanceof Error
          ? err.message
          : "We couldn't submit your report. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white rounded-3xl p-8 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle className="w-7 h-7 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Thanks — your report is in
        </h2>
        <p className="text-sm text-gray-600 max-w-md leading-relaxed mb-6">
          Our objections team will review this listing and follow up by email
          if we need more information. Reports are usually triaged within 2
          business days.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full bg-[#ff6b6b] hover:bg-[#ee5253] text-white text-sm font-semibold shadow-md shadow-[#ff6b6b]/20 transition-colors"
          >
            Back to homepage
          </Link>
          <Link
            href="/help-center"
            className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Visit help center
          </Link>
        </div>
      </div>
    );
  }

  const remainingSlots = MAX_ATTACHMENTS - attachments.length;

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5"
      noValidate
    >
      <header>
        <h1 className="text-xl font-bold text-gray-900">
          Why do you want to report this content?
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Reports are confidential. The seller doesn&apos;t see your name or email.
        </p>
      </header>

      {/* Reason — card-style options with icon + helper */}
      <fieldset className="flex flex-col gap-2.5">
        <legend className="sr-only">Reason</legend>
        {REASONS.map((r) => {
          const Icon = r.icon;
          const active = reason === r.value;
          return (
            <label
              key={r.value}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                active
                  ? "border-[#ff6b6b] bg-[#fff0f0] shadow-sm"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={active}
                onChange={() => setReason(r.value)}
                className="mt-1 w-4 h-4 accent-[#ff6b6b] flex-shrink-0"
              />
              <Icon
                className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  active ? "text-[#ff6b6b]" : "text-gray-400"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900">
                  {r.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 leading-snug">
                  {r.helper}
                </div>
              </div>
            </label>
          );
        })}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="comments" className="text-sm font-semibold text-gray-800">
          Additional comments
          {reason === "other" && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <textarea
          id="comments"
          rows={4}
          maxLength={5000}
          value={comments}
          onChange={(e) => {
            setComments(e.target.value);
            if (errors.comments) {
              setErrors((prev) => ({ ...prev, comments: undefined }));
            }
          }}
          placeholder={
            reason === "other"
              ? "Tell us what's wrong with this listing…"
              : "Anything else we should know? (optional)"
          }
          className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 placeholder:text-gray-400 resize-none transition-colors ${
            errors.comments
              ? "border-red-400 focus:ring-red-200 focus:border-red-500"
              : "border-gray-200 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b]"
          }`}
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span className={errors.comments ? "text-red-500 font-semibold" : ""}>
            {errors.comments || " "}
          </span>
          <span>{comments.length}/5000</span>
        </div>
      </div>

      {/* Attachments */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-800">
          Attach screenshots{" "}
          <span className="font-normal text-gray-400">
            (optional, up to {MAX_ATTACHMENTS})
          </span>
        </label>

        <div className="grid grid-cols-3 gap-2.5">
          {attachments.map((a) => (
            <div
              key={a.id}
              className={`relative aspect-square rounded-2xl overflow-hidden border ${
                a.status === "error"
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              {a.localPreview && a.status !== "error" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.localPreview}
                  alt={a.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-xs text-red-600 px-2 text-center">
                  {a.error || "Failed"}
                </div>
              )}
              {a.status === "uploading" && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(a.id)}
                aria-label={`Remove ${a.name}`}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {remainingSlots > 0 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#ff6b6b] hover:bg-[#fff0f0]/40 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-[#ff6b6b] transition-colors"
            >
              <ImagePlus className="w-6 h-6" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Add image
              </span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />

        <p className="text-[11px] text-gray-400">
          PNG, JPG, WEBP · max 8MB each.
        </p>
        {errors.attachments && (
          <p className="text-xs text-red-500 font-semibold">
            {errors.attachments}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <input
            type="text"
            required
            maxLength={120}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
            }}
            placeholder="Your name"
            aria-invalid={!!errors.name}
            className={`w-full px-4 py-3 rounded-full border text-sm focus:outline-none focus:ring-2 placeholder:text-gray-400 transition-colors ${
              errors.name
                ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                : "border-gray-200 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b]"
            }`}
          />
          {errors.name && (
            <p className="text-xs text-red-500 font-semibold pl-4">
              {errors.name}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <input
            type="email"
            required
            maxLength={255}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
            }}
            placeholder="Your email"
            aria-invalid={!!errors.email}
            className={`w-full px-4 py-3 rounded-full border text-sm focus:outline-none focus:ring-2 placeholder:text-gray-400 transition-colors ${
              errors.email
                ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                : "border-gray-200 focus:ring-[#ff6b6b]/20 focus:border-[#ff6b6b]"
            }`}
          />
          {errors.email && (
            <p className="text-xs text-red-500 font-semibold pl-4">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 self-stretch sm:self-start px-10 py-3 rounded-full bg-[#ff6b6b] hover:bg-[#ee5253] text-white font-semibold text-sm transition-colors shadow-md shadow-[#ff6b6b]/20 disabled:opacity-60 disabled:cursor-wait inline-flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {submitting ? "Sending…" : "Send report"}
      </button>

      {serverError && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}
    </form>
  );
}
