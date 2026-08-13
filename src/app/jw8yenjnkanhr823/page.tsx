'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Layers,
  ArrowRight,
  PlusCircle,
  Clock,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { Product, OrderDetails } from '@/types';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, orderRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/orders'),
        ]);
        const prodData = await prodRes.json();
        const orderData = await orderRes.json();

        if (prodData.success) setProducts(prodData.products);
        if (orderData.success) setOrders(orderData.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const bestSellersCount = products.filter((p) => p.bestSeller).length;

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Store Dashboard"
        description="Overview of sales, inventory, and customer orders"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-8">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-gray-500 text-xs font-semibold uppercase">
              <span>Total Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">
              ৳ {totalRevenue.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">
              From {orders.length} total customer orders
            </p>
          </div>

          {/* Orders */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-gray-500 text-xs font-semibold uppercase">
              <span>Customer Orders</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">
              {orders.length}
            </p>
            <Link
              href="/jw8yenjnkanhr823/orders"
              className="text-[11px] text-blue-600 hover:underline font-medium block"
            >
              Manage Orders &rarr;
            </Link>
          </div>

          {/* Active Products */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-gray-500 text-xs font-semibold uppercase">
              <span>Total Products</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">
              {products.length}
            </p>
            <Link
              href="/jw8yenjnkanhr823/products"
              className="text-[11px] text-amber-700 hover:underline font-medium block"
            >
              View All Products &rarr;
            </Link>
          </div>

          {/* Best Sellers */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-gray-500 text-xs font-semibold uppercase">
              <span>Featured Frames</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">
              {bestSellersCount}
            </p>
            <p className="text-[11px] text-purple-600 font-medium">
              Highlighted on Homepage
            </p>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="bg-gray-950 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold">Ready to add new frame artwork?</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Create product pages with custom sizes, prices, specifications, and gallery photos.
            </p>
          </div>
          <Link
            href="/jw8yenjnkanhr823/products/new"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shrink-0 shadow-lg"
          >
            <PlusCircle className="w-4 h-4" /> Add Product Now
          </Link>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Recent Customer Orders
              </h2>
              <p className="text-xs text-gray-500">Live incoming orders from Bangladesh</p>
            </div>
            <Link
              href="/jw8yenjnkanhr823/orders"
              className="text-xs font-bold text-black hover:underline flex items-center gap-1"
            >
              View All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-gray-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">No orders received yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Zone / Method</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-bold text-gray-900">#{order.orderId}</td>
                      <td className="p-3 font-semibold">{order.customerName}</td>
                      <td className="p-3 text-gray-500">{order.phone}</td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-800">
                          {order.deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'} •{' '}
                          {order.paymentMethod === 'cod' ? 'COD' : 'bKash'}
                        </span>
                      </td>
                      <td className="p-3 font-extrabold text-gray-900">
                        ৳ {order.total?.toLocaleString()}
                      </td>
                      <td className="p-3 text-gray-400">{order.orderDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
