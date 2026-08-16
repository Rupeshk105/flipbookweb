'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { AlertCircle, Copy, Loader2, QrCode, RefreshCcw } from 'lucide-react';
import { generateAlbumAccessLink, regenerateAlbumAccessLink } from '@/lib/admin-actions';

interface AlbumQrCodeProps {
  albumId: string;
}

export function AlbumQrCode({ albumId }: AlbumQrCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadLink(action: typeof generateAlbumAccessLink) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await action(albumId);
      if (result.error || !result.url) {
        setError(result.error || 'Failed to generate QR code');
        return;
      }

      const dataUrl = await QRCode.toDataURL(result.url, { width: 240, margin: 1 });
      setQrDataUrl(dataUrl);
      setLink(result.url);
    } catch (err) {
      setError('Failed to generate QR code');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">Auto-login QR Code</p>
          <p className="text-xs text-slate-400">
            Signs the customer straight into this album every time it&apos;s scanned. Doesn&apos;t expire until you regenerate it.
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => loadLink(generateAlbumAccessLink)}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
            Show QR
          </button>
          {link && (
            <button
              type="button"
              onClick={() => loadLink(regenerateAlbumAccessLink)}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 disabled:opacity-50 whitespace-nowrap"
              title="Invalidate the current QR code and issue a new one"
            >
              <RefreshCcw size={16} />
              Regenerate
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {qrDataUrl && link && (
        <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="Album auto-login QR code" className="rounded-lg bg-white p-2" />
          <div className="flex-1 min-w-0">
            <p className="mb-1 text-xs text-slate-400">Share this link or QR code with the customer only:</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={link}
                className="w-full truncate rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs text-slate-300"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="flex-shrink-0 rounded-lg p-2 text-slate-300 transition hover:bg-slate-700"
                aria-label="Copy link"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

