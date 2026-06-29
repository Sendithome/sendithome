import { useState, useEffect } from 'react';
import { getShippingPrice } from '../utils/pricing';
import { convertToLocalCurrency, initCurrencyRates } from '../utils/currencyConversion';
import SignaturePad from './SignaturePad';
import { base44 } from '@/api/base44Client';
import { Download, Loader2, ChevronDown } from 'lucide-react';

// AED → USD fixed rate fallback (1 AED = 0.2723 USD)
const AED_TO_USD = 0.2723;

function toUSD(price, currency) {
  if (!price) return 0;
  if (currency === 'USD') return price;
  if (currency === 'AED') return price * AED_TO_USD;
  return price; // fallback
}

function CollapsibleSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-l border-r border-b border-gray-400">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-gray-100 border-b border-gray-400 px-2 py-1 flex items-center justify-between"
      >
        <p className="text-[9px] font-bold uppercase tracking-wider">{title}</p>
        <ChevronDown className={`w-3 h-3 text-gray-600 transition-transform ${open ? '' : 'rotate-180'}`} />
      </button>
      {open && children}
    </div>
  );
}

export default function ShipmentDeclarationForm({ order, items, onProceed, onSignatureChange }) {
  const [signature, setSignature] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // Pre-load live rates so convertToLocalCurrency works
  useEffect(() => { initCurrencyRates(); }, []);

  const handleSig = (dataUrl) => {
    setSignature(dataUrl);
    if (onSignatureChange) onSignatureChange(dataUrl);
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    const response = await base44.functions.invoke(
      'generateDeclarationPDF',
      { order, items, signature },
      { responseType: 'arraybuffer' }
    );
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customs-declaration-${order?.order_number || 'SIH'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloading(false);
  };
  const shippingDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const totalDeclaredValue = items.filter(i => i.eligible !== false).reduce((s, i) => s + ((i.price || 0) * (i.quantity || 1)), 0);
  const currency = items[0]?.currency || 'USD';
  const shippingCost = getShippingPrice(order?.destination_country);

  return (
    <div className="bg-white border-2 border-gray-800 rounded-none font-mono text-xs" style={{ fontFamily: 'monospace' }}>

      {/* Form Header */}
      <div className="bg-gray-800 text-white text-center py-2 px-4">
        <p className="text-sm font-bold tracking-widest">INTERNATIONAL SHIPMENT DECLARATION</p>
        <p className="text-[10px] tracking-wide opacity-80">Customs & Courier Declaration Form · CN22/CN23</p>
      </div>

      <div className="p-4 space-y-0">

        {/* Reference Row */}
        <div className="grid grid-cols-2 border border-gray-400">
          <div className="border-r border-gray-400 p-2">
            <p className="text-[9px] font-bold text-gray-500 uppercase">Shipment Reference No.</p>
            <p className="font-bold text-sm mt-0.5">{order?.order_number || '—'}</p>
          </div>
          <div className="p-2">
            <p className="text-[9px] font-bold text-gray-500 uppercase">Date of Shipment</p>
            <p className="font-bold text-sm mt-0.5">{shippingDate}</p>
          </div>
        </div>

        {/* Section A — Sender / Shipper */}
        <CollapsibleSection title="Section A — Sender / Shipper Details" defaultOpen={true}>
          <div className="grid grid-cols-2">
            <div className="border-r border-gray-400 p-2 space-y-1.5">
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Full Name</p>
                <p className="font-bold">{order?.recipient_name || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Passport / ID No.</p>
                <p className="font-bold">{order?.passport_number || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Passport Expiry</p>
                <p className="font-bold">{order?.passport_expiry || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Nationality</p>
                <p className="font-bold">{order?.nationality || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Email Address</p>
                <p className="font-bold">{order?.sender_email || order?.email || '—'}</p>
              </div>
            </div>
            <div className="p-2 space-y-1.5">
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Primary Contact No.</p>
                <p className="font-bold">{order?.sender_phone || order?.phone_number || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Alternate Contact No.</p>
                <p className="font-bold">{order?.sender_alternate_phone || order?.whatsapp_number || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Hotel / Collection Point</p>
                <p className="font-bold">{order?.hotel_name || '—'}{order?.hotel_room ? ` · Room ${order.hotel_room}` : ''}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">City / Country of Origin</p>
                <p className="font-bold">{[order?.hotel_city, order?.hotel_country].filter(Boolean).join(', ') || 'United Arab Emirates'}</p>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section B — Consignee / Recipient */}
        <CollapsibleSection title="Section B — Consignee / Receiver Details" defaultOpen={true}>
          <div className="grid grid-cols-2">
            <div className="border-r border-gray-400 p-2 space-y-1.5">
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Full Name</p>
                <p className="font-bold">{order?.recipient_name || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Passport No. (if applicable)</p>
                <p className="font-bold">{order?.recipient_passport_number || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Nationality</p>
                <p className="font-bold">{order?.recipient_nationality || order?.nationality || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Email Address</p>
                <p className="font-bold">{order?.recipient_email || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Primary Contact No.</p>
                <p className="font-bold">{order?.recipient_phone || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Alternate Contact No.</p>
                <p className="font-bold">{order?.recipient_alternate_phone || '—'}</p>
              </div>
            </div>
            <div className="p-2 space-y-1.5">
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Full Delivery Address</p>
                <p className="font-bold">{order?.destination_address || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">City</p>
                <p className="font-bold">{order?.destination_city || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Country of Destination</p>
                <p className="font-bold">{order?.destination_country || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Postal / ZIP Code</p>
                <p className="font-bold">{order?.destination_postal_code || '—'}</p>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section C — Nature of Contents */}
        <CollapsibleSection title="Section C — Nature of Contents" defaultOpen={false}>
          <div className="p-2 flex gap-6">
            {[
              { label: 'Gift', checked: false },
              { label: 'Commercial Sample', checked: false },
              { label: 'Documents', checked: false },
              { label: 'Personal Effects / Shopping', checked: true },
              { label: 'Other', checked: false },
            ].map(({ label, checked }) => (
              <label key={label} className="flex items-center gap-1.5 cursor-default">
                <div className={`w-3.5 h-3.5 border-2 border-gray-700 flex items-center justify-center ${checked ? 'bg-gray-800' : 'bg-white'}`}>
                  {checked && <span className="text-white text-[8px] font-bold">✓</span>}
                </div>
                <span className="text-[9px] font-medium">{label}</span>
              </label>
            ))}
          </div>
        </CollapsibleSection>

        {/* Section D — Description of Contents */}
        <CollapsibleSection title="Section D — Description of Contents (Customs Declaration)" defaultOpen={true}>
          {/* Table header */}
          <div className="grid border-b border-gray-400 bg-gray-50" style={{ gridTemplateColumns: '1fr 65px 65px 40px 100px 100px' }}>
            {['Description of Goods', 'Category', 'HS Code', 'Qty', 'Unit Value', 'Total Value'].map(h => (
              <div key={h} className="px-2 py-1 border-r last:border-r-0 border-gray-300">
                <p className="text-[8px] font-bold uppercase text-gray-500">{h}</p>
              </div>
            ))}
          </div>
          {/* Items */}
          {items.filter(i => i.eligible !== false).map((item, idx) => {
            const unitUSD = toUSD(item.price || 0, currency);
            const totalUSD = unitUSD * (item.quantity || 1);
            const showLocal = currency !== 'USD';
            return (
              <div key={item.id || idx} className={`grid border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`} style={{ gridTemplateColumns: '1fr 65px 65px 40px 100px 100px' }}>
                <div className="px-2 py-1.5 border-r border-gray-300">
                  <p className="font-medium text-[10px]">{item.item_name}</p>
                </div>
                <div className="px-2 py-1.5 border-r border-gray-300">
                  <p className="text-[9px] text-gray-600">{item.category || '—'}</p>
                </div>
                <div className="px-2 py-1.5 border-r border-gray-300">
                  {item.hs_code ? (
                    <div className="flex items-center gap-0.5">
                      <p className="font-mono text-[9px] text-blue-800 font-bold">{item.hs_code}</p>
                      {item.hs_code_flagged && <span className="text-[8px] text-amber-600">⚠</span>}
                    </div>
                  ) : (
                    <p className="text-[9px] text-gray-400 italic">Pending</p>
                  )}
                </div>
                <div className="px-2 py-1.5 border-r border-gray-300 text-center">
                  <p className="font-bold text-[10px]">{item.quantity || 1}</p>
                </div>
                <div className="px-2 py-1.5 border-r border-gray-300 text-right">
                  {showLocal && <p className="text-[9px] text-gray-500">{currency} {(item.price || 0).toFixed(2)}</p>}
                  <p className="font-bold text-[10px] text-green-800">$ {unitUSD.toFixed(2)}</p>
                </div>
                <div className="px-2 py-1.5 text-right">
                  {showLocal && <p className="text-[9px] text-gray-500">{currency} {((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>}
                  <p className="font-bold text-[10px] text-green-800">$ {totalUSD.toFixed(2)}</p>
                </div>
              </div>
            );
          })}
          {/* Totals */}
          {(() => {
            const totalUSD = items.filter(i => i.eligible !== false).reduce((s, i) => s + toUSD(i.price || 0, currency) * (i.quantity || 1), 0);
            const showLocal = currency !== 'USD';
            return (
              <div className="grid bg-gray-100 border-t border-gray-400" style={{ gridTemplateColumns: '1fr 65px 65px 40px 100px 100px' }}>
                <div className="px-2 py-2 border-r border-gray-400 col-span-4">
                  <p className="text-[9px] font-bold uppercase">Total Items: {items.filter(i => i.eligible !== false).length}</p>
                </div>
                <div className="px-2 py-2 border-r border-gray-400 text-right">
                  <p className="text-[9px] font-bold uppercase text-gray-500">Total Declared</p>
                </div>
                <div className="px-2 py-2 text-right">
                  {showLocal && <p className="text-[9px] text-gray-500">{currency} {totalDeclaredValue.toFixed(2)}</p>}
                  <p className="text-[11px] font-black text-green-800">$ {totalUSD.toFixed(2)}</p>
                </div>
              </div>
            );
          })()}
          {/* HS Code flag note */}
          {items.some(i => i.eligible !== false && i.hs_code_flagged) && (
            <div className="px-3 py-2 bg-amber-50 border-t border-amber-200">
              <p className="text-[9px] text-amber-700">⚠ Some items may require additional customs review before your shipment is cleared. If so, our courier partner will call you on the phone number you provided.</p>
            </div>
          )}
        </CollapsibleSection>

        {/* Section E — Shipping & Service Details */}
        <CollapsibleSection title="Section E — Shipping & Service Details" defaultOpen={false}>
          <div className="grid grid-cols-4 divide-x divide-gray-300 p-0">
            <div className="p-2">
              <p className="text-[9px] text-gray-500 uppercase">Country of Purchase</p>
              <p className="font-bold text-[10px] mt-0.5">United Arab Emirates</p>
            </div>
            <div className="p-2">
              <p className="text-[9px] text-gray-500 uppercase">Service Provider</p>
              <p className="font-bold text-[10px] mt-0.5">Send It Home · FedEx / DHL</p>
            </div>
            <div className="p-2">
              <p className="text-[9px] text-gray-500 uppercase">Transit &amp; Activation</p>
              <p className="font-bold text-[10px] mt-0.5">$30 online + $20 hotel</p>
            </div>
            <div className="p-2">
              <p className="text-[9px] text-gray-500 uppercase">Est. Transit Time</p>
              <p className="font-bold text-[10px] mt-0.5">1–3 Working Days</p>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section F — Sender's Declaration */}
        <CollapsibleSection title="Section F — Sender's Declaration" defaultOpen={true}>
          <div className="p-3">
            <p className="text-[9px] text-gray-600 leading-relaxed">
              I/We hereby certify that the particulars given in this declaration are correct and that this consignment does not contain
              any dangerous or prohibited article(s). The goods are of <strong>{order?.destination_country || ''}</strong> bound origin for personal use only.
              I accept liability for any Customs duty or taxes applicable in the country of destination.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Declarant Name</p>
                <div className="border-b border-gray-600 mt-3 pb-0.5">
                  <p className="text-[10px] font-bold">{order?.recipient_name || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Date</p>
                <div className="border-b border-gray-600 mt-3 pb-0.5">
                  <p className="text-[10px] font-bold">{shippingDate}</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[9px] text-gray-500 uppercase mb-1">E-Signature *</p>
              <SignaturePad onChange={handleSig} />
              {signature && (
                <p className="text-[9px] text-green-600 mt-1">✓ Signature captured</p>
              )}
            </div>
          </div>
        </CollapsibleSection>

        {/* SIH Customer Support */}
        <CollapsibleSection title="Send It Home — Customer Support" defaultOpen={false}>
          <div className="p-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
            <div>
              <p className="text-[9px] text-gray-500 uppercase">Customer Support Email</p>
              <p className="font-bold text-[10px]">customer@sendithome.com</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-500 uppercase">Customer Support Phone</p>
              <p className="font-bold text-[10px] text-gray-400 italic">Coming soon</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-500 uppercase">WhatsApp Support</p>
              <p className="font-bold text-[10px] text-gray-400 italic">Coming soon</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-500 uppercase">Website</p>
              <p className="font-bold text-[10px] text-gray-400 italic">Coming soon</p>
            </div>
            <div className="col-span-2">
              <p className="text-[9px] text-gray-500 uppercase">Emergency Shipment Assistance</p>
              <p className="font-bold text-[10px] text-gray-400 italic">Coming soon</p>
            </div>
          </div>
        </CollapsibleSection>

        {/* Footer */}
        <div className="border-l border-r border-b border-gray-400 bg-gray-800 text-white p-3 text-center space-y-0.5">
          <p className="text-[10px] font-bold tracking-wide">Vacation Logistics DMCC, Dubai — Operating as Send It Home</p>
          <p className="text-[9px] opacity-70 tracking-wide">Licensed International Courier · Powered by FedEx & DHL · 50+ Countries</p>
        </div>
      </div>

      {/* Download PDF Button */}
      <button
        onClick={handleDownloadPDF}
        disabled={downloading}
        className="mt-3 w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
      >
        {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {downloading ? 'Generating PDF…' : 'Download CN22/CN23 Declaration PDF'}
      </button>
    </div>
  );
}