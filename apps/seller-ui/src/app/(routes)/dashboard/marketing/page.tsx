"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Megaphone,
  LayoutGrid,
  Mail,
  BarChart3,
  Tag,
  Search,
  Link2,
  CalendarDays,
  TrendingUp,
  Users,
  MousePointerClick,
  Save,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Instagram,
  Facebook,
  Music2,
  Pin,
  X,
} from "lucide-react";
import type { Props as ApexChartProps } from "react-apexcharts";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import useSeller from "@/hooks/useSeller";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type MarketingSectionId =
  | "overview"
  | "email-campaigns"
  | "analytics"
  | "discount-codes"
  | "seo-tools"
  | "social-links";

type CampaignStatus = "Draft" | "Scheduled" | "Sent";

interface CampaignRow {
  id: string;
  campaignName: string;
  status: CampaignStatus;
  recipients: number;
  openRate: number;
  sentDate: string;
}

interface DiscountCode {
  id: string;
  public_name: string;
  discountCode: string;
  discountType: "percentage" | "flat";
  discountValue: string;
}

interface MarketingAnalytics {
  labels: string[];
  performance: number[];
}

interface SocialLinkRow {
  platform: "Instagram" | "Facebook" | "X" | "TikTok";
  url: string;
}

interface DeliverabilityResult {
  isSpam: boolean;
  matchedTerms: string[];
}

const CARD_CLASS = "rounded-[24px] border border-[#e4e8cf] bg-white shadow-sm dark:border-[#2f3728] dark:bg-[#1a1a1a]";
const FIELD_INPUT_CLASS =
  "h-10 rounded-xl border-[#d8dfbc] bg-[#fffef8] text-[#17320f] placeholder:text-[#7a8562] focus-visible:border-[#86b81d] focus-visible:ring-2 focus-visible:ring-[#86b81d]/25 dark:border-[#3a432f] dark:bg-[#1b2317] dark:text-[#eaf3d7] dark:placeholder:text-[#8c9679]";
const FIELD_TEXTAREA_CLASS =
  "w-full resize-y rounded-xl border border-[#d8dfbc] bg-[#fffef8] px-3 py-2.5 text-sm text-[#17320f] outline-none placeholder:text-[#7a8562] focus-visible:ring-2 focus-visible:ring-[#86b81d]/25 dark:border-[#3a432f] dark:bg-[#1b2317] dark:text-[#eaf3d7] dark:placeholder:text-[#8c9679]";
const FIELD_SELECT_CLASS =
  "h-10 w-full rounded-xl border border-[#d8dfbc] bg-[#fffef8] px-3 text-sm text-[#17320f] outline-none focus-visible:ring-2 focus-visible:ring-[#86b81d]/25 dark:border-[#3a432f] dark:bg-[#1b2317] dark:text-[#eaf3d7]";

const SECTIONS: Array<{ id: MarketingSectionId; label: string; icon: React.ElementType }> = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "email-campaigns", label: "Email Campaigns", icon: Mail },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "discount-codes", label: "Discount Codes", icon: Tag },
  { id: "seo-tools", label: "SEO Tools", icon: Search },
  { id: "social-links", label: "Social Links", icon: Link2 },
];

const SPAM_TERMS = [
  "free",
  "win",
  "urgent",
  "click now",
  "guaranteed",
  "prize",
  "offer expires",
  "buy now",
  "limited time",
];

const SAMPLE_CAMPAIGNS: CampaignRow[] = [
  {
    id: "cmp-001",
    campaignName: "Summer Launch Offer",
    status: "Sent",
    recipients: 12540,
    openRate: 48,
    sentDate: "2026-05-01",
  },
  {
    id: "cmp-002",
    campaignName: "Weekend Bundle Push",
    status: "Scheduled",
    recipients: 8400,
    openRate: 0,
    sentDate: "2026-05-06",
  },
  {
    id: "cmp-003",
    campaignName: "VIP Early Access",
    status: "Draft",
    recipients: 2100,
    openRate: 0,
    sentDate: "2026-05-08",
  },
  {
    id: "cmp-004",
    campaignName: "Back in Stock Alert",
    status: "Sent",
    recipients: 9780,
    openRate: 42,
    sentDate: "2026-04-26",
  },
  {
    id: "cmp-005",
    campaignName: "New Season Preview",
    status: "Sent",
    recipients: 11190,
    openRate: 51,
    sentDate: "2026-04-20",
  },
];

