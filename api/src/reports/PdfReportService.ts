import { chromium } from "playwright";
import { config } from "../config.js";

export class PdfReportService {
  async renderPdf(html: string): Promise<Buffer> {
    if (!config.PDF_EXPORT_ENABLED) {
      throw new Error("PDF export is disabled. Set PDF_EXPORT_ENABLED=true after Playwright browser install is configured.");
    }

    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle" });
      return await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "16mm", right: "12mm", bottom: "16mm", left: "12mm" }
      });
    } finally {
      await browser.close();
    }
  }
}
