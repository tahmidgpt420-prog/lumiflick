'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  ShoppingBag,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Printer,
  ChevronRight,
  Eye,
  X,
} from 'lucide-react';
import { OrderDetails } from '@/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, status } : o))
        );
        if (selectedOrder && selectedOrder.orderId === orderId) {
          setSelectedOrder({ ...selectedOrder, status } as any);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Customer Orders Management"
        description="Track incoming orders, inspect customer shipping details, and update courier dispatch statuses"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              All Orders ({orders.length})
            </h2>
            <button
              onClick={fetchOrders}
              className="text-xs text-gray-500 hover:text-black font-semibold"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-gray-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-500">
              No customer orders received yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Delivery Details</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => {
                    const status = (order as any).status || 'Pending';

                    return (
                      <tr key={order.orderId} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4 font-bold text-gray-900">
                          #{order.orderId}
                          <span className="block text-[10px] text-gray-400 font-normal">
                            {order.orderDate}
                          </span>
                        </td>

                        <td className="p-4">
                          <p className="font-bold text-gray-900">{order.customerName}</p>
                          <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-gray-400" /> {order.phone}
                          </p>
                        </td>

                        <td className="p-4 max-w-xs">
                          <p className="line-clamp-1 text-gray-700">{order.address}</p>
                          <span className="text-[10px] font-semibold text-gray-400">
                            {order.deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-800">
                            {order.paymentMethod === 'cod' ? 'Cash On Delivery' : 'bKash / Nagad'}
                          </span>
                        </td>

                        <td className="p-4 font-black text-gray-900 text-sm">
                          ৳ {order.total?.toLocaleString()}
                        </td>

                        <td className="p-4">
                          <select
                            value={status}
                            disabled={updatingId === order.orderId}
                            onChange={(e) => handleUpdateStatus(order.orderId, e.target.value)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border outline-none ${
                              status === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : status === 'Processing'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : status === 'Cancelled'
                                ? 'bg-red-50 text-red-800 border-red-300'
                                : 'bg-amber-50 text-amber-900 border-amber-300'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing / Packed</option>
                            <option value="Dispatched">Dispatched (Courier)</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedOrder(null)}
            />
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-slide-up">
                
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Order #{selectedOrder.orderId}
                    </h3>
                    <p className="text-xs text-gray-400">Placed on {selectedOrder.orderDate}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl text-xs text-gray-700">
                  <div>
                    <h4 className="font-bold text-gray-900 uppercase text-[11px] mb-1">Customer</h4>
                    <p className="font-semibold text-gray-900">{selectedOrder.customerName}</p>
                    <p className="mt-0.5">Phone: {selectedOrder.phone}</p>
                    {selectedOrder.email && <p>Email: {selectedOrder.email}</p>}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 uppercase text-[11px] mb-1">Address</h4>
                    <p>{selectedOrder.address}</p>
                    <p className="mt-0.5 font-medium">Zone: {selectedOrder.deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Purchased Frames ({selectedOrder.items?.length || 0})
                  </h4>
                  <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            <Image src={item.image} alt={item.title} fill className="object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{item.title}</p>
                            <p className="text-[11px] text-gray-500">{item.selectedSize} × {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900">
                          ৳ {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4 flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-600">Total Payable:</span>
                  <span className="text-lg font-black text-gray-900">
                    ৳ {selectedOrder.total?.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl"
                  >
                    Print Invoice
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-5 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
