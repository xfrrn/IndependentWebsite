import { NextResponse } from "next/server"

const SUPPORTED_LOCALES = [
  { code: "en-US", name: "English", direction: "ltr" },
  { code: "ar-SA", name: "العربية", direction: "rtl" },
  { code: "zh-CN", name: "中文", direction: "ltr" },
]

export async function GET() {
  return NextResponse.json({ locales: SUPPORTED_LOCALES })
}
