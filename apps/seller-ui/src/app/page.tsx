"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  LayoutTemplate, 
  Box, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Search, 
  Plus, 
  MoreHorizontal,
  ArrowUpRight,
  Store,
  Filter,
  Download,
  AlertCircle
} from "lucide-react";

export default function SellerDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch("http://127.0.0.1:6002/api/get-all-products");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.warn("Backend not reachable");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInventory();
  }, []);

  return (
    <div className="flex h-screen bg-[#F6F8FA] font-sans text-slate-900 overflow-hidden">
      
      <aside className="w-[260px] bg-white border-r border-slate-200 flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-1.5 rounded text-white">
              <Store size={18} strokeWidth={2.5} />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase italic">Atlas<span className="text-red-600 normal-case not-italic text-sm ml-1">Seller</span></span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-0.5 custom-scrollbar">
          <p className="px-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Overview</p>
          
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.02] transition-colors">
            <BarChart3 size={16} /> <span className="font-medium text-sm">Dashboard</span>
          </Link>
          
          <Link href="/dashboard/create-product" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-500/10 text-red-500 transition-colors">
            <Plus size={16} /> <span className="font-bold text-sm">Create Product</span>
          </Link>
          
          <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.02] transition-colors">
            <Box size={16} /> <span className="font-medium text-sm">Inventory</span>
          </Link>
          
          <div className="mt-8">
            <p className="px-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Sales Channels</p>
            <Link href="/edit-profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.02] transition-colors group">
              <Store size={16} className="text-zinc-500 group-hover:text-zinc-300" /> 
              <span className="font-medium text-sm">Storefront Builder</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Settings size={16} /> <span className="font-medium text-sm">Settings</span>
          </a>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 font-medium">AtlasSeller</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900">Inventory</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="pl-9 pr-4 py-1.5 bg-slate-100 border border-transparent rounded-md text-sm focus:bg-white focus:border-red-300 focus:ring-2 focus:ring-red-100 outline-none w-64 transition-all"
              />
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs cursor-pointer shadow-sm">
              G
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
          <div className="max-w-[1200px] mx-auto space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500 mb-1">Total Products</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-2xl font-black">{products.length}</h3>
                  <span className="flex items-center text-green-600 text-xs font-bold mb-1"><ArrowUpRight size={14}/> +12%</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500 mb-1">Out of Stock</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-2xl font-black text-red-600">{products.filter(p => p.stock === 0).length || 0}</h3>
                  <span className="text-slate-400 text-xs font-medium mb-1">Needs attention</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500 mb-1">Total Inventory Value</p>
                <h3 className="text-2xl font-black">₹{products.reduce((acc, p) => acc + (p.sale_price * p.stock), 0).toLocaleString()}</h3>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
              
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
                  <button onClick={() => setActiveTab("all")} className={`pb-4 -mb-4 border-b-2 transition-colors ${activeTab === "all" ? "border-slate-900 text-slate-900" : "border-transparent hover:text-slate-800"}`}>All Products</button>
                  <button onClick={() => setActiveTab("active")} className={`pb-4 -mb-4 border-b-2 transition-colors ${activeTab === "active" ? "border-slate-900 text-slate-900" : "border-transparent hover:text-slate-800"}`}>Active</button>
                  <button onClick={() => setActiveTab("drafts")} className={`pb-4 -mb-4 border-b-2 transition-colors ${activeTab === "drafts" ? "border-slate-900 text-slate-900" : "border-transparent hover:text-slate-800"}`}>Drafts</button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    <Filter size={14} /> Filter
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    <Download size={14} /> Export
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors shadow-sm">
                    <Plus size={16} /> Create Product
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 font-medium">Product</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Inventory</th>
                      <th className="px-6 py-3 font-medium">Category</th>
                      <th className="px-6 py-3 font-medium">Price</th>
                      <th className="px-6 py-3 font-medium text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading your catalog...</td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-900 font-medium mb-1">No products found</p>
                          <p className="text-slate-500 text-sm mb-4">Get started by creating your first product.</p>
                          <button className="text-red-600 font-medium text-sm hover:underline">Create Product &rarr;</button>
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-slate-100 rounded border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                <img src={product.images?.[0]?.url || "/placeholder.svg"} className="h-8 w-8 object-contain" alt="img" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 truncate max-w-[200px]">{product.title}</p>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">{product.id.substring(0, 8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span className="text-slate-700 font-medium">Active</span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            {product.stock > 10 ? (
                              <span className="text-slate-700">{product.stock} in stock</span>
                            ) : product.stock > 0 ? (
                              <span className="text-amber-600 font-medium">{product.stock} in stock (Low)</span>
                            ) : (
                              <span className="text-red-600 font-medium">Out of stock</span>
                            )}
                          </td>
                          <td className="px-6 py-3">
                            <span className="text-slate-600">{product.category}</span>
                          </td>
                          <td className="px-6 py-3 font-medium text-slate-900">
                            ₹{product.sale_price}
                          </td>
                          <td className="px-6 py-3 text-right">
                            <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors opacity-0 group-hover:opacity-100">
                              <MoreHorizontal size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {!isLoading && products.length > 0 && (
                <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-sm text-slate-500">
                  <span>Showing {products.length} products</span>
                  <div className="flex items-center gap-2">
                    <button className="px-2 py-1 border border-slate-200 rounded hover:bg-white transition-colors" disabled>Previous</button>
                    <button className="px-2 py-1 border border-slate-200 rounded hover:bg-white transition-colors">Next</button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}