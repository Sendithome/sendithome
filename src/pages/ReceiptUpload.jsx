import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, FileText, Check, X, Loader2, ArrowLeft, ArrowRight, AlertCircle, CheckSquare, Square, Package, ClipboardList } from 'lucide-react';
import BoxCard from '../components/BoxCard';
import ShipmentDeclarationForm from '../components/ShipmentDeclarationForm';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function ReceiptUpload() {
  const navigate = useNavigate();
  const pathParts = window.location.pathname.split('/');
  const orderId = pathParts[2];

  const [order, setOrder] = useState(null);
  const [savedReceipts, setSavedReceipts] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [boxSize, setBoxSize] = useState('');
  const [showBoxSelect, setShowBoxSelect] = useState(false);
  const [savingBox, setSavingBox] = useState(false);
  const [showDeclaration, setShowDeclaration] = useState(false);

  // Items extracted from current upload — pending confirmation
  const [pendingReceipt, setPendingReceipt] = useState(null);
  const [pendingItems, setPendingItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [confirming, setConfirming] = useState(false);
  // Combined review of all saved items
  const [reviewSelectedIds, setReviewSelectedIds] = useState(new Set());

  useEffect(() => {
    if (!orderId) return;
    loadData();
  }, [orderId]);

  const loadData = async () => {
    const [orders, existingReceipts, existingItems] = await Promise.all([
      base44.entities.Order.filter({ id: orderId }),
      base44.entities.Receipt.filter({ order_id: orderId }),
      base44.entities.OrderItem.filter({ order_id: orderId }),
    ]);
    if (orders.length > 0) setOrder(orders[0]);
    setSavedReceipts(existingReceipts);
    setSavedItems(existingItems);
    setReviewSelectedIds(new Set(existingItems.map(i => i.id)));
  };

  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    const receipt = await base44.entities.Receipt.create({
      order_id: orderId,
      file_url,
      processing_status: 'processing',
    });
    setPendingReceipt({ ...receipt, file_url });
    setUploading(false);

    setProcessing(true);
    const extractResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this shopping receipt image. Extract all purchased items with their names, categories, quantities, and prices.
      Also check if each item is eligible for international shipping (NOT eligible: perishable food, hazardous materials, live plants, weapons, alcohol over 5L, tobacco over 200 cigarettes, prescription medicine, counterfeit goods).
      If not eligible, state the reason.`,
      response_json_schema: {
        type: "object",
        properties: {
          store_name: { type: "string" },
          total_amount: { type: "number" },
          currency: { type: "string" },
          purchase_date: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                item_name: { type: "string" },
                category: { type: "string" },
                quantity: { type: "number" },
                price: { type: "number" },
                eligible: { type: "boolean" },
                ineligible_reason: { type: "string" },
              },
            },
          },
        },
      },
      file_urls: [file_url],
    });

    await base44.entities.Receipt.update(receipt.id, {
      store_name: extractResult.store_name,
      total_amount: extractResult.total_amount,
      currency: extractResult.currency,
      purchase_date: extractResult.purchase_date,
      processing_status: 'completed',
      extracted_items_count: extractResult.items?.length || 0,
    });

    const extractedItems = (extractResult.items || []).map((item, idx) => ({
      _tempId: `temp_${idx}`,
      order_id: orderId,
      item_name: item.item_name,
      category: item.category,
      quantity: item.quantity || 1,
      price: item.price,
      currency: extractResult.currency,
      eligible: item.eligible !== false,
      ineligible_reason: item.ineligible_reason || '',
      receipt_url: file_url,
    }));

    setPendingItems(extractedItems);
    // Pre-select all eligible items
    const eligibleIds = new Set(extractedItems.filter(i => i.eligible !== false).map(i => i._tempId));
    setSelectedIds(eligibleIds);
    setProcessing(false);
  }, [orderId]);

  const toggleItem = (tempId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(tempId)) next.delete(tempId);
      else next.add(tempId);
      return next;
    });
  };

  const toggleAll = () => {
    const eligible = pendingItems.filter(i => i.eligible !== false);
    const allSelected = eligible.every(i => selectedIds.has(i._tempId));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(eligible.map(i => i._tempId)));
    }
  };

  const handleConfirmItems = async () => {
    setConfirming(true);
    const toSave = pendingItems.filter(i => selectedIds.has(i._tempId));
    if (toSave.length > 0) {
      const itemsToCreate = toSave.map(({ _tempId, ...item }) => item);
      await base44.entities.OrderItem.bulkCreate(itemsToCreate);
    }
    await base44.entities.Order.update(orderId, {
      status: 'receipt_uploaded',
    });
    setPendingReceipt(null);
    setPendingItems([]);
    setSelectedIds(new Set());
    setConfirming(false);
    loadData();
  };

  const eligibleItems = pendingItems.filter(i => i.eligible !== false);
  const ineligibleItems = pendingItems.filter(i => i.eligible === false);
  const allEligibleSelected = eligibleItems.length > 0 && eligibleItems.every(i => selectedIds.has(i._tempId));
  const selectedCount = pendingItems.filter(i => selectedIds.has(i._tempId)).length;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Upload Receipts</h1>
          <p className="text-xs text-muted-foreground">
            {order?.order_number || 'Loading...'} · {order?.box_size} box
          </p>
        </div>
      </div>

      {/* Upload area — only show if no pending items */}
      {pendingItems.length === 0 && (
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-accent/30 rounded-2xl p-8 text-center hover:border-accent/60 hover:bg-accent/5 transition-all">
            {uploading || processing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <p className="text-sm font-medium text-foreground">
                  {processing ? 'AI is scanning your receipt...' : 'Uploading...'}
                </p>
                <p className="text-xs text-muted-foreground">This may take a moment</p>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-6 h-6 text-accent" />
                </div>
                <p className="text-sm font-semibold text-foreground">Upload Receipt Photo</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Take a photo or upload an image of your shopping receipt
                </p>
                <p className="text-xs text-accent font-medium mt-3">
                  Our AI will auto-extract all items
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading || processing}
          />
        </label>
      )}

      {/* Item selection — shown after extraction */}
      {pendingItems.length > 0 && (
        <div>
          {/* Store header */}
          {pendingReceipt?.store_name && (
            <div className="flex items-center gap-3 bg-card rounded-2xl border border-border p-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold">{pendingReceipt.store_name}</p>
                <p className="text-xs text-muted-foreground">{eligibleItems.length} eligible items found</p>
              </div>
            </div>
          )}

          {/* Eligible items with checkboxes */}
          {eligibleItems.length > 0 && (
            <div className="bg-card rounded-2xl border border-border overflow-hidden mb-4">
              {/* Select all header */}
              <button
                onClick={toggleAll}
                className="w-full flex items-center justify-between px-4 py-3 border-b border-border hover:bg-muted/40 transition-colors"
              >
                <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Eligible Items — Select to Ship
                </span>
                <div className="flex items-center gap-1.5">
                  {allEligibleSelected
                    ? <CheckSquare className="w-4 h-4 text-accent" />
                    : <Square className="w-4 h-4 text-muted-foreground" />
                  }
                  <span className="text-xs text-muted-foreground">All</span>
                </div>
              </button>

              <div className="divide-y divide-border">
                {eligibleItems.map((item) => {
                  const isSelected = selectedIds.has(item._tempId);
                  return (
                    <button
                      key={item._tempId}
                      onClick={() => toggleItem(item._tempId)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-all ${isSelected ? 'bg-accent border-accent' : 'border-border'}`}>
                        {isSelected && <Check className="w-3 h-3 text-accent-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate transition-colors ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {item.item_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.category} · Qty: {item.quantity}</p>
                      </div>
                      <span className={`text-sm font-medium shrink-0 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {item.currency} {item.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ineligible items */}
          {ineligibleItems.length > 0 && (
            <div className="bg-destructive/5 rounded-2xl border border-destructive/20 overflow-hidden mb-4">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-destructive/20">
                <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                <span className="text-xs font-semibold text-destructive uppercase tracking-wide">
                  Cannot Ship ({ineligibleItems.length})
                </span>
              </div>
              <div className="divide-y divide-destructive/10">
                {ineligibleItems.map((item) => (
                  <div key={item._tempId} className="flex items-center gap-3 px-4 py-3 opacity-60">
                    <div className="w-5 h-5 rounded border-2 border-destructive/40 flex items-center justify-center shrink-0">
                      <X className="w-3 h-3 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate line-through text-muted-foreground">{item.item_name}</p>
                      <p className="text-xs text-destructive">{item.ineligible_reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirm bar */}
          <div className="bg-card rounded-2xl border border-accent/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{selectedCount} item{selectedCount !== 1 ? 's' : ''} selected</span>
              <span className="text-sm font-semibold text-foreground">
                {selectedCount > 0 && eligibleItems.filter(i => selectedIds.has(i._tempId)).reduce((sum, i) => sum + (i.price || 0), 0).toFixed(2)} {eligibleItems[0]?.currency || ''}
              </span>
            </div>
            <Button
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl h-11"
              onClick={handleConfirmItems}
              disabled={confirming || selectedCount === 0}
            >
              {confirming ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Confirm {selectedCount} Item{selectedCount !== 1 ? 's' : ''} to Ship
            </Button>
          </div>
        </div>
      )}

      {/* Combined items review — shown when receipts exist and no pending extraction */}
      {savedItems.length > 0 && pendingItems.length === 0 && (
        <div className="mt-6">
          {/* Receipts summary */}
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">{savedReceipts.length} Receipt{savedReceipts.length !== 1 ? 's' : ''} Uploaded</h3>
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            {savedReceipts.map((r) => (
              <div key={r.id} className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                <Check className="w-3 h-3 text-green-600" />
                <span className="text-xs font-medium text-green-800">{r.store_name || 'Receipt'}</span>
                <span className="text-[10px] text-green-600">({r.extracted_items_count || 0} items)</span>
              </div>
            ))}
          </div>

          {/* All items combined checklist */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden mb-4">
            <button
              onClick={() => {
                const allIds = new Set(savedItems.filter(i => i.eligible !== false).map(i => i.id));
                const allSelected = savedItems.filter(i => i.eligible !== false).every(i => reviewSelectedIds.has(i.id));
                setReviewSelectedIds(allSelected ? new Set() : allIds);
              }}
              className="w-full flex items-center justify-between px-4 py-3 border-b border-border hover:bg-muted/40 transition-colors"
            >
              <span className="text-xs font-semibold text-foreground uppercase tracking-wide">All Items to Ship</span>
              <div className="flex items-center gap-1.5">
                {savedItems.filter(i => i.eligible !== false).every(i => reviewSelectedIds.has(i.id))
                  ? <CheckSquare className="w-4 h-4 text-accent" />
                  : <Square className="w-4 h-4 text-muted-foreground" />}
                <span className="text-xs text-muted-foreground">All</span>
              </div>
            </button>
            <div className="divide-y divide-border">
              {savedItems.map((item) => {
                const isSelected = reviewSelectedIds.has(item.id);
                const canSelect = item.eligible !== false;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (!canSelect) return;
                      setReviewSelectedIds(prev => { const n = new Set(prev); n.has(item.id) ? n.delete(item.id) : n.add(item.id); return n; });
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${canSelect ? 'hover:bg-muted/30 cursor-pointer' : 'opacity-50 cursor-default'}`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-all ${
                      !canSelect ? 'border-destructive/40 bg-destructive/5' : isSelected ? 'bg-accent border-accent' : 'border-border'
                    }`}>
                      {!canSelect ? <X className="w-3 h-3 text-destructive" /> : isSelected && <Check className="w-3 h-3 text-accent-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${!canSelect ? 'line-through text-muted-foreground' : isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {item.item_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.category} · Qty: {item.quantity}{!canSelect && ` · ${item.ineligible_reason}`}</p>
                    </div>
                    <span className={`text-sm font-medium shrink-0 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {item.currency} {item.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shipment Declaration Form — shown before box/payment */}
          {showDeclaration && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardList className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold text-foreground">Shipment Declaration Form</h3>
              </div>
              <ShipmentDeclarationForm order={order} items={savedItems} />
            </div>
          )}

          {/* Summary + actions */}
          <div className="bg-card rounded-2xl border border-accent/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{reviewSelectedIds.size} item{reviewSelectedIds.size !== 1 ? 's' : ''} to ship</span>
              <button
                onClick={() => setShowDeclaration(v => !v)}
                className="text-xs text-accent font-medium hover:underline flex items-center gap-1"
              >
                <ClipboardList className="w-3 h-3" />
                {showDeclaration ? 'Hide' : 'View'} Declaration Form
              </button>
            </div>
        </div>
      )}
    </div>
  );
}