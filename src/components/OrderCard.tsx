import type { Order, OrderStatus } from '@/lib/api';
import { cn } from '@/lib/utils';

interface OrderCardProps {
  order: Order;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  isLoading?: boolean;
}

// Helper function to safely format numbers
const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
  accepted: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
  rejected: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
  preparing: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700',
  ready: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
  completed: 'bg-gray-100 dark:bg-[#374151] text-gray-800 dark:text-gray-200 border-gray-300 dark:border-[#4B5563]',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-gray-100 dark:bg-[#374151] text-gray-800 dark:text-gray-200',
  pending_cash: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200',
  pending_pos: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200',
  pending_transfer: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200',
  paid: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200',
};

export function OrderCard({
  order,
  onAccept,
  onReject,
  onUpdateStatus,
  isLoading = false,
}: OrderCardProps) {
  const canAccept = order.status === 'pending';
  const canReject = order.status === 'pending' || order.status === 'accepted';
  const canUpdateStatus = ['accepted', 'preparing', 'ready'].includes(order.status);

  const getNextStatus = (): OrderStatus | null => {
    switch (order.status) {
      case 'accepted':
        return 'preparing';
      case 'preparing':
        return 'ready';
      case 'ready':
        return 'completed';
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-[#1F2937] rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-200 dark:border-[#374151]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {order.orderNumber}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Table {order.table.tableNumber} - {order.table.location}
          </p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border',
              statusColors[order.status]
            )}
          >
            {order.status.toUpperCase()}
          </span>
          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium',
              paymentStatusColors[order.paymentStatus]
            )}
          >
            {order.paymentStatus.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-2xl font-bold text-[#F97415] dark:text-[#FF8C42]">
          ${formatCurrency(order.totalAmount)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Payment: {order.paymentMethod}</p>
      </div>

      {order.specialInstructions && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded">
          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">Special Instructions:</p>
          <p className="text-sm text-yellow-800 dark:text-yellow-300">{order.specialInstructions}</p>
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Items:</p>
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm text-gray-900 dark:text-gray-200">
              <span>
                {item.quantity}x {item.menuItem.name}
                {item.specialInstructions && (
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    ({item.specialInstructions})
                  </span>
                )}
              </span>
              <span className="font-medium">${formatCurrency(item.subtotal)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {canAccept && (
          <button
            onClick={() => onAccept(order.id)}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
          >
            Accept
          </button>
        )}
        {canReject && (
          <button
            onClick={() => onReject(order.id)}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
          >
            Reject
          </button>
        )}
        {canUpdateStatus && (
          <button
            onClick={() => {
              const nextStatus = getNextStatus();
              if (nextStatus) onUpdateStatus(order.id, nextStatus);
            }}
            disabled={isLoading}
            className="px-4 py-2 bg-[#F97415] text-white rounded-md hover:bg-[#E8650F] disabled:opacity-50 text-sm font-medium"
          >
            Mark as {getNextStatus()?.toUpperCase()}
          </button>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Created: {new Date(order.createdAt).toLocaleString()}
      </div>
    </div>
  );
}

