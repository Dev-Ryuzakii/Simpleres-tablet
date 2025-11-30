import { useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface PaymentConfirmationProps {
  paymentId: string;
  paymentMethod: 'cash' | 'pos' | 'transfer';
  amount: number;
  orderNumber: string;
  onConfirmed?: () => void;
}

export function PaymentConfirmation({
  paymentId,
  paymentMethod,
  amount,
  orderNumber,
  onConfirmed,
}: PaymentConfirmationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setIsLoading(true);
    setError('');

    try {
      switch (paymentMethod) {
        case 'cash':
          await api.confirmCashPayment(paymentId);
          break;
        case 'pos':
          await api.confirmPosPayment(paymentId);
          break;
        case 'transfer':
          await api.confirmTransferPayment(paymentId);
          break;
      }
      onConfirmed?.();
    } catch (err: any) {
      setError(err.message || 'Failed to confirm payment');
    } finally {
      setIsLoading(false);
    }
  };

  const methodLabels = {
    cash: 'Cash Payment',
    pos: 'POS/Card Payment',
    transfer: 'Bank Transfer Payment',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Confirm {methodLabels[paymentMethod]}
      </h3>
      <div className="mb-4">
        <p className="text-sm text-gray-600">Order: {orderNumber}</p>
        <p className="text-2xl font-bold text-[#F97415] mt-2">
          ${amount.toFixed(2)}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={isLoading}
        className={cn(
          'w-full py-2 px-4 rounded-md font-medium text-white transition-colors',
          'bg-[#F97415] hover:bg-[#E8650F] focus:outline-none focus:ring-2 focus:ring-[#F97415] focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isLoading ? 'Confirming...' : `Confirm ${methodLabels[paymentMethod]}`}
      </button>
    </div>
  );
}

