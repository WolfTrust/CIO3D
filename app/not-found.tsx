import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-background text-foreground">
      <h1 className="text-2xl font-semibold">Seite nicht gefunden</h1>
      <p className="text-muted-foreground">Die angeforderte URL existiert nicht.</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
      >
        Zur Startseite
      </Link>
    </div>
  )
}
