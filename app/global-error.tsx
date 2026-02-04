"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="de">
      <body style={{ padding: "2rem", fontFamily: "sans-serif", background: "#111", color: "#eee" }}>
        <h1>Internal Server Error</h1>
        <p><strong>Fehlermeldung:</strong> {error.message}</p>
        {error.digest && <p><strong>Digest:</strong> {error.digest}</p>}
        <pre style={{ background: "#222", padding: "1rem", overflow: "auto", fontSize: "12px" }}>
          {error.stack}
        </pre>
        <button
          type="button"
          onClick={() => reset()}
          style={{ padding: "0.5rem 1rem", marginTop: "1rem", cursor: "pointer" }}
        >
          Erneut versuchen
        </button>
      </body>
    </html>
  )
}
