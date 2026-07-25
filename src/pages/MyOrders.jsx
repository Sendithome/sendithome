import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import OrderCard from '../components/OrderCard';
import { motion } from 'framer-motion';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const data = await base44.entities.Order.list('-created_date', 50);
    setOrders(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">My Shipments</h1>
          <p className="text-xs text-white/60 mt-0.5">{orders.length} shipment{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-medium" size="sm">
          <Link to="/new-order">
            <Plus className="w-4 h-4 mr-1" />
            New Shipment
          </Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-white/60" />
          </div>
          <h3 className="font-semibold text-white">No shipments yet</h3>
          <p className="text-sm text-white/60 mt-1 max-w-xs mx-auto">
            Start your first shipment and send your shopping home with ease.
          </p>
          <Button asChild className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-semibold">
            <Link to="/new-order">Create First Shipment</Link>
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <OrderCard order={order} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}