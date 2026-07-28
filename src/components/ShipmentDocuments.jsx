import { useState, useEffect } from 'react';
import { FileText, Download, Loader2, FileCheck, Receipt as ReceiptIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const DOC_TYPE_META = {
  commercial_invoice: { label: 'Commercial Invoice', icon: '🧾' },
  packing_list: { label: 'Packing List', icon: '📋' },
  customs_declaration: { label: 'Customs Declaration', icon: '🛃' },
  receipt: { label: 'Receipt', icon: '🗒️' },
  other: { label: 'Document', icon: '📎' },
};

export default function ShipmentDocuments({ orderId, order, items }) {
  const [docs, setDocs] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingDecl, setGeneratingDecl] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    loadData();
  }, [orderId]);

  const loadData = async () => {
    setLoading(true);
    const [orderDocs, receiptRecords] = await Promise.all([
      base44.entities.OrderDocument.filter({ order_id: orderId }),
      base44.entities.Receipt.filter({ order_id: orderId }),
    ]);
    setDocs(orderDocs);
    setReceipts(receiptRecords);
    setLoading(false);
  };

  const handleDownloadDeclaration = async () => {
    setGeneratingDecl(true);
    const eligibleItems = (items || []).filter((i) => i.eligible !== false);
    const response = await base44.functions.invoke(
      'generateDeclarationPDF',
      { order, items: eligibleItems, signature: null },
      { responseType: 'arraybuffer' }
    );
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customs-declaration-${order?.order_number || 'SIH'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setGeneratingDecl(false);
  };

  const getMeta = (value) => DOC_TYPE_META[value] || DOC_TYPE_META.other;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-center gap-2">
        <FileCheck className="w-4 h-4 text-accent" />
        <span className="text-sm font-semibold">Shipment Documents</span>
        <span className="ml-auto text-[10px] text-muted-foreground">Download only</span>
      </div>

      {/* Customs Declaration — generate & download */}
      <button
        onClick={handleDownloadDeclaration}
        disabled={generatingDecl}
        className="w-full flex items-center justify-between bg-accent/5 border border-accent/30 rounded-xl px-4 py-3 hover:bg-accent/10 transition-colors disabled:opacity-60"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            {generatingDecl ? (
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
            ) : (
              <FileText className="w-4 h-4 text-accent" />
            )}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-foreground">Customs Declaration</p>
            <p className="text-[10px] text-muted-foreground">Download your signed declaration PDF</p>
          </div>
        </div>
        <Download className="w-4 h-4 text-accent" />
      </button>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stored documents (commercial invoice, packing list, etc.) */}
          {docs.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Official Documents
              </p>
              {docs.map((doc) => {
                const meta = getMeta(doc.doc_type);
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 bg-muted/30 rounded-xl px-3 py-2.5 border border-border"
                  >
                    <span className="text-lg shrink-0">{meta.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {doc.file_name || meta.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {meta.label} · {new Date(doc.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex items-center gap-1 text-[10px] font-semibold text-accent bg-accent/10 hover:bg-accent/20 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <Download className="w-3 h-3" /> Download
                    </a>
                  </div>
                );
              })}
            </div>
          )}

          {/* Uploaded shopping receipts */}
          {receipts.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Shopping Receipts
              </p>
              {receipts.map((r, i) => (
                <div
                  key={r.id || i}
                  className="flex items-center gap-3 bg-muted/30 rounded-xl px-3 py-2.5 border border-border"
                >
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <ReceiptIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {r.store_name || `Receipt ${i + 1}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {r.currency ? `${r.currency} ` : ''}
                      {(r.total_amount || 0).toFixed(2)}
                      {r.purchase_date
                        ? ` · ${new Date(r.purchase_date).toLocaleDateString()}`
                        : ''}
                    </p>
                  </div>
                  <a
                    href={r.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-1 text-[10px] font-semibold text-accent bg-accent/10 hover:bg-accent/20 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Download className="w-3 h-3" /> Download
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {docs.length === 0 && receipts.length === 0 && (
            <div className="text-center py-4">
              <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No additional documents available yet</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}