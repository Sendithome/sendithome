import { useState } from 'react';
import { Download, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

async function downloadDeclarationPDF(v, setDownloading) {
  setDownloading(v.id);
  const order = {
    order_number: v.shipment_id,
    recipient_name: v.tourist_name,
    hotel_name: v.hotel_name,
    hotel_country: 'United Arab Emirates',
    nationality: v.tourist_passport_country,
    destination_country: v.destination_country,
    destination_address: '',
    destination_city: '',
    destination_postal_code: '',
    recipient_phone: '',
    passport_number: '',
  };
  const items = (v.items || []).map(i => ({
    item_name: i.description || i.item_name || 'Item',
    category: i.category || '',
    quantity: 1,
    price: i.price || 0,
    currency: 'USD',
    eligible: i.eligible !== false,
  }));
  const response = await base44.functions.invoke('generateDeclarationPDF', { order, items, signature: null });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `customs-declaration-${v.shipment_id}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
  setDownloading(null);
}

export default function ApprovedHistoryTab({ verifications }) {
  const [sortField, setSortField] = useState('approved_at');
  const [sortDir, setSortDir] = useState(-1);
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => -d);
    else { setSortField(field); setSortDir(-1); }
  };

  const filtered = verifications
    .filter(v => {
      if (filterFrom && v.approved_at && v.approved_at < filterFrom) return false;
      if (filterTo && v.approved_at && v.approved_at > filterTo + 'T23:59:59') return false;
      return true;
    })
    .sort((a, b) => {
      const va = a[sortField] || '';
      const vb = b[sortField] || '';
      return va < vb ? sortDir : va > vb ? -sortDir : 0;
    });

  const exportCSV = () => {
    const header = ['Shipment ID', 'Tourist Name', 'Date Approved', 'Items Count', 'Value ($)', 'Commission ($)', 'Destination'];
    const rows = filtered.map(v => [
      v.shipment_id, v.tourist_name,
      v.approved_at ? new Date(v.approved_at).toLocaleDateString() : '',
      v.items?.length || 0,
      v.total_value?.toFixed(2) || 0,
      v.commission_amount?.toFixed(2) || 0,
      v.destination_country
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'approved-history.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }) => (
    <span className={`ml-1 text-[10px] ${sortField === field ? 'text-green-400' : 'text-slate-600'}`}>
      {sortField === field ? (sortDir === -1 ? '▼' : '▲') : '⇅'}
    </span>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">From</label>
          <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}
            className="h-8 bg-[#0B1120] border border-slate-700 rounded-lg px-2 text-xs text-white focus:outline-none focus:border-green-500" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">To</label>
          <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)}
            className="h-8 bg-[#0B1120] border border-slate-700 rounded-lg px-2 text-xs text-white focus:outline-none focus:border-green-500" />
        </div>
        <button onClick={exportCSV} className="ml-auto flex items-center gap-1.5 text-xs text-green-400 border border-green-500/40 rounded-lg px-3 h-8 hover:bg-green-500/10 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-slate-500 text-sm py-10">No approved verifications found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-500">
                {[['shipment_id','Shipment ID'], ['tourist_name','Tourist Name'], ['approved_at','Date Approved'],
                  ['items','Items'], ['total_value','Value'], ['commission_amount','Commission'], ['destination_country','Destination']
                ].map(([f, l]) => (
                  <th key={f} onClick={() => toggleSort(f)} className="text-left py-2 pr-3 cursor-pointer hover:text-slate-300 whitespace-nowrap">
                    {l}<SortIcon field={f} />
                  </th>
                ))}
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <>
                  <tr key={v.id} className="border-b border-slate-800 text-slate-300 hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 pr-3 font-mono text-green-400">{v.shipment_id}</td>
                    <td className="py-2.5 pr-3 font-medium text-white">{v.tourist_name}</td>
                    <td className="py-2.5 pr-3">{v.approved_at ? new Date(v.approved_at).toLocaleDateString() : '—'}</td>
                    <td className="py-2.5 pr-3 text-center">{v.items?.length || 0}</td>
                    <td className="py-2.5 pr-3">${v.total_value?.toFixed(2)}</td>
                    <td className="py-2.5 pr-3 text-[#D4A855] font-semibold">${v.commission_amount?.toFixed(2)}</td>
                    <td className="py-2.5 pr-3">{v.destination_country}</td>
                    <td className="py-2.5">
                     <div className="flex items-center gap-2">
                       <button
                         onClick={() => downloadDeclarationPDF(v, setDownloadingId)}
                         disabled={downloadingId === v.id}
                         title="Download Customs Declaration PDF"
                         className="text-green-500 hover:text-green-400 disabled:opacity-40 transition-colors"
                       >
                         {downloadingId === v.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                       </button>
                       <button onClick={() => setExpandedId(expandedId === v.id ? null : v.id)} className="text-slate-500 hover:text-slate-300">
                         {expandedId === v.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                       </button>
                     </div>
                    </td>
                  </tr>
                  {expandedId === v.id && (
                    <tr key={v.id + '-detail'} className="bg-slate-800/20">
                      <td colSpan={8} className="px-4 py-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div><p className="text-slate-500">Hotel</p><p className="text-white">{v.hotel_name || '—'}</p></div>
                          <div><p className="text-slate-500">Passport Country</p><p className="text-white">{v.tourist_passport_country || '—'}</p></div>
                          <div><p className="text-slate-500">Customs Ref</p><p className="text-white font-mono">{v.customs_ref || '—'}</p></div>
                          <div><p className="text-slate-500">Shipment Date</p><p className="text-white">{v.shipment_date ? new Date(v.shipment_date).toLocaleDateString() : '—'}</p></div>
                        </div>
                        {v.items?.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {v.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-xs text-slate-400">
                                <span>{item.description} ({item.category})</span>
                                <span>${item.price?.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}