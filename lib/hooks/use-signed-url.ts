import { useState, useEffect } from "react";

/**
 * Lazily fetches a Supabase storage signed URL for a document.
 * Calls POST /api/storage/signed-url when documentId is non-null.
 */
export function useSignedUrl(documentId: string | null | undefined) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) {
      setSignedUrl(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setSignedUrl(null);

    fetch("/api/storage/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: documentId }),
    })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        const data = await res.json();
        setSignedUrl(data.signedUrl);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message ?? "Failed to fetch signed URL");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [documentId]);

  return { signedUrl, loading, error };
}
