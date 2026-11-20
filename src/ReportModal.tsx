import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "./auth";
import { useIncidents } from "./incidents";
import LocationPicker from "./LocationPicker";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  SEVERITIES,
  SEVERITY_LABELS,
  incidentSchema,
  type Position,
} from "./types";
import { compressImage, formatDateTime } from "./utils";

export default function ReportModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { addIncident } = useIncidents();

  const [openedAt] = useState(() => new Date().toISOString());
  const [position, setPosition] = useState<Position | null>(null);
  const [values, setValues] = useState({
    title: "",
    description: "",
    category: "accident",
    severity: "medium",
  });
  const [image, setImage] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Close on Escape and stop the page behind from scrolling
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  }

  async function handleImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((x) => ({ ...x, image: "Please choose an image file." }));
      return;
    }
    try {
      setImage(await compressImage(file));
      setErrors((x) => ({ ...x, image: "" }));
    } catch {
      setErrors((x) => ({ ...x, image: "Could not load that image." }));
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    const next: Record<string, string> = {};
    if (!position) next.location = "Pin the location on the map, or tap “Use my location”.";

    const result = incidentSchema.safeParse({
      ...values,
      lat: position?.lat ?? 0,
      lng: position?.lng ?? 0,
      image,
    });
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      }
    }

    if (!position || !result.success) {
      setErrors(next);
      return;
    }

    addIncident(result.data, user);
    onClose();
  }

  return (
    <div
      className="backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Report an incident">
        <div className="sheet-head">
          <h2>Report an incident</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="field">
            <span>Location</span>
            <LocationPicker value={position} onChange={setPosition} />
            {position ? (
              <small className="muted">
                Pinned at {position.lat.toFixed(5)}, {position.lng.toFixed(5)}. Drag the pin to adjust.
              </small>
            ) : (
              <small className="muted">Tap the map, search a place, or use your location.</small>
            )}
            {errors.location && <span className="field-error">{errors.location}</span>}
          </div>

          <label className="field">
            <span>Title</span>
            <input name="title" value={values.title} onChange={handleChange} placeholder="What happened?" />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </label>

          <label className="field">
            <span>Details</span>
            <textarea
              name="description"
              rows={3}
              value={values.description}
              onChange={handleChange}
              placeholder="Add landmarks, who is affected, and anything responders should know."
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </label>

          <div className="row">
            <label className="field grow">
              <span>Category</span>
              <select name="category" value={values.category} onChange={handleChange}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field grow">
              <span>Severity</span>
              <select name="severity" value={values.severity} onChange={handleChange}>
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {SEVERITY_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field">
            <span>Photo (optional)</span>
            {image ? (
              <div className="photo-preview">
                <img src={image} alt="Preview" />
                <button type="button" className="btn sm" onClick={() => setImage(undefined)}>
                  Remove photo
                </button>
              </div>
            ) : (
              <input type="file" accept="image/*" onChange={handleImage} />
            )}
            {errors.image && <span className="field-error">{errors.image}</span>}
          </div>

          <p className="auto-time">
            Date and time are recorded automatically when you post. Now: <strong>{formatDateTime(openedAt)}</strong>
          </p>
          <p className="muted small">This is not an emergency service. For urgent help, call 911.</p>

          <div className="form-actions">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              Post report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
