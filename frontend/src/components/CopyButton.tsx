import { useState } from "react";

// Copies text to the clipboard and briefly shows "Copied".
// (Phase 6 will add auto-clearing the clipboard after a timeout.)
export default function CopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can be blocked (e.g. non-HTTPS on some browsers); ignore.
    }
  }

  return (
    <button className="icon" onClick={copy} type="button">
      {copied ? "✓ Copied" : label}
    </button>
  );
}
