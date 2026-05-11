import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, MapPin, Star, ArrowRight, Loader2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function QRLanding() {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showQR, setShowQR] = useState(true);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(window.location.href)}&margin=12&format=png`;

  useEffect(() => {
    loadHotel();
  }, [hotelId]);

  const loadHotel = async () => {
    try {
      const hotel = await base44.entities.Hotel.get(hotelId);
      setHotel(hotel);
    } catch {
      setNotFound(true);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <Package className="w-12 h-12 text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold text-foreground">Hotel not found</h1>
        <p className="text-sm text-muted-foreground mt-2">Please scan the QR code at your hotel reception.</p>
      </div>
    );
  }

  if (showQR) {
    return (
      <AnimatePresence>
        <motion.div
          key="qr-splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen flex flex-col items-center justify-center bg-primary px-6 text-center"
        >
          {/* Branding */}
          <div className="mb-8">
            {hotel?.logo_url ? (
              <img src={hotel.logo_url} alt={hotel.name} className="h-14 mx-auto mb-4 rounded-xl object-contain" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-accent" />
              </div>
            )}
            <p className="text-[11px] font-black tracking-[0.3em] text-white/50 uppercase mb-1">
              SEND<span className="text-accent">IT</span>HOME
            </p>
            <h1 className="text-xl font-bold text-white">{hotel?.name}</h1>
            {hotel && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-white/40" />
                <p className="text-xs text-white/50">{hotel.city}, {hotel.country}</p>
              </div>
            )}
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-3xl p-5 shadow-2xl mb-6">
            <img
              src={qrUrl}
              alt="Hotel QR Code"
              className="w-56 h-56 rounded-xl"
            />
            <p className="text-[9px] font-bold text-muted-foreground text-center mt-3 tracking-widest uppercase">
              Scan to Ship Your Shopping Home
            </p>
          </div>

          <p className="text-xs text-white/50 mb-8 max-w-xs leading-relaxed">
            Show this QR code to hotel concierge or scan to start your shipment registration.
          </p>

          <Button
            className="w-full max-w-xs h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-2xl text-sm"
            onClick={() => setShowQR(false)}
          >
            Continue to Register
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hotel hero */}
      <div className="relative bg-primary overflow-hidden">
        {hotel.cover_image_url && (
          <img src={hotel.cover_image_url} alt={hotel.name} className="absolute inset-0 w-full h-full object-cover opacity-20" />
        )}
        <div className="relative px-6 pt-12 pb-10 text-center">
          {hotel.logo_url ? (
            <img src={hotel.logo_url} alt={hotel.name} className="h-14 mx-auto mb-4 rounded-xl object-contain" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-accent" />
            </div>
          )}
          <div className="flex items-center justify-center gap-1 mb-1">
            {Array.from({ length: hotel.star_rating || 5 }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 text-accent fill-accent" />
            ))}
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">{hotel.name}</h1>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-white/50" />
            <p className="text-sm text-white/60">{hotel.city}, {hotel.country}</p>
          </div>
        </div>
      </div>

      {/* Welcome card */}
      <div className="flex-1 px-5 py-8 max-w-lg mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl border border-border p-6 shadow-sm mb-6"
        >
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
            <Package className="w-6 h-6 text-accent" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Ship Your Shopping Home</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Send your purchases directly from <span className="font-semibold text-foreground">{hotel.name}</span> to your home.
            Just <span className="font-semibold text-accent">$60 per box</span> — delivered in 1–3 working days via international priority.
          </p>

          <ul className="mt-5 space-y-2.5">
            {[
              { text: '10 kg or 20 kg — same flat rate', sub: "it's just amazing" },
              { text: '50+ countries covered', sub: null },
              { text: 'Hotel pickup within 24 hours', sub: 'Day Zero' },
              { text: 'Full tracking via WhatsApp', sub: null },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                </div>
                <span>
                  {item.text}
                  {item.sub && <span className="ml-1 text-accent font-medium italic">— {item.sub}</span>}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <Button
            className="w-full h-13 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-2xl text-base py-4"
            onClick={() => navigate(`/register?hotelId=${hotelId}`)}
          >
            Get Started — Register Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-2xl"
            onClick={() => navigate(`/login?hotelId=${hotelId}`)}
          >
            I already have an account
          </Button>
        </motion.div>

        <p className="text-center text-[10px] text-muted-foreground mt-6">
          Powered by FedEx & DHL · 50+ Countries · 1–3 Day Delivery
        </p>
      </div>
    </div>
  );
}