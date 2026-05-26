import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { BacktestReportStore } from "../reports/BacktestReportStore.js";
import { HtmlReportRenderer } from "../reports/HtmlReportRenderer.js";
import { PdfReportService } from "../reports/PdfReportService.js";

export async function reportsRoutes(app: FastifyInstance) {
  const store = new BacktestReportStore();
  const html = new HtmlReportRenderer();
  const pdf = new PdfReportService();

  app.get("/v1/reports", async (req) => {
    const q = z.object({
      limit: z.coerce.number().min(1).max(200).default(50)
    }).parse(req.query);

    return { reports: await store.list(q.limit) };
  });

  app.get("/v1/reports/:id", async (req, reply) => {
    const id = String((req.params as any).id);
    const report = await store.get(id);

    if (!report) {
      reply.code(404);
      return { error: "report_not_found" };
    }

    return { report };
  });

  app.get("/v1/reports/:id/html", async (req, reply) => {
    const id = String((req.params as any).id);
    const report = await store.get(id);

    if (!report) {
      reply.code(404);
      return { error: "report_not_found" };
    }

    reply.type("text/html");
    return html.render(report);
  });

  app.get("/v1/reports/:id/pdf", async (req, reply) => {
    const id = String((req.params as any).id);
    const report = await store.get(id);

    if (!report) {
      reply.code(404);
      return { error: "report_not_found" };
    }

    const buffer = await pdf.renderPdf(html.render(report));
    reply.type("application/pdf");
    reply.header("Content-Disposition", `attachment; filename="market-strategy-report-${id}.pdf"`);
    return buffer;
  });
}
