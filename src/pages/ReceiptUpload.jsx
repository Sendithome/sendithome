import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, FileText, Check, X, Loader2, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function ReceiptUpload() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const pathParts = window.location.pathname.split('/');
  const orderId = pathParts[2]; // /order/:id/receipts

  const [order, setOrder] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [items, setItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

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
    setReceipts(existingReceipts);
    setItems(existingItems);
  };

  const handleFileUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const receipt = await base44.entities.Receipt.create({
        order_id: orderId,
        file_url,
        processing_status: 'processing',
      });

      setReceipts(prev => [...prev, receipt]);

      // Use AI to extract items
      setProcessing(true);
      const extractResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this shopping receipt image. Extract all purchased items with their names, categories, quantities, and prices. 
        Also check if each item is eligible for international shipping (not eligible: perishable food, hazardous materials, live plants, weapons, alcohol over 5L, tobacco over 200 cigarettes, prescription medicine, counterfeit goods).
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

      // Update receipt with extracted data
      await base44.entities.Receipt.update(receipt.id, {
        store_name: extractResult.store_name,
        total_amount: extractResult.total_amount,
        currency: extractResult.currency,
        purchase_date: extractResult.purchase_date,
        processing_status: 'completed',
        extracted_items_count: extractResult.items?.length || 0,
      });

      // Create order items
      if (extractResult.items?.length) {
        const itemsToCreate = extractResult.items.map(item => ({
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
        await base44.entities.OrderItem.bulkCreate(itemsToCreate);
        setItems(prev => [...prev, ...itemsToCreate]);
      }

      setProcessing(false);
    }

    // Update order status
    await base44.entities.Order.update(orderId, {
      status: 'receipt_uploaded',
      items_count: items.length,
    });

    setUploading(false);
    loadData();
  }, [orderId, items.length]);

  const eligibleItems = items.filter(i => i.eligible !== false);
  const ineligibleItems = items.filter(i => i.eligible === false);

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

      {/* Upload area */}
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
          multiple
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading || processing}
        />
      </label>

      {/* Receipts uploaded */}
      {receipts.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Uploaded Receipts</h3>
          <div className="space-y-2">
            {receipts.map((r, i) => (
              <div key={r.id || i} className="flex items-center gap-3 bg-card rounded-xl border border-border p-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.store_name || 'Receipt'}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.extracted_items_count || 0} items extracted
                  </p>
                </div>
                <Check className="w-4 h-4 text-green-600" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      {items.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Extracted Items ({eligibleItems.length} eligible)
          </h3>
          <div className="space-y-2">
            {eligibleItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-card rounded-xl border border-border p-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.item_name}</p>
                  <p className="text-xs text-muted-foreground">{item.category} · Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-medium">{item.currency} {item.price}</span>
              </div>
            ))}
          </div>

          {ineligibleItems.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-destructive mb-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Ineligible Items ({ineligibleItems.length})
              </h4>
              <div className="space-y-2">
                {ineligibleItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-destructive/5 rounded-xl border border-destructive/20 p-3">
                    <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <X className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.item_name}</p>
                      <p className="text-xs text-destructive">{item.ineligible_reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Continue */}
      {receipts.length > 0 && (
        <div className="mt-8 space-y-3">
          <Button
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl h-12"
            onClick={() => navigate(`/order/${orderId}/payment`)}
          >
            Continue to Payment
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => document.querySelector('input[type="file"]').click()}
          >
            Upload More Receipts
          </Button>
        </div>
      )}
    </div>
  );
}