import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <AdminHeader
        title="Add New Wall Frame Product"
        description="Create a new handcrafted wall frame, configure size bundles, prices, and upload gallery images"
      />

      <div className="p-6 max-w-7xl mx-auto">
        <ProductForm isEditing={false} />
      </div>
    </div>
  );
}
