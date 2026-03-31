"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { MapPin, Search, User, ShoppingCart, ChevronRight, Zap, Plus, Minus, X, Info, Receipt } from "lucide-react";
import { fetchProducts } from "@/lib/api";
import { useStore } from "@/store";

export default function Home() {
  const { data: products, isLoading } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { cart, addToCart, removeFromCart } = useStore();
  
  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const trackingContext = {
    user: { id: "gowtham_01" },
    location: { country: "India", city: "Chennai" },
    deviceInfo: "Windows Desktop"
  };

  const getQty = (id: string) => cart.find((item) => item.id === id)?.quantity || 0;
  const totalItems = cart.reduce((acc, item) => acc + (item.quantity ?? 1), 0);
  const itemTotal = cart.reduce((acc, item) => acc + (item.price * (item.quantity ?? 1)), 0);
  
  // Blinkit-style Cart Math
  const deliveryCharge = itemTotal > 199 ? 0 : 25;
  const handlingFee = 4;
  const grandTotal = itemTotal > 0 ? itemTotal + deliveryCharge + handlingFee : 0;

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p: any) => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isCartOpen]);

  const CATEGORIES = [
    { name: 'Fashion', icon: '👕', bg: 'bg-blue-50' },
    { name: 'Home', icon: '🏠', bg: 'bg-orange-50' },
    { name: 'Books', icon: '📚', bg: 'bg-purple-50' },
    { name: 'Electronics', icon: '💻', bg: 'bg-slate-100' },
    { name: 'Beauty', icon: '✨', bg: 'bg-pink-50' },
    { name: 'Snacks', icon: '🍪', bg: 'bg-yellow-50' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans text-slate-900 overflow-x-hidden selection:bg-red-100">
      
      {/* 1. BLINKIT-STYLE TOP NAV (But Atlas Branded) */}
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-100 px-6 py-3 hidden lg:block shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center gap-8">
          
          <div className="flex items-center gap-2 cursor-pointer group shrink-0" onClick={() => {setSearchQuery(""); setSelectedCategory(null)}}>
            <div className="bg-red-600 p-2 rounded-xl shadow-lg shadow-red-200 group-hover:rotate-12 transition-transform">
              <Zap className="text-white h-6 w-6 fill-white" />
            </div>
            <span className="font-black text-3xl tracking-tighter uppercase italic">Atlas</span>
          </div>

          <div className="flex items-center gap-2 hover:bg-slate-50 p-2 rounded-xl cursor-pointer transition-colors shrink-0 border border-transparent hover:border-slate-200">
            <div className="bg-slate-100 p-2 rounded-lg"><MapPin className="h-4 w-4 text-red-600" /></div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Delivery to</p>
              <p className="text-sm font-black text-slate-800">SRM Vadapalani <ChevronRight className="inline h-3 w-3" /></p>
            </div>
          </div>

          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-red-600 transition-colors" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for 'MacBook', 'Jeans', or 'Books'..." 
              className="pl-12 bg-slate-100/50 border-slate-200 h-12 rounded-2xl focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:bg-white text-base font-medium transition-all shadow-inner" 
            />
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Button variant="ghost" className="font-bold text-slate-600 text-sm hover:bg-slate-100 rounded-xl px-4 h-12">Login</Button>
            <Button onClick={() => setIsCartOpen(true)} className="bg-red-600 hover:bg-red-700 h-12 px-5 rounded-2xl font-black gap-3 shadow-lg shadow-red-600/20 active:scale-95 transition-all text-base">
              <ShoppingCart className="h-5 w-5" /> 
              <div className="flex flex-col items-start leading-none text-left">
                <span className="text-[10px] opacity-80">{totalItems} Items</span>
                <span>₹{totalItems > 0 ? grandTotal : 0}</span>
              </div>
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto p-4 lg:p-8 space-y-8">
        
        {/* 2. HORIZONTAL CATEGORY RIBBON */}
        <section>
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
            <div 
              onClick={() => setSelectedCategory(null)}
              className={`snap-start shrink-0 flex flex-col items-center justify-center gap-2 w-24 h-28 rounded-3xl cursor-pointer transition-all border-2 ${selectedCategory === null ? 'border-red-600 bg-red-50' : 'border-transparent bg-white hover:bg-slate-50 hover:scale-105 shadow-sm'}`}
            >
              <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-xl">✨</div>
              <span className="text-[11px] font-black uppercase tracking-widest">All</span>
            </div>

            {CATEGORIES.map((cat) => (
              <div 
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`snap-start shrink-0 flex flex-col items-center justify-center gap-2 w-24 h-28 rounded-3xl cursor-pointer transition-all border-2 ${selectedCategory === cat.name ? 'border-red-600 bg-red-50' : `border-transparent bg-white hover:${cat.bg} hover:scale-105 shadow-sm`}`}
              >
                <div className={`h-12 w-12 ${cat.bg} rounded-full flex items-center justify-center text-2xl shadow-inner`}>{cat.icon}</div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">{cat.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. PRODUCT GRID */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black tracking-tighter">{selectedCategory || (searchQuery ? `Results for "${searchQuery}"` : "Bestsellers")}</h2>
              <p className="text-slate-400 font-bold text-sm mt-1">Delivery in 10 minutes</p>
            </div>
            {(searchQuery || selectedCategory) && (
              <Button variant="ghost" onClick={() => {setSearchQuery(""); setSelectedCategory(null)}} className="text-xs font-black text-red-600 hover:bg-red-50">Clear Filters</Button>
            )}
          </div>
          
          <motion.div layout className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-72 rounded-[2rem]" />)
              ) : (
                filteredProducts.map((product: any) => {
                  const qty = getQty(product.id);
                  return (
                    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={product.id}>
                      <Card className="border border-slate-100 shadow-sm hover:shadow-xl hover:border-red-100 rounded-[2rem] transition-all bg-white group overflow-hidden h-full flex flex-col">
                        <CardContent className="p-3 flex flex-col h-full relative">
                          
                          {/* Image Container */}
                          <div className="h-36 w-full bg-slate-50 rounded-[1.5rem] mb-3 relative overflow-hidden shrink-0 flex items-center justify-center">
                            {product.discount > 0 && <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-lg text-[9px] font-black z-20 shadow-sm">{product.discount}% OFF</div>}
                            <img src={product.displayImage} className="w-4/5 h-4/5 object-contain group-hover:scale-110 transition-transform duration-500" alt={product.title} />
                          </div>
                          
                          {/* Details */}
                          <div className="flex flex-col flex-1">
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{product.unitLabel}</p>
                            <h4 className="font-bold text-slate-800 text-xs leading-tight mb-2 line-clamp-2">{product.title}</h4>
                            
                            <div className="mt-auto pt-2 flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="font-black text-sm">₹{product.price}</span>
                                {product.discount > 0 && <span className="text-[9px] text-slate-400 line-through font-bold">₹{product.mrp}</span>}
                              </div>
                              
                              {/* Tactile Add Button */}
                              <div className="h-8">
                                {qty === 0 ? (
                                  <Button onClick={() => addToCart({ id: product.id, title: product.title, price: product.price, image: product.displayImage, shopId: product.shopId }, trackingContext.user, trackingContext.location, trackingContext.deviceInfo)} variant="outline" className="h-full px-4 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-600 font-black text-xs transition-colors shadow-sm">
                                    ADD
                                  </Button>
                                ) : (
                                  <div className="flex items-center bg-red-600 rounded-xl h-full shadow-md text-white">
                                    <button onClick={() => removeFromCart(product.id, trackingContext.user, trackingContext.location, trackingContext.deviceInfo)} className="px-2 h-full hover:bg-red-700 rounded-l-xl transition-colors"><Minus size={12} strokeWidth={4}/></button>
                                    <span className="text-xs font-black px-1 min-w-[20px] text-center">{qty}</span>
                                    <button onClick={() => addToCart({ id: product.id, title: product.title, price: product.price, image: product.displayImage, shopId: product.shopId }, trackingContext.user, trackingContext.location, trackingContext.deviceInfo)} className="px-2 h-full hover:bg-red-700 rounded-r-xl transition-colors"><Plus size={12} strokeWidth={4}/></button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </motion.div>
        </section>
      </main>

      {/* 4. BLINKIT-STYLE SLIDING CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-[#F8F9FB] z-50 shadow-2xl flex flex-col border-l border-slate-200"
            >
              {/* Cart Header */}
              <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
                <h2 className="font-black text-xl tracking-tight">My Cart</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-500" /></button>
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-50">
                  <ShoppingCart className="h-20 w-20 mb-6 text-slate-300" strokeWidth={1} />
                  <h3 className="font-black text-lg mb-2">Your cart is empty</h3>
                  <p className="text-sm font-bold text-slate-400">Looks like you haven't added anything to your cart yet.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  
                  {/* Delivery Info Box */}
                  <div className="bg-white p-4 rounded-2xl flex items-start gap-4 shadow-sm border border-slate-100">
                    <div className="bg-green-50 p-2 rounded-xl mt-1"><MapPin size={18} className="text-green-600" /></div>
                    <div>
                      <p className="font-black text-sm">Delivery in 10 minutes</p>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">Shipment of {totalItems} items to SRM Vadapalani.</p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 divide-y divide-slate-50">
                    {cart.map((item) => (
                      <div key={item.id} className="p-3 flex items-center gap-4">
                        <div className="h-16 w-16 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center shrink-0">
                          <img src={item.image} className="h-12 w-12 object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-slate-800 leading-tight mb-1 truncate">{item.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold mb-2">₹{item.price}</p>
                          <span className="font-black text-sm">₹{item.price * (item.quantity ?? 1)}</span>
                        </div>
                        
                        <div className="flex items-center bg-red-600 rounded-lg shadow-sm text-white h-8 shrink-0">
                          <button onClick={() => removeFromCart(item.id, trackingContext.user, trackingContext.location, trackingContext.deviceInfo)} className="px-2 h-full hover:bg-red-700 rounded-l-lg transition-colors"><Minus size={12} strokeWidth={4}/></button>
                          <span className="text-xs font-black px-1 min-w-[20px] text-center">{item.quantity}</span>
                          <button onClick={() => addToCart({ id: item.id, title: item.title, price: item.price, image: item.image, shopId: item.shopId }, trackingContext.user, trackingContext.location, trackingContext.deviceInfo)} className="px-2 h-full hover:bg-red-700 rounded-r-lg transition-colors"><Plus size={12} strokeWidth={4}/></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bill Details */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <h3 className="font-black text-sm flex items-center gap-2"><Receipt size={16} /> Bill Details</h3>
                    <div className="space-y-2 text-sm font-medium text-slate-600">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1">Item total <Info size={12} className="text-slate-300"/></span>
                        <span className="font-bold text-slate-900">₹{itemTotal}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1">Delivery charge <Info size={12} className="text-slate-300"/></span>
                        {deliveryCharge === 0 ? <span className="text-green-600 font-black uppercase text-xs">Free</span> : <span className="font-bold text-slate-900">₹{deliveryCharge}</span>}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1">Handling fee <Info size={12} className="text-slate-300"/></span>
                        <span className="font-bold text-slate-900">₹{handlingFee}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-dashed border-slate-200 flex justify-between items-center">
                      <span className="font-black text-base">Grand Total</span>
                      <span className="font-black text-xl">₹{grandTotal}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Checkout Footer */}
              {cart.length > 0 && (
                <div className="bg-white p-4 border-t border-slate-200 sticky bottom-0 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total to pay</span>
                      <span className="font-black text-2xl tracking-tighter">₹{grandTotal}</span>
                    </div>
                  </div>
                  <Button className="w-full bg-red-600 hover:bg-red-700 h-14 rounded-2xl font-black text-lg shadow-xl shadow-red-600/20 transition-all active:scale-95 group">
                    Login to Proceed <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}