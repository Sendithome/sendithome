import { useState } from 'react';
import { getShippingPrice } from '../utils/pricing';
import { convertToLocalCurrency } from '../utils/currencyConversion';
import SignaturePad from './SignaturePad';

export default function ShipmentDeclarationForm({ order, items, onProceed, onSignatureChange }) {
  const [signature, setSignature] = useState(null);

  const handleSig = (dataUrl) => {
    setSignature(dataUrl);
    if (onSignatureChange) onSignatureChange(dataUrl);
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

        {/* Shipper / Sender */}
        <div className="border-l border-r border-b border-gray-400">
          <div className="bg-gray-100 border-b border-gray-400 px-2 py-1">
            <p className="text-[9px] font-bold uppercase tracking-wider">Section A — Sender / Shipper</p>
          </div>
          <div className="grid grid-cols-2">
            <div className="border-r border-gray-400 p-2 space-y-1.5">
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Full Name</p>
                <p className="font-bold">{order?.recipient_name || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Hotel / Collection Point</p>
                <p className="font-bold">{order?.hotel_name || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Room No.</p>
                <p className="font-bold">{order?.hotel_room || '—'}</p>
              </div>
            </div>
            <div className="p-2 space-y-1.5">
              <div>
                <p className="text-[9px] text-gray-500 uppercase">City / Country of Origin</p>
                <p className="font-bold">{[order?.hotel_city, order?.hotel_country].filter(Boolean).join(', ') || 'United Arab Emirates'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Passport / ID No.</p>
                <p className="font-bold">{order?.passport_number || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Nationality</p>
                <p className="font-bold">{order?.nationality || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Consignee / Recipient */}
        <div className="border-l border-r border-b border-gray-400">
          <div className="bg-gray-100 border-b border-gray-400 px-2 py-1">
            <p className="text-[9px] font-bold uppercase tracking-wider">Section B — Consignee / Recipient (Home Address)</p>
          </div>
          <div className="grid grid-cols-2">
            <div className="border-r border-gray-400 p-2 space-y-1.5">
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Full Name</p>
                <p className="font-bold">{order?.recipient_name || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Street Address</p>
                <p className="font-bold">{order?.destination_address || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">City</p>
                <p className="font-bold">{order?.destination_city || '—'}</p>
              </div>
            </div>
            <div className="p-2 space-y-1.5">
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Postal / ZIP Code</p>
                <p className="font-bold">{order?.destination_postal_code || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Country of Destination</p>
                <p className="font-bold">{order?.destination_country || '—'}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase">Phone / Contact</p>
                <p className="font-bold">{order?.recipient_phone || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipment Type */}
        <div className="border-l border-r border-b border-gray-400">
          <div className="bg-gray-100 border-b border-gray-400 px-2 py-1">
            <p className="text-[9px] font-bold uppercase tracking-wider">Section C — Nature of Contents</p>
          </div>
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
        </div>

        {/* Item List */}
        <div className="border-l border-r border-b border-gray-400">
          <div className="bg-gray-100 border-b border-gray-400 px-2 py-1">
            <p className="text-[9px] font-bold uppercase tracking-wider">Section D — Description of Contents (Customs Declaration)</p>
          </div>
          {/* Table header */}
          <div className="grid border-b border-gray-400 bg-gray-50" style={{ gridTemplateColumns: '1fr 80px 60px 80px 80px' }}>
            {['Description of Goods', 'Category', 'Qty', 'Unit Value', 'Total'].map(h => (
              <div key={h} className="px-2 py-1 border-r last:border-r-0 border-gray-300">
                <p className="text-[8px] font-bold uppercase text-gray-500">{h}</p>
              </div>
            ))}
          </div>
          {/* Items */}
          {items.filter(i => i.eligible !== false).map((item, idx) => (
            <div key={item.id || idx} className={`grid border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`} style={{ gridTemplateColumns: '1fr 80px 60px 80px 80px' }}>
              <div className="px-2 py-1.5 border-r border-gray-300">
                <p className="font-medium text-[10px]">{item.item_name}</p>
              </div>
              <div className="px-2 py-1.5 border-r border-gray-300">
                <p className="text-[9px] text-gray-600">{item.category || '—'}</p>
              </div>
              <div className="px-2 py-1.5 border-r border-gray-300 text-center">
                <p className="font-bold text-[10px]">{item.quantity || 1}</p>
              </div>
              <div className="px-2 py-1.5 border-r border-gray-300 text-right">
                <p className="text-[10px]">{currency} {(item.price || 0).toFixed(2)}</p>
              </div>
              <div className="px-2 py-1.5 text-right">
                <p className="font-bold text-[10px]">{currency} {((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
              </div>
            </div>
          ))}
          {/* Totals */}
          <div className="grid bg-gray-100 border-t border-gray-400" style={{ gridTemplateColumns: '1fr 80px 60px 80px 80px' }}>
            <div className="px-2 py-2 border-r border-gray-400 col-span-3">
              <p className="text-[9px] font-bold uppercase">Total Items: {items.filter(i => i.eligible !== false).length}</p>
            </div>
            <div className="px-2 py-2 border-r border-gray-400 text-right">
              <p className="text-[9px] font-bold uppercase">Total Value</p>
            </div>
            <div className="px-2 py-2 text-right">
              <p className="text-[10px] font-bold">{currency} {totalDeclaredValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="border-l border-r border-b border-gray-400">
          <div className="bg-gray-100 border-b border-gray-400 px-2 py-1">
            <p className="text-[9px] font-bold uppercase tracking-wider">Section E — Shipping & Service Details</p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-gray-300 p-0">
            <div className="p-2">
              <p className="text-[9px] text-gray-500 uppercase">Service Provider</p>
              <p className="font-bold text-[10px] mt-0.5">Send It Home · FedEx / DHL</p>
            </div>
            <div className="p-2">
              <p className="text-[9px] text-gray-500 uppercase">Shipping Fee</p>
              <p className="font-bold text-[10px] mt-0.5">${shippingCost}.00 USD per box</p>
              {convertToLocalCurrency(shippingCost, order?.destination_country) && (
                <p className="text-[9px] text-gray-500 mt-0.5">≈ {convertToLocalCurrency(shippingCost, order?.destination_country)}</p>
              )}
            </div>
            <div className="p-2">
              <p className="text-[9px] text-gray-500 uppercase">Est. Transit Time</p>
              <p className="font-bold text-[10px] mt-0.5">1–3 Working Days</p>
            </div>
          </div>
        </div>

        {/* Declaration */}
        <div className="border-l border-r border-b border-gray-400">
          <div className="bg-gray-100 border-b border-gray-400 px-2 py-1">
            <p className="text-[9px] font-bold uppercase tracking-wider">Section F — Sender's Declaration</p>
          </div>
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
        </div>

        {/* Footer */}
        <div className="border-l border-r border-b border-gray-400 bg-gray-800 text-white p-3 text-center space-y-0.5">
          <p className="text-[10px] font-bold tracking-wide">Vacation Logistics DMCC, Dubai — Operating as Send It Home</p>
          <p className="text-[9px] opacity-70 tracking-wide">Licensed International Courier · Powered by FedEx & DHL · 50+ Countries</p>
        </div>
      </div>
    </div>
  );
}