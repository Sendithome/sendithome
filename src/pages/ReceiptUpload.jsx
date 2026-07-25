import { useState, useEffect, useCallback } from 'react';
import { buildRestrictionPrompt } from '../utils/countryRestrictions';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, FileText, Check, X, Loader2, ArrowLeft, ArrowRight, AlertCircle, CheckSquare, Square, Package, ClipboardList } from 'lucide-react';
import BoxCard from '../components/BoxCard';
import ShipmentDeclarationForm from '../components/ShipmentDeclarationForm';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const STEPS = ['Upload Receipts', 'Select Box', 'Customs Declaration'];

export default function ReceiptUpload() {
  const navigate = useNavigate();
  const pathParts = window.location.pathname.split('/');
  const orderId = pathParts[2];

  const [step, setStep] = useState(0);
  const [order, setOrder] = useState(null);
  const [savedReceipts, setSavedReceipts] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [boxSize, setBoxSize] = useState('');
  const [savingBox, setSavingBox] = useState(false);

  const [pendingReceipt, setPendingReceipt] = useState(null);
  const [pendingItems, setPendingItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [confirming, setConfirming] = useState(false);
  const [reviewSelectedIds, setReviewSelectedIds] = useState(new Set());

  useEffect(() => {
    if (!orderId) return;
    loadData();
  }, [orderId]);

  const loadData = async () => {
    const [order, existingReceipts, existingItems] = await Promise.all([
      base44.entities.Order.get(orderId),
      base44.entities.Receipt.filter({ order_id: orderId }),
      base44.entities.OrderItem.filter({ order_id: orderId }),
    ]);
    if (order) setOrder(order);
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
    const restrictionNote = buildRestrictionPrompt(order?.destination_country);
    const extractResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this shopping receipt image. Extract all purchased items with their names, categories, quantities, and prices.
      Determine eligibility for international shipping strictly based on category.
      ELIGIBLE categories (mark eligible: true): Women's Fashion, Men's Fashion, Children's Fashion, Clothing, Apparel, Footwear, Bags, Hats, Accessories, Souvenirs, Kids Toys.
      ALL OTHER categories are NOT eligible (mark eligible: false) — including food, electronics, cosmetics, medicine, alcohol, tobacco, hazardous materials, etc.
      For ineligible items, provide a short reason why they cannot be shipped.${restrictionNote}`,
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
    setSelectedIds(allSelected ? new Set() : new Set(eligible.map(i => i._tempId)));
  };

  const handleConfirmItems = async () => {
    setConfirming(true);
    const toSave = pendingItems.filter(i => selectedIds.has(i._tempId));
    if (toSave.length > 0) {
      const itemsToCreate = toSave.map(({ _tempId, ...item }) => item);
      await base44.entities.OrderItem.bulkCreate(itemsToCreate);
    }
    await base44.entities.Order.update(orderId, { status: 'receipt_uploaded' });
    setPendingReceipt(null);
    setPendingItems([]);
    setSelectedIds(new Set());
    setConfirming(false);
    loadData();
  };

  const handleProceedToBoxSelect = async () => {
    setStep(1);
  };

  const handleProceedToDeclaration = () => setStep(2);

  const handleProceedToPayment = async () => {
    setSavingBox(true);
    await base44.entities.Order.update(orderId, { box_size: boxSize });
    // Trigger retailer verifications now that tourist has signed the customs declaration
    base44.functions.invoke('createRetailerVerifications', { order_id: orderId }).catch(() => {});
    navigate(`/order/${orderId}/payment`);
  };

  const eligibleItems = pendingItems.filter(i => i.eligible !== false);
  const ineligibleItems = pendingItems.filter(i => i.eligible === false);
  const allEligibleSelected = eligibleItems.length > 0 && eligibleItems.every(i => selectedIds.has(i._tempId));
  const selectedCount = pendingItems.filter(i => selectedIds.has(i._tempId)).length;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">{STEPS[step]}</h1>
          <p className="text-xs text-white/60">
            Step {step + 1} of {STEPS.length} · {order?.order_number || 'Loading...'}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-accent' : 'bg-muted'}`} />
        ))}
      </div>

      {/* ── STEP 0: Upload Receipts ── */}
      {step === 0 && (
        <div>
          {/* Upload area */}
          {pendingItems.length === 0 && (
            <div className="mb-6">
              <div className="border-2 border-dashed border-accent/30 rounded-2xl p-8 text-center hover:border-accent/60 hover:bg-accent/5 transition-all">
                {uploading || processing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                    <p className="text-sm font-medium text-white">
                      {processing ? 'AI is scanning your receipt...' : 'Uploading...'}
                    </p>
                    <p className="text-xs text-white/60">This may take a moment</p>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                      <Camera className="w-6 h-6 text-accent" />
                    </div>
                    <p className="text-sm font-semibold text-white">Upload Your Receipt</p>
                    <p className="text-xs text-white/60 mt-1">
                      Take a photo of your receipt or upload an existing image.
                    </p>
                    <p className="text-xs text-accent font-medium mt-3">Our AI automatically identifies and extracts your purchased items for review.</p>
                    <div className="flex gap-3 justify-center mt-5">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold bg-accent text-accent-foreground hover:bg-accent/90 transition-colors">
                        <Camera className="w-3.5 h-3.5" />
                        Take Photo
                        <input type="file" accept="image/*" capture className="hidden" onChange={handleFileUpload} disabled={uploading || processing} />
                      </label>
                      <label className="cursor-pointer inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold border border-input bg-background hover:bg-muted transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        Upload File
                        <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} disabled={uploading || processing} />
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Pending item selection */}
          {pendingItems.length > 0 && (
            <div>
              {pendingReceipt?.store_name && (
                <div className="flex items-center gap-3 bg-card rounded-2xl border border-border p-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{pendingReceipt.store_name}</p>
                    <p className="text-xs text-muted-foreground">{eligibleItems.length} eligible · {ineligibleItems.length} not eligible</p>
                  </div>
                </div>
              )}

              {/* Two-column layout */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Eligible Column */}
                <div className="bg-green-50 border border-green-200 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-green-200 bg-green-100">
                    <span className="text-[11px] font-bold text-green-800 uppercase tracking-wide">✅ Approved for Shipping</span>
                    <button onClick={toggleAll} className="text-[10px] text-green-700 font-medium hover:underline">
                      {allEligibleSelected ? 'None' : 'All'}
                    </button>
                  </div>
                  <div className="divide-y divide-green-100">
                    {eligibleItems.length === 0 && (
                      <p className="text-xs text-green-700 px-3 py-4 text-center opacity-60">No eligible items</p>
                    )}
                    {eligibleItems.map((item) => {
                      const isSelected = selectedIds.has(item._tempId);
                      return (
                        <button key={item._tempId} onClick={() => toggleItem(item._tempId)} className="w-full flex items-start gap-2 px-3 py-2.5 hover:bg-green-100/60 transition-colors text-left">
                          <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border-2 transition-all ${isSelected ? 'bg-green-600 border-green-600' : 'border-green-400 bg-white'}`}>
                            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-green-900 leading-snug">{item.item_name}</p>
                            <p className="text-[10px] text-green-700">{item.category}</p>
                            {item.price && <p className="text-[10px] text-green-800 font-semibold">{item.currency} {item.price}</p>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Non-Eligible Column */}
                <div className="bg-red-50 border border-red-200 rounded-2xl overflow-hidden">
                  <div className="flex items-center px-3 py-2.5 border-b border-red-200 bg-red-100">
                    <span className="text-[11px] font-bold text-red-800 uppercase tracking-wide">❌ Restricted Items</span>
                  </div>
                  <div className="divide-y divide-red-100">
                    {ineligibleItems.length === 0 && (
                      <p className="text-xs text-red-700 px-3 py-4 text-center opacity-60">None</p>
                    )}
                    {ineligibleItems.map((item) => (
                      <div key={item._tempId} className="flex items-start gap-2 px-3 py-2.5">
                        <div className="w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border-2 border-red-300 bg-white">
                          <X className="w-2.5 h-2.5 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-red-900 line-through leading-snug">{item.item_name}</p>
                          <p className="text-[10px] text-red-600">{item.ineligible_reason || item.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl h-11"
                onClick={handleConfirmItems}
                disabled={confirming || selectedCount === 0}
              >
                {confirming ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                Confirm {selectedCount} Item{selectedCount !== 1 ? 's' : ''} to Ship
              </Button>
            </div>
          )}

          {/* Saved receipts summary + actions */}
          {savedItems.length > 0 && pendingItems.length === 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold text-white">{savedReceipts.length} Receipt{savedReceipts.length !== 1 ? 's' : ''} Uploaded</h3>
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

              {/* Two-column review layout */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Eligible saved */}
                <div className="bg-green-50 border border-green-200 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-green-200 bg-green-100">
                    <span className="text-[11px] font-bold text-green-800 uppercase tracking-wide">✅ Approved for Shipping</span>
                    <button
                      onClick={() => {
                        const eligible = savedItems.filter(i => i.eligible !== false);
                        const allSel = eligible.every(i => reviewSelectedIds.has(i.id));
                        setReviewSelectedIds(allSel ? new Set() : new Set(eligible.map(i => i.id)));
                      }}
                      className="text-[10px] text-green-700 font-medium hover:underline"
                    >
                      {savedItems.filter(i => i.eligible !== false).every(i => reviewSelectedIds.has(i.id)) ? 'None' : 'All'}
                    </button>
                  </div>
                  <div className="divide-y divide-green-100">
                    {savedItems.filter(i => i.eligible !== false).map((item) => {
                      const isSelected = reviewSelectedIds.has(item.id);
                      return (
                        <button key={item.id} onClick={() => setReviewSelectedIds(prev => { const n = new Set(prev); n.has(item.id) ? n.delete(item.id) : n.add(item.id); return n; })} className="w-full flex items-start gap-2 px-3 py-2.5 hover:bg-green-100/60 transition-colors text-left">
                          <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border-2 transition-all ${isSelected ? 'bg-green-600 border-green-600' : 'border-green-400 bg-white'}`}>
                            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-green-900 leading-snug">{item.item_name}</p>
                            <p className="text-[10px] text-green-700">{item.category}</p>
                            {item.price && <p className="text-[10px] text-green-800 font-semibold">{item.currency} {item.price}</p>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Non-eligible saved */}
                <div className="bg-red-50 border border-red-200 rounded-2xl overflow-hidden">
                  <div className="flex items-center px-3 py-2.5 border-b border-red-200 bg-red-100">
                    <span className="text-[11px] font-bold text-red-800 uppercase tracking-wide">❌ Restricted Items</span>
                  </div>
                  <div className="divide-y divide-red-100">
                    {savedItems.filter(i => i.eligible === false).length === 0 && (
                      <p className="text-xs text-red-700 px-3 py-4 text-center opacity-60">None</p>
                    )}
                    {savedItems.filter(i => i.eligible === false).map((item) => (
                      <div key={item.id} className="flex items-start gap-2 px-3 py-2.5">
                        <div className="w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border-2 border-red-300 bg-white">
                          <X className="w-2.5 h-2.5 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-red-900 line-through leading-snug">{item.item_name}</p>
                          <p className="text-[10px] text-red-600">{item.ineligible_reason || item.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl h-12"
                  onClick={handleProceedToBoxSelect}
                  disabled={reviewSelectedIds.size === 0}
                >
                  Continue — Select Box Size
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <label className="block cursor-pointer">
                  <Button variant="outline" className="w-full rounded-xl pointer-events-none" type="button">
                    <Upload className="w-4 h-4 mr-2" /> Add Another Receipt
                  </Button>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} disabled={uploading || processing} />
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 1: Select Box Size ── */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">Select Your Shipment Box</h2>
            <p className="text-sm text-white/60 mt-1">Both options include the same premium service. Simply choose the box size that best suits your purchases.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <BoxCard size="10kg" selected={boxSize === '10kg'} onSelect={setBoxSize} />
            <BoxCard size="20kg" selected={boxSize === '20kg'} onSelect={setBoxSize} />
          </div>
          <Button
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl h-12"
            onClick={handleProceedToDeclaration}
            disabled={!boxSize}
          >
            Continue to Customs Declaration
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* ── STEP 2: Customs Declaration ── */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-bold text-white">Customs Declaration</h2>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 mb-4">
              <p className="text-sm font-medium text-white">Please review your customs declaration before confirming and proceeding to payment.</p>
            </div>
            <p className="text-sm text-white/60">Your customs declaration has been automatically prepared for your review.</p>
          </div>

          <ShipmentDeclarationForm order={{ ...order, box_size: boxSize }} items={savedItems} />

          <Button
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl h-12"
            disabled={savingBox}
            onClick={handleProceedToPayment}
          >
            {savingBox ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Package className="w-4 h-4 mr-2" />}
            Confirm Declaration & Proceed to Payment
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}