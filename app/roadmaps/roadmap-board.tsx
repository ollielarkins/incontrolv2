"use client";

import { useRef, useState } from "react";
import { C, HEAD, BODY } from "@/app/_components/theme";
import { NODE_STATUSES, STATUS_META, type NodeStatus, type RoadmapNode } from "@/lib/roadmap";
import { createNode, updateNode, deleteNode } from "@/app/actions/roadmap";

const NODE_W = 132;
const NODE_H = 46;

const chipStyle: React.CSSProperties = { fontFamily: BODY, fontSize: "0.6rem", letterSpacing: "0.1em", color: C.cream, border: `1px solid ${C.border}`, background: "rgba(22,17,12,0.6)" };
const countStyle: React.CSSProperties = { fontFamily: BODY, fontSize: "0.6rem", letterSpacing: "0.12em", color: C.muted };

export default function RoadmapBoard({ nodes: initial, today }: { nodes: RoadmapNode[]; today: string }) {
  const [nodes, setNodes] = useState<RoadmapNode[]>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [linkFrom, setLinkFrom] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; offX: number; offY: number; moved: boolean } | null>(null);

  const selected = nodes.find((n) => n.id === selectedId) ?? null;

  async function reportError(p: Promise<{ error: string } | void>) {
    const res = await p;
    if (res?.error) setError(res.error);
  }

  function patchLocal(id: string, patch: Partial<RoadmapNode>) {
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }

  async function addNode(status: NodeStatus = "unlocked") {
    setError(null);
    const rect = canvasRef.current?.getBoundingClientRect();
    const x = (rect ? rect.width / 2 : 200) - NODE_W / 2 + (nodes.length % 5) * 18;
    const y = 80 + (nodes.length % 6) * 16;
    const res = await createNode({ x, y });
    if ("error" in res) return setError(res.error);
    const title = status === "ai_suggested" ? "AI suggestion" : "New node";
    setNodes((ns) => [...ns, { id: res.id, title, status, x, y, links: [] }]);
    setSelectedId(res.id);
    if (status !== "unlocked") reportError(updateNode(res.id, { status, title }));
  }

  function onPointerDown(e: React.PointerEvent, node: RoadmapNode) {
    if (linkFrom) {
      // completing a link
      if (linkFrom !== node.id) {
        const from = nodes.find((n) => n.id === linkFrom);
        if (from && !from.links.includes(node.id)) {
          const links = [...from.links, node.id];
          patchLocal(linkFrom, { links });
          reportError(updateNode(linkFrom, { links }));
        }
      }
      setLinkFrom(null);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = canvasRef.current!.getBoundingClientRect();
    drag.current = { id: node.id, offX: e.clientX - rect.left - node.x, offY: e.clientY - rect.top - node.y, moved: false };
    setSelectedId(node.id);
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width - NODE_W, e.clientX - rect.left - d.offX));
    const y = Math.max(0, Math.min(rect.height - NODE_H, e.clientY - rect.top - d.offY));
    drag.current = { ...d, moved: true };
    patchLocal(d.id, { x, y });
  }

  function onPointerUp() {
    const d = drag.current;
    if (d?.moved) {
      const n = nodes.find((x) => x.id === d.id);
      if (n) reportError(updateNode(n.id, { x: n.x, y: n.y }));
    }
    drag.current = null;
  }

  function setStatus(id: string, status: NodeStatus) {
    patchLocal(id, { status });
    reportError(updateNode(id, { status }));
  }
  function rename(id: string, title: string) {
    patchLocal(id, { title });
  }
  function saveTitle(id: string, title: string) {
    reportError(updateNode(id, { title }));
  }
  function removeNode(id: string) {
    setNodes((ns) => ns.filter((n) => n.id !== id).map((n) => ({ ...n, links: n.links.filter((l) => l !== id) })));
    setSelectedId(null);
    reportError(deleteNode(id));
  }
  function unlink(fromId: string, toId: string) {
    const from = nodes.find((n) => n.id === fromId);
    if (!from) return;
    const links = from.links.filter((l) => l !== toId);
    patchLocal(fromId, { links });
    reportError(updateNode(fromId, { links }));
  }

  return (
    <>
      <header className="flex items-start justify-between">
        <div>
          <h1 style={{ fontFamily: HEAD, fontSize: "2.1rem", letterSpacing: "0.02em", color: C.cream, lineHeight: 1 }}>
            SKILL ROADMAP
          </h1>
          <p style={{ fontFamily: BODY, fontSize: "0.78rem", color: C.muted, marginTop: 6 }}>
            Map your development as a branching graph of nodes. Drag to arrange, link to connect.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p style={{ fontFamily: BODY, fontSize: "0.58rem", letterSpacing: "0.22em", color: C.faint }}>DATE</p>
            <p style={{ fontFamily: BODY, fontSize: "0.78rem", color: C.goldText, marginTop: 2 }}>{today}</p>
          </div>
          <button onClick={() => addNode()} className="rounded-sm px-5 py-3" style={{ fontFamily: BODY, fontSize: "0.72rem", letterSpacing: "0.16em", color: C.cream, border: `1px solid ${C.gold}`, background: "rgba(181,144,90,0.08)" }}>
            ADD NODE
          </button>
        </div>
      </header>

      {error && <p className="mt-3" style={{ fontFamily: BODY, fontSize: "0.74rem", color: "#E5896A" }}>{error}</p>}

      {/* Toolbar */}
      <div className="mt-4 flex items-center gap-2">
        <button onClick={() => addNode("ai_suggested")} className="rounded-sm px-3 py-1.5" style={chipStyle}>AI ADD NODE</button>
        <button className="rounded-sm px-3 py-1.5" style={chipStyle}>ADD AS TEMPLATE</button>
        <button className="rounded-sm px-3 py-1.5" style={chipStyle}>BY CAREER</button>
        <div className="ml-3 flex items-center gap-3">
          <span style={countStyle}>{nodes.length} TOTAL</span>
          <span style={countStyle}>{nodes.filter((n) => n.status === "active").length} ACTIVE</span>
          <span style={countStyle}>{nodes.filter((n) => n.status === "completed").length} DONE</span>
        </div>
        <div className="flex-1" />
        {linkFrom && <span style={{ fontFamily: BODY, fontSize: "0.62rem", color: C.goldText, marginRight: 8 }}>Linking… click a target node</span>}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SEARCH NODES"
          className="rounded-sm px-3 py-1.5"
          style={{ fontFamily: BODY, fontSize: "0.7rem", letterSpacing: "0.06em", background: "rgba(255,255,240,0.06)", color: C.cream, border: `1px solid ${C.border}`, outline: "none", width: 180 }}
        />
      </div>

      {/* Filter chips */}
      <div className="mt-2 flex items-center gap-2">
        <span style={{ fontFamily: BODY, fontSize: "0.58rem", letterSpacing: "0.16em", color: C.faint }}>FILTER NODES</span>
        {["ENGINEERING", "AI", "FINANCE", "CAREER"].map((c) => (
          <button key={c} className="rounded-sm px-3 py-1" style={chipStyle}>{c}</button>
        ))}
        <button className="rounded-sm px-3 py-1" style={chipStyle}>SEE MORE ⌄</button>
      </div>

      <div className="mt-3 flex min-h-0 flex-1 gap-5">
        {/* Canvas */}
        <div
          ref={canvasRef}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="relative flex-1 overflow-hidden rounded-sm"
          style={{ border: `1px solid ${C.border}`, backgroundColor: "rgba(15,11,8,0.55)", backgroundImage: "radial-gradient(rgba(181,144,90,0.1) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        >
          {/* edges */}
          <svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: "none" }}>
            {nodes.flatMap((n) =>
              n.links.map((tid) => {
                const t = nodes.find((x) => x.id === tid);
                if (!t) return null;
                return (
                  <line key={`${n.id}-${tid}`} x1={n.x + NODE_W / 2} y1={n.y + NODE_H / 2} x2={t.x + NODE_W / 2} y2={t.y + NODE_H / 2} stroke="rgba(181,144,90,0.5)" strokeWidth={1.5} />
                );
              }),
            )}
          </svg>

          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p style={{ fontFamily: BODY, fontSize: "0.8rem", color: C.faint }}>Empty canvas — tap ADD NODE to begin.</p>
            </div>
          )}

          {/* nodes */}
          {nodes.map((n) => {
            const meta = STATUS_META[n.status];
            const isSel = n.id === selectedId;
            const isLinkSrc = n.id === linkFrom;
            return (
              <div
                key={n.id}
                onPointerDown={(e) => onPointerDown(e, n)}
                className="absolute flex items-center justify-center rounded-sm px-3 text-center"
                style={{
                  left: n.x,
                  top: n.y,
                  width: NODE_W,
                  height: NODE_H,
                  cursor: linkFrom ? "crosshair" : "grab",
                  border: `1.5px ${meta.dashed ? "dashed" : "solid"} ${isSel || isLinkSrc ? C.gold : meta.color}`,
                  background: meta.fill ?? "rgba(22,17,12,0.85)",
                  boxShadow: isSel ? `0 0 0 1px ${C.gold}` : "none",
                  opacity: query && !n.title.toLowerCase().includes(query.toLowerCase()) ? 0.25 : 1,
                  userSelect: "none",
                }}
              >
                <span style={{ fontFamily: HEAD, fontSize: "0.72rem", color: C.cream, lineHeight: 1.05 }} className="truncate">{n.title}</span>
              </div>
            );
          })}
        </div>

        {/* Detail */}
        <div className="flex min-h-0 flex-col" style={{ width: 280 }}>
          <p className="mb-3" style={{ fontFamily: BODY, fontSize: "0.66rem", letterSpacing: "0.22em", color: C.cream }}>NODE DETAILS</p>
          <div className="min-h-0 flex-1 overflow-y-auto">
          {!selected ? (
            <div className="h-full rounded-sm px-5 py-6" style={{ border: `1px solid ${C.border}`, background: C.panel }}>
              <p style={{ fontFamily: BODY, fontSize: "0.74rem", color: C.faint }}>Select a node to edit it.</p>
            </div>
          ) : (
            <div className="rounded-sm px-5 py-4" style={{ border: `1px solid ${C.border}`, background: C.panel }}>
              <input
                value={selected.title}
                onChange={(e) => rename(selected.id, e.target.value)}
                onBlur={(e) => saveTitle(selected.id, e.target.value)}
                className="w-full rounded-sm px-3 py-2 text-sm"
                style={{ fontFamily: BODY, background: "rgba(255,255,240,0.06)", color: C.cream, border: `1px solid ${C.border}`, outline: "none" }}
              />

              <p className="mt-4" style={{ fontFamily: BODY, fontSize: "0.56rem", letterSpacing: "0.16em", color: C.faint }}>STATUS</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {NODE_STATUSES.map((s) => (
                  <button key={s} onClick={() => setStatus(selected.id, s)} className="rounded-sm px-2 py-1" style={{ fontFamily: BODY, fontSize: "0.56rem", letterSpacing: "0.1em", color: selected.status === s ? "#191919" : C.muted, background: selected.status === s ? STATUS_META[s].color : "transparent", border: `1px solid ${STATUS_META[s].color}` }}>
                    {STATUS_META[s].label}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button onClick={() => setLinkFrom(linkFrom === selected.id ? null : selected.id)} className="rounded-sm px-3 py-1.5" style={{ fontFamily: BODY, fontSize: "0.62rem", letterSpacing: "0.12em", color: linkFrom === selected.id ? "#191919" : C.cream, background: linkFrom === selected.id ? C.gold : "transparent", border: `1px solid ${C.border}` }}>
                  {linkFrom === selected.id ? "LINKING…" : "LINK →"}
                </button>
                <button onClick={() => removeNode(selected.id)} className="rounded-sm px-3 py-1.5" style={{ fontFamily: BODY, fontSize: "0.62rem", letterSpacing: "0.12em", color: "#E5896A", border: "1px solid rgba(229,137,106,0.4)" }}>DELETE</button>
              </div>

              {selected.links.length > 0 && (
                <div className="mt-4">
                  <p style={{ fontFamily: BODY, fontSize: "0.56rem", letterSpacing: "0.16em", color: C.faint }}>LINKS TO</p>
                  <div className="mt-2 flex flex-col gap-1">
                    {selected.links.map((tid) => {
                      const t = nodes.find((n) => n.id === tid);
                      return (
                        <div key={tid} className="flex items-center justify-between">
                          <span style={{ fontFamily: BODY, fontSize: "0.72rem", color: C.muted }}>{t?.title ?? "—"}</span>
                          <button onClick={() => unlink(selected.id, tid)} style={{ fontFamily: BODY, color: C.faint }} aria-label="unlink">×</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Legend (border colour) */}
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <span style={{ fontFamily: BODY, fontSize: "0.55rem", letterSpacing: "0.16em", color: C.faint }}>BORDER COLOUR</span>
        {NODE_STATUSES.map((s) => (
          <span key={s} className="flex items-center gap-2">
            <span style={{ width: 12, height: 12, borderRadius: 2, border: `1.5px ${STATUS_META[s].dashed ? "dashed" : "solid"} ${STATUS_META[s].color}`, background: STATUS_META[s].fill ?? "transparent" }} />
            <span style={{ fontFamily: BODY, fontSize: "0.58rem", letterSpacing: "0.14em", color: C.muted }}>{STATUS_META[s].label}</span>
          </span>
        ))}
      </div>
    </>
  );
}
