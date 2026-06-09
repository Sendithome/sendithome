import ShipmentDeclarationForm from '../components/ShipmentDeclarationForm';

const SAMPLE_ORDER = {
  order_number: 'SIH-2026-00847',
  recipient_name: 'Alexandra Müller',
  hotel_name: 'Grand Hyatt Dubai',
  hotel_room: '1204',
  hotel_city: 'Dubai',
  hotel_country: 'United Arab Emirates',
  destination_country: 'Germany',
  destination_address: 'Kurfürstendamm 12',
  destination_city: 'Berlin',
  destination_postal_code: '10719',
  recipient_phone: '+49 30 1234 5678',
  passport_number: 'C3X7K2198',
  nationality: 'German',
  box_size: '20kg',
};

const SAMPLE_ITEMS = [
  { id: '1', item_name: 'Leather Handbag', category: "Women's Fashion", quantity: 1, price: 1250.00, currency: 'AED', eligible: true, hs_code: '4202.21', hs_code_verified: true },
  { id: '2', item_name: 'Silk Scarf', category: 'Accessories', quantity: 2, price: 320.00, currency: 'AED', eligible: true, hs_code: '6214.10', hs_code_verified: true },
  { id: '3', item_name: 'Men\'s Dress Shirt', category: "Men's Fashion", quantity: 3, price: 185.00, currency: 'AED', eligible: true, hs_code: '6205.20', hs_code_verified: true },
  { id: '4', item_name: 'Kids Sneakers', category: 'Footwear', quantity: 1, price: 295.00, currency: 'AED', eligible: true, hs_code: '6404.11', hs_code_verified: false, hs_code_flagged: true },
  { id: '5', item_name: 'Camel Plush Toy', category: 'Souvenirs & Gifts', quantity: 2, price: 89.00, currency: 'AED', eligible: true, hs_code: '9503.00', hs_code_verified: true },
];

export default function DeclarationPreview() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-bold text-gray-800">Customs Declaration Form Preview</h1>
          <p className="text-sm text-gray-500 mt-1">Sample CN22/CN23 — as presented to the tourist for e-signature</p>
        </div>
        <ShipmentDeclarationForm order={SAMPLE_ORDER} items={SAMPLE_ITEMS} />
      </div>
    </div>
  );
}