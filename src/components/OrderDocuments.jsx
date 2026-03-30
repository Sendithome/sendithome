import { useState, useEffect } from 'react';
import { FileText, Upload, Loader2, ExternalLink, Trash2, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const DOC_TYPES = [
  { value: 'commercial_invoice', label: 'Commercial Invoice', icon: '🧾' },
  { value: 'packing_list', label: 'Packing List', icon: '📋' },
  { value: 'customs_declaration', label: 'Customs Declaration', icon: '🛃' },
  { value: 'receipt', label: 'Receipt', icon: '🗒️' },
  { value: 'other', label: 'Other', icon: '📎' },
];

export default function OrderDocuments({ orderId }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('commercial_invoice');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadDocs();
  }, [orderId]);

  const loadDocs = async () => {
    setLoading(true);
    const results = await base44.entities.OrderDocument.filter({ order_id: orderId });
    setDocs(results);
    setLoading(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);

    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.OrderDocument.create({
      order_id: orderId,
      doc_type: selectedType,
      file_name: file.name,
      file_url,
    });
    await loadDocs();
    setUploading(false);
  };

  const handleDelete = async (docId) => {
    setDeletingId(docId);
    await base44.entities.OrderDocument.delete(docId);
    setDocs(prev => prev.filter(d => d.id !== docId));
    setDeletingId(null);
  };

  const getDocType = (value) => DOC_TYPES.find(t => t.value === value) || DOC_TYPES[4];

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileCheck className="w-4 h-4 text-accent" />
        <span className="text-sm font-semibold">Shipping Documents</span>
        {docs.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">{docs.length} file{docs.length > 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Upload section */}
      <div className="bg-muted/40 rounded-xl p-3 space-y-3">
        <p className="text-xs font-medium text-muted-foreground">Upload a document</p>
        {/* Type selector */}
        <div className="flex flex-wrap gap-1.5">
          {DOC_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setSelectedType(t.value)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors font-medium ${
                selectedType === t.value
                  ? 'bg-accent text-accent-foreground border-accent'
                  : 'bg-background text-muted-foreground border-border hover:border-accent/50'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        {/* Upload button */}
        <label className={`flex items-center justify-center gap-2 h-9 px-4 rounded-xl text-sm font-medium cursor-pointer transition-colors w-full border border-dashed ${
          uploading ? 'opacity-60 pointer-events-none border-border bg-muted' : 'border-accent/40 bg-accent/5 text-accent hover:bg-accent/10'
        }`}>
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
          ) : (
            <><Upload className="w-4 h-4" /> Choose File (PDF, JPG, PNG)</>
          )}
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {/* Document list */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-4">
          <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No documents uploaded yet</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Upload commercial invoices, packing lists, and more</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => {
            const type = getDocType(doc.doc_type);
            return (
              <div key={doc.id} className="flex items-center gap-3 bg-muted/30 rounded-xl px-3 py-2.5 border border-border">
                <span className="text-lg shrink-0">{type.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{doc.file_name || type.label}</p>
                  <p className="text-[10px] text-muted-foreground">{type.label} · {new Date(doc.created_date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    title="View"
                  >
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="w-7 h-7 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
                    title="Delete"
                  >
                    {deletingId === doc.id
                      ? <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                      : <Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-500" />
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}