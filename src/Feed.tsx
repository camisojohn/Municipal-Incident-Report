import { useMemo, useState } from "react";
import { useAuth } from "./auth";
import { useIncidents } from "./incidents";
import IncidentCard from "./IncidentCard";
import ReportModal from "./ReportModal";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  SEVERITY_ORDER,
  STATUSES,
  STATUS_LABELS,
  STATUS_ORDER,
  type Category,
  type Status,
} from "./types";

type Sort = "newest" | "oldest" | "severity" | "status";

export default function Feed() {
  const { user } = useAuth();
  const { incidents } = useIncidents();
  const isAdmin = user?.role === "admin";

  const [reporting, setReporting] = useState(false);
  const [sort, setSort] = useState<Sort>(isAdmin ? "status" : "newest");
  const [category, setCategory] = useState<Category | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [onlyMine, setOnlyMine] = useState(false);

  const counts = useMemo(() => {
    const c: Record<Status, number> = { pending: 0, reviewing: 0, taking_action: 0, resolved: 0 };
    for (const i of incidents) c[i.status] += 1;
    return c;
  }, [incidents]);

  const visible = useMemo(() => {
    const filtered = incidents.filter(
      (i) =>
        (category === "all" || i.category === category) &&
        (statusFilter === "all" || i.status === statusFilter) &&
        (!onlyMine || i.authorId === user?.id)
    );
    const newestFirst = (a: { createdAt: string }, b: { createdAt: string }) =>
      b.createdAt.localeCompare(a.createdAt);

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return newestFirst(b, a);
        case "severity":
          return SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity] || newestFirst(a, b);
        case "status":
          return STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || newestFirst(a, b);
        default:
          return newestFirst(a, b);
      }
    });
  }, [incidents, category, statusFilter, onlyMine, sort, user?.id]);

  if (!user) return null;

  return (
    <>
      {isAdmin ? (
        <section className="stats" aria-label="Reports by status">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`stat status-${s} ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter((cur) => (cur === s ? "all" : s))}
              aria-pressed={statusFilter === s}
            >
              <span className="stat-num">{counts[s]}</span>
              <span className="stat-label">{STATUS_LABELS[s]}</span>
            </button>
          ))}
        </section>
      ) : (
        <button type="button" className="card composer" onClick={() => setReporting(true)}>
          <span className="avatar" aria-hidden="true">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <span className="composer-text">Report an incident near you</span>
          <span className="btn primary sm composer-cta">Report</span>
        </button>
      )}

      <section className="toolbar" aria-label="Sort and filter">
        <label className="field">
          <span>Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="severity">Most severe</option>
            <option value="status">Needs attention</option>
          </select>
        </label>
        <label className="field">
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as Category | "all")}>
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Status</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Status | "all")}>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        {!isAdmin && (
          <label className="check">
            <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
            Only my reports
          </label>
        )}
      </section>

      {visible.length === 0 ? (
        <div className="card empty">
          {incidents.length === 0 ? (
            <>
              <strong>No reports yet</strong>
              <p className="muted">
                {isAdmin
                  ? "Resident reports will show up here for review."
                  : "Be the first to report an incident in your area."}
              </p>
              {!isAdmin && (
                <button type="button" className="btn primary" onClick={() => setReporting(true)}>
                  Report an incident
                </button>
              )}
            </>
          ) : (
            <>
              <strong>No reports match these filters</strong>
              <p className="muted">Try a different category or status.</p>
            </>
          )}
        </div>
      ) : (
        <div className="stack">
          {visible.map((i) => (
            <IncidentCard key={i.id} incident={i} />
          ))}
        </div>
      )}

      {reporting && <ReportModal onClose={() => setReporting(false)} />}
    </>
  );
}
