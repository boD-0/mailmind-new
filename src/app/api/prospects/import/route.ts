import { NextResponse } from "next/server";
import { apiRequireAuth, PLAN_LIMITS, type Plan } from "@/lib/auth/gatekeeper";
import { tieredAiRateLimit } from "@/lib/rate-limit";
import { createCampaign } from "@/app/actions/dashboard";
import Papa from "papaparse";
import { getPostHogClient } from "@/lib/posthog-server";

// ═══════════════════════════════════════════════════════════
// Max rows per import to prevent abuse
// ═══════════════════════════════════════════════════════════
const MAX_ROWS = 100;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// ═══════════════════════════════════════════════════════════
// Expected CSV columns (case-insensitive matching)
// ═══════════════════════════════════════════════════════════
const REQUIRED_COLUMNS = ["name", "company"];
interface ParsedRow {
  name: string;
  company: string;
  email?: string;
  goal?: string;
  tone?: string;
  url?: string;
}

interface ImportError {
  row: number;
  message: string;
}

// ═══════════════════════════════════════════════════════════
// Helper: normalize column names to lowercase
// ═══════════════════════════════════════════════════════════
function normalizeColumns(headers: string[]): string[] {
  return headers.map((h) => h.trim().toLowerCase());
}

function mapRowToFields(
  row: Record<string, string>,
  headerMap: Map<string, number>,
): ParsedRow {
  const get = (col: string) => {
    const idx = headerMap.get(col.toLowerCase());
    if (idx === undefined) return undefined;
    return row[Object.keys(row)[idx]!]?.trim() || undefined;
  };
  return {
    name: get("name") || "",
    company: get("company") || "",
    email: get("email"),
    goal: get("goal"),
    tone: get("tone"),
    url: get("url") || get("linkedin") || get("prospect_url"),
  };
}

// ═══════════════════════════════════════════════════════════
// POST /api/prospects/import
// ═══════════════════════════════════════════════════════════
export async function POST(request: Request) {
  const user = await apiRequireAuth(request);
  if (user instanceof NextResponse) return user;

  // Rate limit
  const rateLimitResult = await tieredAiRateLimit(
    (user as { plan: Plan }).plan,
    user.id,
  );
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Rate limit reached. Please try again later." },
      { status: 429 },
    );
  }

  // Parse form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data. Send a CSV file as multipart/form-data." },
      { status: 400 },
    );
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json(
      { error: "No file provided. Upload a CSV file with the field name 'file'." },
      { status: 400 },
    );
  }

  // Validate file type
  if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
    return NextResponse.json(
      { error: "Invalid file type. Please upload a CSV file." },
      { status: 400 },
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` },
      { status: 400 },
    );
  }

  // Read file as text
  const csvText = await file.text();
  if (!csvText.trim()) {
    return NextResponse.json(
      { error: "CSV file is empty." },
      { status: 400 },
    );
  }

  // Parse CSV
  const parseResult = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim().toLowerCase(),
  });

  if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
    return NextResponse.json(
      {
        error: "Failed to parse CSV file.",
        details: parseResult.errors.slice(0, 3).map((e) => e.message),
      },
      { status: 400 },
    );
  }

  const rows = parseResult.data;
  if (rows.length === 0) {
    return NextResponse.json(
      { error: "CSV file contains no data rows." },
      { status: 400 },
    );
  }

  if (rows.length > MAX_ROWS) {
    return NextResponse.json(
      { error: `Too many rows. Maximum is ${MAX_ROWS} rows per import.` },
      { status: 400 },
    );
  }

  // Validate columns
  const headers = normalizeColumns(parseResult.meta.fields || []);
  const headerMap = new Map<string, number>();
  headers.forEach((h, i) => headerMap.set(h, i));

  const missingRequired = REQUIRED_COLUMNS.filter(
    (col) => !headerMap.has(col),
  );
  if (missingRequired.length > 0) {
    return NextResponse.json(
      {
        error: "Missing required columns.",
        missing_columns: missingRequired,
        hint: `Your CSV must include columns: ${REQUIRED_COLUMNS.join(", ")}`,
      },
      { status: 400 },
    );
  }

  // Validate each row and create campaigns
  const errors: ImportError[] = [];
  const created: { id: string; name: string; company: string }[] = [];
  const plan = (user as { plan: Plan }).plan || "FREE";
  const maxExecutions = PLAN_LIMITS[plan].maxExecutions;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const fields = mapRowToFields(row, headerMap);
    const rowNum = i + 2; // +2 because row 1 is header, and we want 1-based

    // Validate required fields
    if (!fields.name || !fields.company) {
      errors.push({
        row: rowNum,
        message: `Missing required field(s): ${!fields.name ? "name" : ""} ${!fields.company ? "company" : ""}`.trim(),
      });
      continue;
    }

    // Validate name/company length
    if (fields.name.length > 200) {
      errors.push({ row: rowNum, message: "Name exceeds 200 characters." });
      continue;
    }
    if (fields.company.length > 200) {
      errors.push({ row: rowNum, message: "Company exceeds 200 characters." });
      continue;
    }

    try {
      const campaign = await createCampaign({
        title: fields.email
          ? `${fields.name} @ ${fields.company} (${fields.email})`
          : `${fields.name} @ ${fields.company}`,
        prospect_name: fields.name,
        prospect_url: fields.url || undefined,
        tone: fields.tone || "Direct, data-first",
        goal: fields.goal || undefined,
      });

      created.push({
        id: campaign.id,
        name: fields.name,
        company: fields.company,
      });
    } catch (err) {
      errors.push({
        row: rowNum,
        message: err instanceof Error ? err.message : "Failed to create campaign.",
      });
    }
  }

  // Track in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: user.id,
    event: "bulk_import_completed",
    properties: {
      total_rows: rows.length,
      created_count: created.length,
      error_count: errors.length,
      plan,
    },
  });

  return NextResponse.json({
    success: true,
    summary: {
      total: rows.length,
      created: created.length,
      errors: errors.length,
    },
    campaigns: created,
    errors: errors.length > 0 ? errors : undefined,
  });
}
