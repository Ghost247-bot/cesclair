"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Info, AlertTriangle, CheckCircle, X } from "lucide-react";

interface CautionBannerData {
  id: number;
  message: string;
  type: string;
  targetRole: string;
  targetUserId: string | null;
  active: boolean;
  createdAt: string;
}

const DISMISSED_KEY = "dismissed_caution_banners";

function getDismissedIds(): number[] {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function dismissBanner(id: number) {
  const ids = getDismissedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids));
  }
}

const typeConfig: Record<string, { bg: string; border: string; text: string; icon: typeof AlertCircle }> = {
  warning: { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-800", icon: AlertTriangle },
  info: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-800", icon: Info },
  danger: { bg: "bg-red-50", border: "border-red-300", text: "text-red-800", icon: AlertCircle },
  success: { bg: "bg-green-50", border: "border-green-300", text: "text-green-800", icon: CheckCircle },
};

export default function CautionBanners() {
  const [banners, setBanners] = useState<CautionBannerData[]>([]);
  const [dismissed, setDismissed] = useState<number[]>([]);

  useEffect(() => {
    setDismissed(getDismissedIds());

    const fetchBanners = async () => {
      try {
        const res = await fetch("/api/caution-banners", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setBanners(Array.isArray(data) ? data.filter((b: CautionBannerData) => b.active) : []);
        }
      } catch {
        // Silently fail - banners are non-critical
      }
    };

    fetchBanners();
  }, []);

  const visibleBanners = banners.filter((b) => !dismissed.includes(b.id));

  if (visibleBanners.length === 0) return null;

  return (
    <div className="space-y-2">
      {visibleBanners.map((banner) => {
        const config = typeConfig[banner.type] || typeConfig.warning;
        const Icon = config.icon;
        return (
          <div
            key={banner.id}
            className={`${config.bg} ${config.border} ${config.text} border rounded-lg px-4 py-3 flex items-start gap-3`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-sm font-medium">{banner.message}</p>
            <button
              onClick={() => {
                dismissBanner(banner.id);
                setDismissed((prev) => [...prev, banner.id]);
              }}
              className="flex-shrink-0 p-0.5 rounded hover:bg-black/10 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
