import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function getAccessTokenFromRefreshToken(refreshToken: string): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token || null;
  } catch {
    return null;
  }
}

interface ContentSegment {
  type: "heading1" | "heading2" | "heading3" | "bullet" | "table" | "paragraph";
  text: string;
  cells?: string[][]; // for tables
}

function parseContentToSegments(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  const lines = content.split("\n");
  let currentParagraph = "";
  let inTable = false;
  let tableRows: string[][] = [];

  const flushParagraph = () => {
    if (currentParagraph.trim()) {
      segments.push({ type: "paragraph", text: currentParagraph.trim() });
      currentParagraph = "";
    }
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      segments.push({ type: "table", text: "", cells: tableRows });
      tableRows = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushTable();
      inTable = false;
      continue;
    }

    // Heading 1: # or **bold at line start
    if (line.startsWith("# ")) {
      flushParagraph();
      flushTable();
      segments.push({ type: "heading1", text: line.slice(2).replace(/\*\*/g, "") });
    }
    // Heading 2
    else if (line.startsWith("## ")) {
      flushParagraph();
      flushTable();
      segments.push({ type: "heading2", text: line.slice(3).replace(/\*\*/g, "") });
    }
    // Heading 3
    else if (line.startsWith("### ")) {
      flushParagraph();
      flushTable();
      segments.push({ type: "heading3", text: line.slice(4).replace(/\*\*/g, "") });
    }
    // Table row
    else if (line.startsWith("|") && line.includes("|")) {
      inTable = true;
      const cells = line
        .split("|")
        .filter((_, i, a) => i > 0 && i < a.length - 1)
        .map(c => c.trim().replace(/\*\*/g, ""));
      if (cells.length > 1) tableRows.push(cells);
    }
    // Bullet or list item
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      flushTable();
      flushParagraph();
      segments.push({ type: "bullet", text: line.slice(2).replace(/\*\*/g, "") });
    }
    // Regular text
    else {
      if (inTable) {
        flushTable();
        inTable = false;
      }
      currentParagraph += (currentParagraph ? " " : "") + line.replace(/\*\*/g, "");
    }
  }

  flushParagraph();
  flushTable();

  return segments;
}

// Build a Google Docs API batch update request payload
function buildBatchUpdatePayload(documentId: string, segments: ContentSegment[]) {
  const requests: object[] = [];

  // Get current document length to append after existing content
  // We'll use insertText requests at the end
  const inserts: object[] = [];
  let insertIndex = 1; // Start after title

  for (const seg of segments) {
    if (seg.type === "heading1") {
      inserts.push({
        insertText: {
          location: { index: insertIndex },
          text: seg.text + "\n",
        },
      });
      inserts.push({
        updateTextStyle: {
          range: { startIndex: insertIndex, endIndex: insertIndex + seg.text.length },
          style: { bold: true, fontSize: 18, weightedFontFamily: { fontFamily: "Arial" } },
          fields: "bold,fontSize,weightedFontFamily",
        },
      });
      insertIndex += seg.text.length + 1;
    } else if (seg.type === "heading2") {
      inserts.push({
        insertText: {
          location: { index: insertIndex },
          text: seg.text + "\n",
        },
      });
      inserts.push({
        updateTextStyle: {
          range: { startIndex: insertIndex, endIndex: insertIndex + seg.text.length },
          style: { bold: true, fontSize: 14, weightedFontFamily: { fontFamily: "Arial" } },
          fields: "bold,fontSize,weightedFontFamily",
        },
      });
      insertIndex += seg.text.length + 1;
    } else if (seg.type === "heading3") {
      inserts.push({
        insertText: {
          location: { index: insertIndex },
          text: seg.text + "\n",
        },
      });
      inserts.push({
        updateTextStyle: {
          range: { startIndex: insertIndex, endIndex: insertIndex + seg.text.length },
          style: { bold: true, fontSize: 12, weightedFontFamily: { fontFamily: "Arial" } },
          fields: "bold,fontSize,weightedFontFamily",
        },
      });
      insertIndex += seg.text.length + 1;
    } else if (seg.type === "bullet") {
      inserts.push({
        insertText: {
          location: { index: insertIndex },
          text: "• " + seg.text + "\n",
        },
      });
      insertIndex += seg.text.length + 2;
    } else if (seg.type === "table") {
      // Insert table
      const rows = seg.cells || [];
      if (rows.length > 0) {
        inserts.push({
          insertTable: {
            location: { index: insertIndex },
            rows: rows.length,
            columns: rows[0].length,
          },
        });
        insertIndex++; // table takes one index
        // Fill cells
        let cellIndex = insertIndex;
        for (const row of rows) {
          for (const cellText of row) {
            inserts.push({
              insertText: {
                location: { index: cellIndex },
                text: cellText,
              },
            });
            cellIndex += cellText.length + 1;
          }
        }
        insertIndex = cellIndex + 1;
      }
    } else if (seg.type === "paragraph" && seg.text) {
      inserts.push({
        insertText: {
          location: { index: insertIndex },
          text: seg.text + "\n",
        },
      });
      insertIndex += seg.text.length + 1;
    }
  }

  // Batch into chunks of 500 requests (Google API limit)
  const chunkSize = 500;
  for (let i = 0; i < inserts.length; i += chunkSize) {
    requests.push(...inserts.slice(i, i + chunkSize));
  }

  return { documentId, requests };
}

