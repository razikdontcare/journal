import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 500);
  };

  if (status === "success") {
    return (
      <div className="newsletter-success">
        <p style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
          Thank you for subscribing!
        </p>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          You'll hear from me soon.
        </p>
      </div>
    );
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        style={{
          borderBottomColor: status === "error" ? "#c44" : undefined,
        }}
      />
      <button type="submit">→</button>
      {status === "error" && (
        <p
          style={{
            color: "#c44",
            fontSize: "0.8rem",
            marginTop: "0.5rem",
            position: "absolute",
          }}
        >
          Please enter a valid email
        </p>
      )}
    </form>
  );
}
