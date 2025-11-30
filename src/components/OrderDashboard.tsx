import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { Order, OrderStatus } from '@/lib/api';
import { OrderCard } from './OrderCard';
import { cn } from '@/lib/utils';

export function OrderDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await api.getAllOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll for new orders every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await api.acceptOrder(orderId);
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to accept order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (orderId: string) => {
    if (!confirm('Are you sure you want to reject this order?')) return;
    setActionLoading(orderId);
    try {
      await api.rejectOrder(orderId);
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to reject order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    setActionLoading(orderId);
    try {
      await api.updateOrderStatus(orderId, status);
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    accepted: orders.filter(o => o.status === 'accepted').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  return (
    <div className="p-6 dark:bg-[#0F172A] min-h-screen">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Management</h1>
          <button
            onClick={fetchOrders}
            disabled={isLoading}
            className="px-4 py-2 bg-[#F97415] text-white rounded-md hover:bg-[#E8650F] disabled:opacity-50 font-medium"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'accepted', 'preparing', 'ready', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'px-4 py-2 rounded-md font-medium text-sm transition-colors',
                filter === status
                  ? 'bg-[#F97415] text-white'
                  : 'bg-gray-200 dark:bg-[#374151] text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#4B5563]'
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading && orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300">No orders found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAccept={handleAccept}
              onReject={handleReject}
              onUpdateStatus={handleUpdateStatus}
              isLoading={actionLoading === order.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

