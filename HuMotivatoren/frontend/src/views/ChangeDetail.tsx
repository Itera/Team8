import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getDevelopmentHistoryDetail } from "../services/api";
import type { DevelopmentHistoryDetail } from "../types";
import "../matrix.css";

/**
 * Minimal markdown-to-HTML renderer covering the subset used in change files:
 * headings h1-h3, bold, inline code, fenced code blocks, hr, unordered lists,
 * ordered lists, paragraphs. No external dependencies.
 */
function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inCode = false;
  let codeLines: string[] = [];
  let inList: "ul" | "ol" | null = null;

  const closeList = () => {
    if (inList === "ul") out.push("</ul>");
    if (inList === "ol") out.push("</ol>");
    inList = null;
  };

  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const inlineFormat = (s: string): string =>
    escapeHtml(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.+?)`/g, "<code>$1</code>");

  for (const rawLine of lines) {
    const line = rawLine;

    if (line.startsWith("```")) {
      if (!inCode) {
        closeList();
        inCode = true;
        codeLines = [];
      } else {
        out.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        inCode = false;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    const h3 = line.match(/^### (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h1 = line.match(/^# (.+)/);
    if (h1) {
      closeList();
      out.push(`<h1>${inlineFormat(h1[1])}</h1>`);
      continue;
    }
    if (h2) {
      closeList();
      out.push(`<h2>${inlineFormat(h2[1])}</h2>`);
      continue;
    }
    if (h3) {
      closeList();
      out.push(`<h3>${inlineFormat(h3[1])}</h3>`);
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      closeList();
      out.push("<hr />");
      continue;
    }

    const ul = line.match(/^[-*] (.+)/);
    if (ul) {
      if (inList !== "ul") {
        closeList();
        out.push("<ul>");
        inList = "ul";
      }
      out.push(`<li>${inlineFormat(ul[1])}</li>`);
      continue;
    }

    const ol = line.match(/^\d+\. (.+)/);
    if (ol) {
      if (inList !== "ol") {
        closeList();
        out.push("<ol>");
        inList = "ol";
      }
      out.push(`<li>${inlineFormat(ol[1])}</li>`);
      continue;
    }

    if (line.trim() === "") {
      closeList();
      out.push("");
      continue;
    }

    closeList();
    out.push(`<p>${inlineFormat(line)}</p>`);
  }

  closeList();
  return out.join("\n");
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function ChangeDetail() {
  const { hash } = useParams<{ hash: string }>();
  const [html, setHtml] = useState<string | null>(null);
  const [entry, setEntry] = useState<DevelopmentHistoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hash) {
      setLoading(false);
      setError("Missing change hash");
      return;
    }

    let cancelled = false;

    const loadEntry = async () => {
      try {
        const detail = await getDevelopmentHistoryDetail(hash);

        if (!cancelled) {
          setEntry(detail);
          setHtml(renderMarkdown(detail.content));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadEntry();

    return () => {
      cancelled = true;
    };
  }, [hash]);

  return (
    <div className="matrix-page">
      <div className="matrix-header">
        <h1>development_history :: change</h1>
        <p className="matrix-subtitle">
          {">>"} hash: {hash}
        </p>
      </div>

      <Link to="/development_history" className="matrix-back-link">
        [back to history]
      </Link>

      {loading && <p className="matrix-loading">{">"} loading change...</p>}

      {error && (
        <p className="matrix-error">
          {"[ERROR]"} {error}
        </p>
      )}

      {!loading && !error && (
        <div className="matrix-detail">
          {entry && (
            <div className="matrix-meta">
              <span>{formatDate(entry.date)}</span>
              <span>{entry.author}</span>
              <span>{entry.hash}</span>
            </div>
          )}
          <div
            className="matrix-markdown"
            dangerouslySetInnerHTML={{ __html: html ?? "" }}
          />
        </div>
      )}
    </div>
  );
}
