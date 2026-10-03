import { useEffect } from 'react'

export default function Privacy() {
  useEffect(() => { document.title = 'Privacy · DocReady' }, [])
  return (
    <article className="page-enter mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-5xl font-semibold">Your documents stay private.</h1>
      <p className="mt-4 text-lg font-medium">Files are processed temporarily and are not permanently stored.</p>
      <h2 className="mt-10 text-3xl font-semibold">What happens to your file</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
        <li>Your upload is read in memory for analysis and formatting. The original is never saved to disk or modified.</li>
        <li>Only the formatted result is written to a temporary folder under a random name.</li>
        <li>That result is deleted as soon as you download it, when you press Start Over, or automatically after 15 minutes, whichever comes first.</li>
        <li>Anything still left is cleared when the service shuts down.</li>
      </ul>
      <h2 className="mt-10 text-3xl font-semibold">What we don't do</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
        <li>No accounts or sign-up, so nothing is tied to your identity.</li>
        <li>No reading of your document for any purpose other than formatting it.</li>
        <li>No advertising or tracking scripts in the app.</li>
      </ul>
      <h2 className="mt-10 text-3xl font-semibold">Logs</h2>
      <p className="mt-3 text-muted">If something fails, the server logs the technical error, never the contents of your document. If you host DocReady yourself, your hosting provider may keep its own request logs.</p>
    </article>
  )
}
