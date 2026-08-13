'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariation } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    variation?: ProductVariation,
    frameColor?: string,
    quantity?: number,
    selectedPieces?: number,
    selectedPiecesLabel?: string
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gt_cart_items');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('gt_cart_items', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to localStorage', e);
      }
    }
  }, [items, isLoaded]);

  const addItem = (
    product: Product,
    variation?: ProductVariation,
    frameColor: string = '',
    quantity: number = 1,
    selectedPieces: number = 1,
    selectedPiecesLabel?: string
  ) => {
    const selectedSize = variation ? variation.size : (product.variations?.[0]?.size || 'Standard');
    const basePrice = variation ? variation.price : product.price;
    const baseRegularPrice = variation ? variation.regularPrice : product.regularPrice;
    // Multiply price by pieces selected
    const price = basePrice * selectedPieces;
    const regularPrice = baseRegularPrice ? baseRegularPrice * selectedPieces : undefined;

    // Unique ID includes pieces so 1-piece and 2-piece/3-piece combinations are separate cart items
    const piecesKey = selectedPiecesLabel ? selectedPiecesLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `${selectedPieces}pc`;
    const itemId = `${product.slug}_${selectedSize.replace(/\s+/g, '-')}_${piecesKey}`;

    setItems(prevItems => {
      const existing = prevItems.find(item => item.id === itemId);
      if (existing) {
        return prevItems.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            id: itemId,
            productId: product.id,
            title: product.title,
            slug: product.slug,
            image: product.image,
            price: price,
            regularPrice: regularPrice,
            quantity: quantity,
            selectedSize: selectedSize,
            selectedFrameColor: frameColor,
            selectedPieces: selectedPieces,
            selectedPiecesLabel: selectedPiecesLabel,
          },
        ];
      }
    });

    setIsCartDrawerOpen(true);
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        openCartDrawer: () => setIsCartDrawerOpen(true),
        closeCartDrawer: () => setIsCartDrawerOpen(false),
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