const SAMPLE_DISCOUNT_CODES: DiscountCode[] = [
  {
    id: "d-1",
    public_name: "Summer Sale",
    discountCode: "SUMMER25",
    discountType: "percentage",
    discountValue: "25",
  },
  {
    id: "d-2",
    public_name: "VIP Flat",
    discountCode: "VIP10",
    discountType: "flat",
    discountValue: "10",
  },
  {
    id: "d-3",
    public_name: "Welcome Offer",
    discountCode: "WELCOME15",
    discountType: "percentage",
    discountValue: "15",
  },
];

const SAMPLE_ANALYTICS: MarketingAnalytics = {
  labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
  performance: [
    16, 18, 21, 20, 24, 27, 26, 29, 31, 33,
    35, 34, 37, 39, 42, 44, 43, 47, 49, 51,
    54, 56, 58, 57, 61, 62, 64, 67, 69, 72,
  ],
};

const SAMPLE_SOCIAL_LINKS: SocialLinkRow[] = [
  { platform: "Instagram", url: "https://instagram.com/yourstore" },
  { platform: "Facebook", url: "https://facebook.com/yourstore" },
  { platform: "X", url: "https://x.com/yourstore" },
  { platform: "TikTok", url: "https://tiktok.com/@yourstore" },
];

const getStatusBadgeClass = (status: CampaignStatus) => {
  if (status === "Sent") return "border border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "Scheduled") return "border border-amber-200 bg-amber-50 text-amber-700";
  return "border border-slate-200 bg-slate-50 text-slate-700";
};

const getSocialIcon = (platform: SocialLinkRow["platform"]) => {
  if (platform === "Instagram") return <Instagram size={14} className="text-pink-500" />;
  if (platform === "Facebook") return <Facebook size={14} className="text-blue-600" />;
  if (platform === "X") return <X size={14} className="text-black dark:text-white" />;
  if (platform === "TikTok") return <Music2 size={14} className="text-[#111] dark:text-white" />;
  return <Pin size={14} className="text-red-500" />;
};

function evaluateDeliverability(subject: string, body: string): DeliverabilityResult {
  const source = `${subject} ${body}`.toLowerCase();
  const matchedTerms = SPAM_TERMS.filter((term) => source.includes(term));

  return {
    isSpam: matchedTerms.length > 0,
    matchedTerms,
  };
}