export async function POST(req: NextRequest) {
  try {
    const { content, title, accessToken, refreshToken } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    // Get access token
    let token = accessToken;
    if (!token && refreshToken) {
      token = await getAccessTokenFromRefreshToken(refreshToken);
    }

    if (!token) {
      // Return auth URL so client can initiate OAuth
      return NextResponse.json({
        needsAuth: true,
        authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID || "",
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "https://owlly-ai.vercel.app"}/api/auth/google/callback`,
          response_type: "code",
          scope: "https://www.googleapis.com/auth/drive.file",
          access_type: "offline",
          prompt: "consent",
        }).toString()}`,
      }, { status: 401 });
    }

    // Step 1: Create a new Google Document via Drive API
    const docTitle = (title || "Owlly Lesson Plan").replace(/\*\*/g, "").trim();

    const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: docTitle,
        mimeType: "application/vnd.google-apps.document",
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      // If token expired, try refresh
      if (err.error?.status === "UNAUTHENTICATED" || createRes.status === 401) {
        return NextResponse.json({ needsAuth: true, error: "Token expired, please reconnect Google" }, { status: 401 });
      }
      return NextResponse.json({ error: err.error?.message || "Failed to create document" }, { status: 500 });
    }

    const doc = await createRes.json();
    const documentId = doc.id;
    const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

    // Step 2: Build content segments
    const segments = parseContentToSegments(content);

    // Step 3: Get current content length for appending
    const docMetaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${documentId}?fields=size`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const docMeta = await docMetaRes.json();

    // Get document content to find end index
    const docContentRes = await fetch(
      `https://docs.googleapis.com/v1/documents/${documentId}?fields=body`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const docContent = await docContentRes.json();

    // Get document root length (title section)
    let insertIndex = 1;
    if (docContent.body?.content) {
      for (const elem of docContent.body.content) {
        if (elem.startIndex !== undefined && elem.endIndex !== undefined) {
          insertIndex = Math.max(insertIndex, elem.endIndex);
        }
      }
    }

    // Build batch update requests
    const requests: object[] = [];

    for (const seg of segments) {
      if (seg.type === "heading1") {
        requests.push({
          insertText: { location: { index: insertIndex }, text: seg.text + "\n" },
        });
        requests.push({
          updateTextStyle: {
            range: { startIndex: insertIndex, endIndex: insertIndex + seg.text.length },
            style: { bold: true, fontSize: 18, weightedFontFamily: { fontFamily: "Arial" } },
            fields: "bold,fontSize,weightedFontFamily",
          },
        });
        insertIndex += seg.text.length + 1;
      } else if (seg.type === "heading2") {
        requests.push({
          insertText: { location: { index: insertIndex }, text: seg.text + "\n" },
        });
        requests.push({
          updateTextStyle: {
            range: { startIndex: insertIndex, endIndex: insertIndex + seg.text.length },
            style: { bold: true, fontSize: 14, weightedFontFamily: { fontFamily: "Arial" } },
            fields: "bold,fontSize,weightedFontFamily",
          },
        });
        insertIndex += seg.text.length + 1;
      } else if (seg.type === "heading3") {
        requests.push({
          insertText: { location: { index: insertIndex }, text: seg.text + "\n" },
        });
        requests.push({
          updateTextStyle: {
            range: { startIndex: insertIndex, endIndex: insertIndex + seg.text.length },
            style: { bold: true, fontSize: 12, weightedFontFamily: { fontFamily: "Arial" } },
            fields: "bold,fontSize,weightedFontFamily",
          },
        });
        insertIndex += seg.text.length + 1;
      } else if (seg.type === "bullet") {
        requests.push({
          insertText: { location: { index: insertIndex }, text: "• " + seg.text + "\n" },
        });
        insertIndex += seg.text.length + 2;
      } else if (seg.type === "table" && seg.cells && seg.cells.length > 0) {
        requests.push({
          insertTable: {
            location: { index: insertIndex },
            rows: seg.cells.length,
            columns: seg.cells[0].length,
          },
        });
        insertIndex++;
        for (const row of seg.cells) {
          for (const cellText of row) {
            requests.push({
              insertText: { location: { index: insertIndex }, text: cellText },
            });
            insertIndex += cellText.length;
            requests.push({
              updateTextStyle: {
                range: { startIndex: insertIndex - 1, endIndex: insertIndex },
                style: { fontSize: 10 },
                fields: "fontSize",
              },
            });
          }
          insertIndex++; // cell delimiter
        }
        insertIndex++;
      } else if (seg.type === "paragraph" && seg.text) {
        requests.push({
          insertText: { location: { index: insertIndex }, text: seg.text + "\n" },
        });
        insertIndex += seg.text.length + 1;
      }
    }

    // Execute batch update in chunks of 500
    const chunkSize = 500;
    for (let i = 0; i < requests.length; i += chunkSize) {
      const chunk = requests.slice(i, i + chunkSize);
      await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requests: chunk }),
      });
    }

    // Step 4: Make the document shareable (anyone with link can view)
    await fetch(`https://www.googleapis.com/drive/v3/files/${documentId}/permissions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "reader",
        type: "anyone",
      }),
    });

    return NextResponse.json({
      documentUrl,
      documentId,
      shareableLink: `https://docs.google.com/document/d/${documentId}/edit`,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Export failed";
    console.error("[export/google-docs]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}