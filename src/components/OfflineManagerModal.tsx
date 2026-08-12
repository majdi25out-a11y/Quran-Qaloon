import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  Download,
  Upload,
  X,
  CheckCircle,
  HardDrive,
  Smartphone,
  Copy,
  ExternalLink,
  Share2
} from 'lucide-react';
import { storageService } from '../services/storage';

interface OfflineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncCompleted: () => void;
}

export const OfflineManagerModal: React.FC<OfflineManagerModalProps> = ({
  isOpen,
  onClose,
  onSyncCompleted
}) => {
  if (!isOpen) return null;

  const status = storageService.getOfflineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const [appUrl, setAppUrl] = useState(() => {
    return window.location.origin + window.location.pathname;
  });
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleRegenerateLink = () => {
    setIsRegenerating(true);
    const cleanOrigin = window.location.origin;
    const freshUrl = `${cleanOrigin}/?v=${Date.now()}`;
    setAppUrl(freshUrl);
    setTimeout(() => {
      setIsRegenerating(false);
    }, 600);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'تطبيق مقرأة قالون - PWA',
          text: 'رابط تثبيت تطبيق مقرأة قالون للتسميع والتحفيظ',
          url: appUrl,
        });
      } catch (err) {
        console.log('Share canceled or error:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const count = storageService.syncPendingData();
      setIsSyncing(false);
      setSyncSuccessMsg(`تمت مزامنة ${count} من التغييرات بنجاح مع قاعدة البيانات.`);
      onSyncCompleted();
    }, 1200);
  };

  const handleExportBackup = () => {
    const jsonStr = storageService.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_qaloon_teacher_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storageService.importBackupJSON(content)) {
        alert('تمت استعادة النسخة الاحتياطية بنجاح!');
        onSyncCompleted();
        onClose();
      } else {
        alert('صيغة ملف النسخة الاحتياطية غير صالحة.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute left-5 top-5 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6 border-b border-slate-800 pb-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 font-arabic">
              فتح التطبيق على الهاتف والعمل بدون إنترنت
            </h3>
            <p className="text-xs text-slate-400">
              قم بتثبيت التطبيق على هاتفك المحمول لاستخدامه في أي مكان بدون اتصال بالإنترنت
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Mobile Direct Link, QR Code & Regenerate */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center space-x-1.5 rtl:space-x-reverse">
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>رابط تثبيت التطبيق على الهاتف (PWA)</span>
              </span>
              <button
                onClick={handleRegenerateLink}
                disabled={isRegenerating}
                className="flex items-center space-x-1 rtl:space-x-reverse text-[10px] bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-lg font-bold transition-all"
              >
                <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                <span>{isRegenerating ? 'جاري التوليد...' : 'إعادة توليد الرابط (Régénérer)'}</span>
              </button>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="bg-white p-2 rounded-lg shadow-md shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(appUrl)}`}
                  alt="QR Code Installation"
                  className="w-28 h-28 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 space-y-2 text-right w-full">
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  امسح رمز الـ <strong>QR Code</strong> بكاميرا هاتفك مباشرة، أو انسخ الرابط المحدث أدناه لفتحه في متصفح الموبايل:
                </p>

                <div className="flex items-center space-x-1.5 rtl:space-x-reverse bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                  <input
                    type="text"
                    readOnly
                    value={appUrl}
                    className="w-full bg-transparent text-slate-300 font-mono text-[10px] focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-md shrink-0 text-[10px] transition-all"
                  >
                    {copiedLink ? <CheckCircle className="w-3 h-3 text-slate-950" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? 'تم النسخ!' : 'نسخ'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleNativeShare}
                    className="flex-1 flex items-center justify-center space-x-1 rtl:space-x-reverse py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition-all"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>مشاركة عبر الموبايل</span>
                  </button>
                  <a
                    href={appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-1 rtl:space-x-reverse px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg transition-all"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>فتح</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Installation Instructions */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200 text-xs flex items-center space-x-2 rtl:space-x-reverse">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>كيفية التثبيت على الشاشة الرئيسية للموبايل؟</span>
            </h4>

            <div className="space-y-2 text-[11px] text-slate-300">
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80">
                <strong className="text-emerald-400 block mb-0.5">📱 على أجهزة أندرويد (Google Chrome / Edge):</strong>
                <span>1. افتح الرابط في متصفح Chrome.</span><br/>
                <span>2. اضغط على القائمة (3 نقاط <strong className="text-slate-100">⋮</strong>) في الأعلى.</span><br/>
                <span>3. اختر <strong className="text-amber-300">"الإضافة إلى الشاشة الرئيسية"</strong> أو <strong className="text-amber-300">"تثبيت التطبيق"</strong>.</span>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80">
                <strong className="text-emerald-400 block mb-0.5">🍏 على أجهزة آيفون / آيباد (Safari):</strong>
                <span>1. افتح الرابط في متصفح Safari.</span><br/>
                <span>2. اضغط على زر المشاركة <strong className="text-slate-100">⎋</strong> في الأسفل.</span><br/>
                <span>3. اسحب لأسفل واختر <strong className="text-amber-300">"إضافة إلى الشاشة الرئيسية"</strong>.</span>
              </div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">حالة الاتصال</span>
              <div className="flex items-center space-x-2 rtl:space-x-reverse mt-1">
                {status.isOfflineMode ? (
                  <>
                    <WifiOff className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-amber-300">بدون إنترنت (نشط)</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-emerald-300">متصل بالإنترنت</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">التخزين المحلي</span>
              <div className="flex items-center space-x-2 rtl:space-x-reverse mt-1">
                <HardDrive className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-slate-200">{status.pendingSyncCount} عنصر محلي</span>
              </div>
            </div>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all disabled:opacity-50 shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة البيانات الآن'}</span>
          </button>

          {syncSuccessMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-center space-x-2 rtl:space-x-reverse">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncSuccessMsg}</span>
            </div>
          )}

          {/* Export & Import Backup */}
          <div className="pt-2 border-t border-slate-800 flex space-x-2 rtl:space-x-reverse">
            <button
              onClick={handleExportBackup}
              className="flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>تصدير نسخة JSON</span>
            </button>

            <label className="flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold cursor-pointer">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>استعادة JSON</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
