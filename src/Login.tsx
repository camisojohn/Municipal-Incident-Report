import { useState, type FormEvent } from "react";
import { useAuth } from "./auth";

export default function Login() {
  const { signInResident, signInAdmin } = useAuth();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Enter your name (at least 2 characters).");
      return;
    }
    signInResident(name);
  }

  return (
    <div className="login">
      <div className="card login-card">
        <h1>Incident Tracker</h1>
        <p className="muted">Report problems in your community and follow what the municipality is doing about them.</p>

        <form onSubmit={submit} className="form">
          <label className="field">
            <span>Your name</span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="Juan Dela Cruz"
              autoComplete="name"
            />
            {error && <span className="field-error">{error}</span>}
          </label>
          <button type="submit" className="btn primary block">
            Continue as resident
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button type="button" className="btn block" onClick={signInAdmin}>
          Continue as municipal admin (demo)
        </button>

        <p className="note">
          Demo mode: roles are picked here for testing. Real accounts and admin-only permissions come with the backend.
        </p>
      </div>
    </div>
  );
}