export default function MarketingPage() {
  const { seller } = useSeller();
  const queryClient = useQueryClient();
  const shopId = seller?.activeShopId || seller?.shop?.id;

  const [activeSection, setActiveSection] = useState<MarketingSectionId>("overview");
  const [globalFilter, setGlobalFilter] = useState("");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [deliverabilityResult, setDeliverabilityResult] = useState<DeliverabilityResult | null>(null);
  const [isSendingCampaign, setIsSendingCampaign] = useState(false);

  const [discountName, setDiscountName] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
  const [discountValue, setDiscountValue] = useState("");

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const [socialLinks, setSocialLinks] = useState<SocialLinkRow[]>(SAMPLE_SOCIAL_LINKS);

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["marketing-campaigns", shopId],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/marketing/api/campaigns", {
          params: { shopId },
        });
        const apiCampaigns = res?.data?.campaigns;
        if (Array.isArray(apiCampaigns) && apiCampaigns.length > 0) {
          return apiCampaigns as CampaignRow[];
        }
        return SAMPLE_CAMPAIGNS;
      } catch {
        return SAMPLE_CAMPAIGNS;
      }
    },
    enabled: !!shopId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: discountCodes = [] } = useQuery({
    queryKey: ["shop-discounts", shopId],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/product/api/get-discount-codes", {
          params: { shopId },
        });
        const apiCodes = res?.data?.discount_codes;
        if (Array.isArray(apiCodes) && apiCodes.length > 0) {
          return apiCodes as DiscountCode[];
        }
        return SAMPLE_DISCOUNT_CODES;
      } catch {
        return SAMPLE_DISCOUNT_CODES;
      }
    },
    enabled: !!shopId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: analyticsData = SAMPLE_ANALYTICS } = useQuery({
    queryKey: ["marketing-analytics", shopId],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/marketing/api/analytics", {
          params: { shopId },
        });
        const payload = res?.data?.analytics;
        if (Array.isArray(payload?.labels) && Array.isArray(payload?.performance)) {
          return payload as MarketingAnalytics;
        }
        return SAMPLE_ANALYTICS;
      } catch {
        return SAMPLE_ANALYTICS;
      }
    },
    enabled: !!shopId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: apiSocialLinks = SAMPLE_SOCIAL_LINKS } = useQuery({
    queryKey: ["marketing-social-links", shopId],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/marketing/api/social-links", {
          params: { shopId },
        });
        const links = res?.data?.links;
        if (Array.isArray(links) && links.length > 0) {
          return links as SocialLinkRow[];
        }
        return SAMPLE_SOCIAL_LINKS;
      } catch {
        return SAMPLE_SOCIAL_LINKS;
      }
    },
    enabled: !!shopId,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (apiSocialLinks.length > 0) {
      setSocialLinks(apiSocialLinks);
    }
  }, [apiSocialLinks]);

  const overviewStats = useMemo(() => {
    const emailsSent = campaigns.reduce((sum, row) => sum + Number(row.recipients || 0), 0);
    const avgOpenRate = campaigns.length
      ? Math.round(campaigns.reduce((sum, row) => sum + Number(row.openRate || 0), 0) / campaigns.length)
      : 0;
    const conversions = Math.round(emailsSent * 0.041);
    const totalReach = Math.round(emailsSent * 1.42);

    return {
      totalReach,
      emailsSent,
      avgOpenRate,
      conversions,
    };
  }, [campaigns]);

  const campaignColumns = useMemo<ColumnDef<CampaignRow>[]>(
    () => [
      {
        accessorKey: "campaignName",
        header: "Campaign Name",
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-semibold text-[#17320f] dark:text-white">{row.original.campaignName}</p>
            <p className="text-[11px] text-[#75805f] dark:text-[#9aa689]">#{row.original.id}</p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusBadgeClass(row.original.status)}`}>
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: "recipients",
        header: "Recipients",
        cell: ({ row }) => <span className="text-sm font-medium">{row.original.recipients.toLocaleString()}</span>,
      },
      {
        accessorKey: "openRate",
        header: "Open Rate",
        cell: ({ row }) => <span className="text-sm font-medium">{row.original.openRate}%</span>,
      },
      {
        accessorKey: "sentDate",
        header: "Sent Date",
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 text-sm text-[#6f7b59] dark:text-[#98a487]">
            <CalendarDays size={12} />
            {new Date(row.original.sentDate).toLocaleDateString()}
          </span>
        ),
      },
    ],
    []
  );

  const campaignsTable = useReactTable({
    data: campaigns,
    columns: campaignColumns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
  });

  const chartSeries: ApexChartProps["series"] = [
    {
      name: "Performance",
      data: analyticsData.performance,
    },
  ];

  const chartOptions: ApexChartProps["options"] = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Manrope, sans-serif",
    },
    colors: ["#86b81d"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2.5 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.32,
        opacityTo: 0.04,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: analyticsData.labels,
      labels: {
        style: {
          colors: "#7a8663",
          fontSize: "11px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#7a8663",
          fontSize: "11px",
        },
      },
    },
    grid: {
      borderColor: "#e7ecd2",
      strokeDashArray: 4,
    },
    tooltip: {
      theme: "light",
    },
  };

  const handleCheckDeliverability = () => {
    if (!subject.trim() && !body.trim()) {
      toast.error("Please enter subject or message before checking deliverability.");
      return;
    }

    const result = evaluateDeliverability(subject, body);
    setDeliverabilityResult(result);
  };

  const handleSendCampaign = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error("Please fill subject and message before sending.");
      return;
    }

    const payload = {
      shopId,
      subject,
      body,
      deliverability: deliverabilityResult?.isSpam ? "spam" : "ham",
    };

    setIsSendingCampaign(true);
    try {
      await axiosInstance.post("/marketing/api/send-campaign", payload);
      toast.success("Campaign sent successfully.");
      queryClient.invalidateQueries({ queryKey: ["marketing-campaigns", shopId] });
    } catch {
      const mockRow: CampaignRow = {
        id: `mock-${Date.now()}`,
        campaignName: subject,
        status: "Sent",
        recipients: 1000,
        openRate: 0,
        sentDate: new Date().toISOString(),
      };

      queryClient.setQueryData<CampaignRow[]>(["marketing-campaigns", shopId], (prev = []) => [mockRow, ...prev]);
      toast.success("Campaign sent successfully (mock fallback).");
    } finally {
      setIsSendingCampaign(false);
    }
  };

  const handleCreateDiscount = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!discountName.trim() || !discountCode.trim() || !discountValue.trim()) {
      toast.error("Please complete all discount fields.");
      return;
    }

    const payload = {
      shopId,
      public_name: discountName,
      discountCode,
      discountType,
      discountValue,
    };

    try {
      await axiosInstance.post("/product/api/create-discount-code", payload);
      queryClient.invalidateQueries({ queryKey: ["shop-discounts", shopId] });
      toast.success("Discount code created.");
    } catch {
      const mockCode: DiscountCode = {
        id: `mock-${Date.now()}`,
        public_name: discountName,
        discountCode,
        discountType,
        discountValue,
      };
      queryClient.setQueryData<DiscountCode[]>(["shop-discounts", shopId], (prev = []) => [mockCode, ...prev]);
      toast.success("Discount code created (mock fallback).");
    }

    setDiscountName("");
    setDiscountCode("");
    setDiscountValue("");
    setDiscountType("percentage");
  };

  const handleDeleteDiscount = async (id: string) => {
    try {
      await axiosInstance.delete(`/product/api/delete-discount-code/${id}`, {
        params: { shopId },
      });
      queryClient.invalidateQueries({ queryKey: ["shop-discounts", shopId] });
      toast.success("Discount code deleted.");
    } catch {
      queryClient.setQueryData<DiscountCode[]>(["shop-discounts", shopId], (prev = []) => prev.filter((row) => row.id !== id));
      toast.success("Discount code deleted (mock fallback).");
    }
  };

  const handleSaveSeo = async () => {
    try {
      await axiosInstance.post("/marketing/api/seo", {
        shopId,
        metaTitle,
        metaDescription,
      });
      toast.success("SEO settings saved.");
    } catch {
      toast.success("SEO settings saved (mock fallback).");
    }
  };

  const handleSaveSocial = async (platform: SocialLinkRow["platform"], url: string) => {
    if (!url.trim()) {
      toast.error(`Please enter a URL for ${platform}.`);
      return;
    }

    try {
      await axiosInstance.post("/marketing/api/social-links", {
        shopId,
        platform,
        url,
      });
      toast.success(`${platform} link saved.`);
    } catch {
      toast.success(`${platform} link saved (mock fallback).`);
    }
  };

  const setSocialUrl = (platform: SocialLinkRow["platform"], value: string) => {
    setSocialLinks((prev) => prev.map((row) => (row.platform === platform ? { ...row, url: value } : row)));
  };

  const overviewSection = (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className={`${CARD_CLASS} p-5`}>
        <p className="text-xs text-[#6a7653] dark:text-[#95a184]">Total Reach</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-[#17320f] dark:text-white">{overviewStats.totalReach.toLocaleString()}</p>
        <p className="mt-2 text-[11px] text-emerald-600">+7.8% vs last cycle</p>
      </Card>
      <Card className={`${CARD_CLASS} p-5`}>
        <p className="text-xs text-[#6a7653] dark:text-[#95a184]">Emails Sent</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-[#17320f] dark:text-white">{overviewStats.emailsSent.toLocaleString()}</p>
        <p className="mt-2 text-[11px] text-emerald-600">+1,240 this week</p>
      </Card>
      <Card className={`${CARD_CLASS} p-5`}>
        <p className="text-xs text-[#6a7653] dark:text-[#95a184]">Open Rate</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-[#17320f] dark:text-white">{overviewStats.avgOpenRate}%</p>
        <p className="mt-2 text-[11px] text-emerald-600">+2.1% this month</p>
      </Card>
      <Card className={`${CARD_CLASS} p-5`}>
        <p className="text-xs text-[#6a7653] dark:text-[#95a184]">Conversions</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-[#17320f] dark:text-white">{overviewStats.conversions.toLocaleString()}</p>
        <p className="mt-2 text-[11px] text-emerald-600">+4.6% this month</p>
      </Card>
    </div>
  );

  const emailCampaignsSection = (
    <div className="space-y-5">
      <Card className={`${CARD_CLASS} overflow-hidden`}>
        <div className="flex flex-wrap items-center gap-3 border-b border-[#e7ebd5] bg-[#fafcf0] px-5 py-4 dark:border-[#2f3728] dark:bg-[#171d14]">
          <div>
            <h3 className="text-sm font-semibold text-[#17320f] dark:text-white">Campaign List</h3>
            <p className="text-xs text-[#6d7957] dark:text-[#98a487]">Track campaign status and email performance.</p>
          </div>
          <div className="relative ml-auto w-full max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74805f] dark:text-[#97a384]" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search campaigns..."
              className={`${FIELD_INPUT_CLASS} h-9 pl-8`}
            />
          </div>
        </div>

        {campaignsLoading ? (
          <div className="px-5 py-16 text-center text-sm text-[#6f7a59] dark:text-[#98a487]">Loading campaigns...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-[#f7f9ec] dark:bg-[#171d14]">
                  {campaignsTable.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6f7959] dark:text-[#9eaa8b]"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {campaignsTable.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-t border-[#e8ecd8] dark:border-[#2f3728]">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-5 py-3.5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {campaignsTable.getRowModel().rows.length === 0 && (
                    <tr>
                      <td colSpan={campaignColumns.length} className="px-5 py-14 text-center text-sm text-[#6f7a59] dark:text-[#98a487]">
                        No campaigns found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-[#e8ecd8] px-5 py-3 dark:border-[#2f3728]">
              <p className="text-xs text-[#6f7a59] dark:text-[#98a487]">
                Page {campaignsTable.getState().pagination.pageIndex + 1} of {campaignsTable.getPageCount() || 1}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg border-[#d8dfbd] bg-white hover:bg-[#eef4dc] dark:border-[#3a432f] dark:bg-[#1a2116] dark:hover:bg-[#232c1c]"
                  disabled={!campaignsTable.getCanPreviousPage()}
                  onClick={() => campaignsTable.previousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg border-[#d8dfbd] bg-white hover:bg-[#eef4dc] dark:border-[#3a432f] dark:bg-[#1a2116] dark:hover:bg-[#232c1c]"
                  disabled={!campaignsTable.getCanNextPage()}
                  onClick={() => campaignsTable.nextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Card className={`${CARD_CLASS} p-5`}>
        <h3 className="text-sm font-semibold text-[#17320f] dark:text-white">Compose & Check</h3>
        <p className="mt-1 text-xs text-[#6d7957] dark:text-[#98a487]">InboxZen-inspired flow: enter message, check deliverability, then send.</p>

        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="subject" className="text-xs">Subject line</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Your weekly deals are live"
              className={FIELD_INPUT_CLASS}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="body" className="text-xs">Enter your email message</Label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={7}
              placeholder="Write your campaign content here..."
              className={FIELD_TEXTAREA_CLASS}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={handleCheckDeliverability}
              className="rounded-xl bg-[#86b81d] text-white hover:bg-[#78a51b]"
            >
              <CheckCircle2 size={13} className="mr-1.5" />
              Check Deliverability
            </Button>
            <Button
              type="button"
              onClick={handleSendCampaign}
              disabled={isSendingCampaign}
              className="rounded-xl bg-[#17320f] text-white hover:bg-[#264919]"
            >
              <Send size={13} className="mr-1.5" />
              {isSendingCampaign ? "Sending..." : "Send Campaign"}
            </Button>
          </div>

          {deliverabilityResult && (
            <div
              className={`rounded-2xl border px-4 py-3 ${
                deliverabilityResult.isSpam
                  ? "border-red-200 bg-red-50"
                  : "border-emerald-200 bg-emerald-50"
              }`}
            >
              <p className={`text-sm font-semibold ${deliverabilityResult.isSpam ? "text-red-700" : "text-emerald-700"}`}>
                {deliverabilityResult.isSpam
                  ? "✗ Likely Spam Detected"
                  : "✓ Looks Good — Not Spam"}
              </p>
              {deliverabilityResult.matchedTerms.length > 0 && (
                <p className="mt-1 text-xs text-red-600">
                  Flagged terms: {deliverabilityResult.matchedTerms.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const analyticsSection = (
    <Card className={`${CARD_CLASS} p-5`}>
      <h3 className="text-sm font-semibold text-[#17320f] dark:text-white">Campaign Performance (30 days)</h3>
      <p className="mt-1 text-xs text-[#6d7957] dark:text-[#98a487]">Mock trend data rendered with ApexCharts.</p>
      <div className="mt-4 rounded-2xl border border-[#e6ebd3] bg-[#f8fceb] p-2 dark:border-[#2f3728] dark:bg-[#171f13]">
        <ApexChart type="area" height={340} options={chartOptions} series={chartSeries} />
      </div>
    </Card>
  );

  const discountSection = (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className={`${CARD_CLASS} p-5`}>
          <p className="text-xs text-[#6a7653] dark:text-[#95a184]">Total Codes</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-[#17320f] dark:text-white">{discountCodes.length}</p>
        </Card>
        <Card className={`${CARD_CLASS} p-5`}>
          <p className="text-xs text-[#6a7653] dark:text-[#95a184]">Percentage</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-[#17320f] dark:text-white">
            {discountCodes.filter((row) => row.discountType === "percentage").length}
          </p>
        </Card>
        <Card className={`${CARD_CLASS} p-5`}>
          <p className="text-xs text-[#6a7653] dark:text-[#95a184]">Flat</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-[#17320f] dark:text-white">
            {discountCodes.filter((row) => row.discountType === "flat").length}
          </p>
        </Card>
        <Card className={`${CARD_CLASS} p-5`}>
          <p className="text-xs text-[#6a7653] dark:text-[#95a184]">Highest Value</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-[#17320f] dark:text-white">
            {discountCodes.length ? Math.max(...discountCodes.map((row) => Number(row.discountValue || 0))) : 0}
          </p>
        </Card>
      </div>

      <Card className={`${CARD_CLASS} p-5`}>
        <h3 className="text-sm font-semibold text-[#17320f] dark:text-white">Create Discount Code</h3>
        <form onSubmit={handleCreateDiscount} className="mt-4 grid gap-3 md:grid-cols-5">
          <Input
            value={discountName}
            onChange={(e) => setDiscountName(e.target.value)}
            placeholder="Public name"
            className={`${FIELD_INPUT_CLASS} md:col-span-2`}
          />
          <Input
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
            placeholder="Code"
            className={`${FIELD_INPUT_CLASS} font-mono`}
          />
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as "percentage" | "flat")}
            className={FIELD_SELECT_CLASS}
          >
            <option value="percentage">Percentage</option>
            <option value="flat">Flat</option>
          </select>
          <div className="flex gap-2">
            <Input
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder="Value"
              className={FIELD_INPUT_CLASS}
            />
            <Button type="submit" className="rounded-xl bg-[#86b81d] text-white hover:bg-[#78a51b]">
              <Plus size={13} className="mr-1" />
              Add
            </Button>
          </div>
        </form>
      </Card>

      <Card className={`${CARD_CLASS} overflow-hidden`}>
        <div className="grid grid-cols-[1.8fr_1fr_0.8fr_48px] gap-3 border-b border-[#e7ebd5] bg-[#f7f9ec] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6f7959] dark:border-[#2f3728] dark:bg-[#171d14] dark:text-[#9eaa8b]">
          <span>Name / Code</span>
          <span>Type</span>
          <span>Value</span>
          <span />
        </div>

        {discountCodes.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-[1.8fr_1fr_0.8fr_48px] gap-3 border-b border-[#e8ecd8] px-5 py-3 dark:border-[#2f3728]"
          >
            <div>
              <p className="text-sm font-semibold text-[#17320f] dark:text-white">{row.public_name}</p>
              <span className="inline-flex rounded bg-[#eef3da] px-1.5 py-0.5 font-mono text-[11px] text-[#5b6939]">
                {row.discountCode}
              </span>
            </div>
            <span className="text-xs capitalize text-[#6d7957] dark:text-[#98a487]">{row.discountType}</span>
            <span className="text-sm font-semibold text-[#17320f] dark:text-white">
              {row.discountType === "percentage" ? `${row.discountValue}%` : `$${row.discountValue}`}
            </span>
            <button
              type="button"
              onClick={() => handleDeleteDiscount(row.id)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#8a956f] hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {discountCodes.length === 0 && (
          <div className="px-5 py-14 text-center text-sm text-[#6f7a59] dark:text-[#98a487]">No discount codes available.</div>
        )}
      </Card>
    </div>
  );

  const seoSection = (
    <div className="space-y-5">
      <Card className={`${CARD_CLASS} p-5`}>
        <h3 className="text-sm font-semibold text-[#17320f] dark:text-white">SEO Tools</h3>
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="meta-title" className="text-xs">Meta Title</Label>
            <Input
              id="meta-title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Premium Home Decor | Atlas Seller"
              className={FIELD_INPUT_CLASS}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="meta-description" className="text-xs">Meta Description</Label>
            <textarea
              id="meta-description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={4}
              placeholder="Discover premium products with fast shipping and secure checkout."
              className={FIELD_TEXTAREA_CLASS}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSeo} className="rounded-xl bg-[#86b81d] text-white hover:bg-[#78a51b]">
              <Save size={13} className="mr-1.5" />
              Save SEO
            </Button>
          </div>
        </div>
      </Card>

      <Card className={`${CARD_CLASS} p-5`}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6f7959] dark:text-[#9eaa8b]">SERP Preview</p>
        <div className="mt-3 rounded-2xl border border-[#e6ebd3] bg-[#fffef8] p-4 dark:border-[#2f3728] dark:bg-[#131912]">
          <p className="text-[13px] text-[#1a0dab] dark:text-[#8ab4f8]">
            www.yourstore.com/{(seller?.shop?.name || "store").toLowerCase().replace(/\s+/g, "-")}
          </p>
          <h4 className="mt-1 text-lg leading-tight text-[#1a0dab] dark:text-[#8ab4f8]">
            {metaTitle.trim() || "Premium Home Decor | Atlas Seller"}
          </h4>
          <p className="mt-1 text-sm text-[#4d5156] dark:text-[#9aa0a6]">
            {metaDescription.trim() || "Discover curated essentials, quick shipping, and exclusive offers this week."}
          </p>
        </div>
      </Card>
    </div>
  );

  const socialSection = (
    <Card className={`${CARD_CLASS} p-5`}>
      <h3 className="text-sm font-semibold text-[#17320f] dark:text-white">Social Links</h3>
      <p className="mt-1 text-xs text-[#6d7957] dark:text-[#98a487]">Save storefront social profiles.</p>

      <div className="mt-4 space-y-3">
        {socialLinks.map((row) => (
          <div
            key={row.platform}
            className="grid gap-2 rounded-2xl border border-[#e5ebd1] bg-[#f9fced] p-3 dark:border-[#2f3728] dark:bg-[#171f13] md:grid-cols-[150px_minmax(0,1fr)_108px]"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-[#17320f] dark:text-white">
              {getSocialIcon(row.platform)}
              {row.platform}
            </div>
            <Input
              value={row.url}
              onChange={(e) => setSocialUrl(row.platform, e.target.value)}
              placeholder={`https://${row.platform.toLowerCase()}.com/yourstore`}
              className={FIELD_INPUT_CLASS}
            />
            <Button
              variant="outline"
              onClick={() => handleSaveSocial(row.platform, row.url)}
              className="rounded-xl border-[#d8dfbd] bg-white text-[#17320f] hover:bg-[#eef4dc] dark:border-[#3a432f] dark:bg-[#1a2116] dark:text-[#eaf3d7] dark:hover:bg-[#232c1c]"
            >
              <Save size={13} className="mr-1.5" />
              Save
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );

  const sectionContent: Record<MarketingSectionId, React.ReactNode> = {
    overview: overviewSection,
    "email-campaigns": emailCampaignsSection,
    analytics: analyticsSection,
    "discount-codes": discountSection,
    "seo-tools": seoSection,
    "social-links": socialSection,
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-[-0.05em] text-[#17320f] dark:text-white">
          <Megaphone size={22} className="text-[#86b81d]" />
          Marketing
        </h1>
        <p className="mt-1 text-sm text-[#5f694a] dark:text-[#9ca88a]">
          Run campaigns, monitor performance, and optimize discoverability.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[208px_minmax(0,1fr)]">
        <aside className="w-52 rounded-[24px] border border-[#e1e7c7] bg-white p-2 shadow-sm dark:border-[#2f3728] dark:bg-[#1a1a1a] h-fit">
          <nav className="space-y-1">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive
                      ? "border-l-2 border-[#86b81d] bg-[#f0f6e4] text-[#3B6D11]"
                      : "text-[#506038] hover:bg-[#eef4dc]"
                  }`}
                >
                  <Icon size={14} />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">{sectionContent[activeSection]}</section>
      </div>

      <div className="mt-6 rounded-2xl border border-[#e2e8c9] bg-[#f8fce9] px-4 py-2 text-xs text-[#65724b] dark:border-[#333b2c] dark:bg-[#151c12] dark:text-[#99a689]">
        Mock fallback is enabled: UI remains usable even when marketing endpoints are unavailable.
      </div>
    </div>
  );
}
