import { useState } from "react";
import { CATEGORIES, SEVERITIES, incidentSchema, type IncidentInput } from "./types";

type Props = {
  position: { lat: number; lng: number };
  onSubmit: (data: IncidentInput) => void;
  onCancel: () => void;
};

const label = (s: string) => s.replace("_", " ");

export default function ReportForm({ position, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState({
    title: "",
    description: "",
    category: "accident",
    severity: "medium",
    occurredAt: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = incidentSchema.safeParse({
      ...values,
      lat: position.lat,
      lng: position.lng,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit} style={panel}>
      <h3 style={{ margin: 0 }}>Report an incident</h3>
      <small>
        Pin: {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
      </small>

      <label>
        Title
        <input name="title" value={values.title} onChange={handleChange} />
        {errors.title && <span style={err}>{errors.title}</span>}
      </label>

      <label>
        Description
        <textarea name="description" rows={3} value={values.description} onChange={handleChange} />
        {errors.description && <span style={err}>{errors.description}</span>}
      </label>

      <label>
        Category
        <select name="category" value={values.category} onChange={handleChange}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{label(c)}</option>
          ))}
        </select>
      </label>

      <label>
        Severity
        <select name="severity" value={values.severity} onChange={handleChange}>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label>
        When did it happen?
        <input type="datetime-local" name="occurredAt" value={values.occurredAt} onChange={handleChange} />
        {errors.occurredAt && <span style={err}>{errors.occurredAt}</span>}
      </label>

      <small>Not an emergency service. For urgent help, call 911.</small>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit">Submit</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

const panel: React.CSSProperties = {
  position: "fixed",
  top: 16,
  right: 16,
  width: 300,
  maxHeight: "calc(100vh - 32px)",
  overflowY: "auto",
  zIndex: 1000,
  background: "#fff",
  color: "#111",
  padding: 16,
  borderRadius: 8,
  boxShadow: "0 2px 12px rgba(0,0,0,.3)",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};
const err: React.CSSProperties = { color: "#c1121f", display: "block", fontSize: 12 };