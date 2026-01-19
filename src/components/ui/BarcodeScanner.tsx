'use client';

import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { X, Camera, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
}

export function BarcodeScanner({ isOpen, onClose, onScan, title = 'Scan Barcode' }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setScanning(true);
      // Request camera with higher resolution for better barcode detection
      navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Prefer back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }
      })
        .then(() => setHasPermission(true))
        .catch(() => {
          // Fallback to any camera if back camera not available (laptop)
          navigator.mediaDevices.getUserMedia({ video: true })
            .then(() => setHasPermission(true))
            .catch(() => {
              setHasPermission(false);
              setError('Camera access denied. Please allow camera access to scan barcodes.');
            });
        });
    }
    return () => {
      setError(null);
      setHasPermission(null);
      setScanning(false);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScan = (result: { rawValue: string }[]) => {
    if (result && result.length > 0 && scanning) {
      const barcode = result[0].rawValue;
      if (barcode && barcode.length > 3) { // Filter out noise
        setScanning(false); // Prevent multiple scans
        onScan(barcode);
        onClose();
      }
    }
  };

  const handleError = (err: unknown) => {
    console.error('Scanner error:', err);
    // Don't show error for normal scanning attempts
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Camera className="w-4 h-4 text-neutral-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-sm">{title}</h3>
              <p className="text-xs text-neutral-500">Hold barcode steady in the frame</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Scanner Area - Optimized for barcode scanning */}
        <div className="relative aspect-[4/3] bg-neutral-900">
          {hasPermission === null && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}

          {hasPermission === false && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-white text-sm">{error}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => {
                  navigator.mediaDevices.getUserMedia({ video: true })
                    .then(() => {
                      setHasPermission(true);
                      setError(null);
                      setScanning(true);
                    })
                    .catch(() => setError('Camera access is required to scan barcodes.'));
                }}
              >
                Retry
              </Button>
            </div>
          )}

          {hasPermission && (
            <>
              <Scanner
                onScan={handleScan}
                onError={handleError}
                paused={!scanning}
                scanDelay={100} // Faster scanning for laptop cameras
                formats={['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code', 'codabar', 'itf']}
                constraints={{
                  facingMode: 'environment',
                  width: { min: 640, ideal: 1280, max: 1920 },
                  height: { min: 480, ideal: 720, max: 1080 },
                }}
                styles={{
                  container: {
                    width: '100%',
                    height: '100%',
                  },
                  video: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  },
                }}
              />
              {/* Scan overlay with scanning line animation */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-72 h-28 border-2 border-white/60 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
                    {/* Scanning line animation */}
                    <div className="absolute inset-x-0 h-0.5 bg-green-400 animate-pulse" style={{ top: '50%' }} />
                  </div>
                </div>
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-white/90 text-xs bg-black/40 inline-block px-3 py-1 rounded-full">
                    Position barcode in the green frame
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-100">
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BarcodeScanner;
