import { redirect } from "next/navigation"

/** Startseite: Weiterleitung auf die Hauptseite. */
export default function StartPage() {
  redirect("/")
}
