"use client";

import { useState } from "react";
import { Package, Tag, IndianRupee, Image as ImageIcon, CheckCircle2, Save, X, Plus } from "lucide-react";

export default function CreateProduct() {
  const [activeSection, setActiveSection] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    subCategory: "",
    short_description: "",
    detailed_description: "",
    regular_price: "",
    sale_price: "",
    stock: "",
    brand: "",
    warranty: "",
    cashOnDelivery: "Yes",
    colors: [] as string[],
    sizes: [] as string[],
    tags: [] as string[],
  });

  const [tempInput, setTempInput] = useState({ tags: "", colors: "", sizes: "" });

  const handleArrayAdd = (field: "tags" | "colors" | "sizes", e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tempInput[field].trim() !== "") {
      e.preventDefault();
      setFormData({ ...formData, [field]: [...formData[field], tempInput[field].trim()] });
      setTempInput({ ...tempInput, [field]: "" });
    }
  };

  const removeArrayItem = (field: "tags" | "colors" | "sizes", index: number) => {
    setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const payload = { ...formData, custom_properties: {} }; 
    console.log("Saving payload:", payload);
    setTimeout(() => { setIsSaving(false); alert("Product Created!"); }, 1000);
  };

  return (
    <div className="flex h-screen bg-[#09090B] font-sans text-zinc-100 selection:bg-red-500/30">
      
      <aside className="w-64 border-r border-white/10 bg-[#09090B] p-6 hidden md:block">
        <h2 className="text-lg font-bold mb-8 tracking-tight">Create Product</h2>
        <nav className="space-y-1">
          {[
            { id: "basic", icon: Package, label: "Basic Info" },
            { id: "pricing", icon: IndianRupee, label: "Pricing & Stock" },
            { id: "variants", icon: Tag, label: "Variants & Tags" },
            { id: "media", icon: ImageIcon, label: "Images & Media" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeSection === item.id ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
              }`}
            >
              <item.icon size={16} /> {item.label}
              {activeSection === item.id && <CheckCircle2 size={14} className="ml-auto text-red-500" />}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0A0A0C]">
        
        <header className="h-16 border-b border-white/10 flex items-center justify-end px-8 shrink-0 bg-[#09090B]/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">Discard</button>
            <button 
              onClick={handleSave} disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-500 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(220,38,38,0.2)]"
            >
              <Save size={16} /> {isSaving ? "Saving..." : "Publish Product"}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
          <div className="max-w-3xl space-y-10 pb-20">
            
            {activeSection === "basic" && (
              <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h3 className="text-xl font-bold mb-1">Basic Information</h3>
                  <p className="text-zinc-500 text-sm">Title, descriptions, and categorization.</p>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Product Title <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm focus:border-red-500/50 outline-none" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Category <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm focus:border-red-500/50 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Sub Category</label>
                      <input type="text" value={formData.subCategory} onChange={(e) => setFormData({...formData, subCategory: e.target.value})} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm focus:border-red-500/50 outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Short Description</label>
                    <textarea rows={2} value={formData.short_description} onChange={(e) => setFormData({...formData, short_description: e.target.value})} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm focus:border-red-500/50 outline-none resize-none" />
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Detailed Description (Markdown Supported)</label>
                    <textarea rows={6} value={formData.detailed_description} onChange={(e) => setFormData({...formData, detailed_description: e.target.value})} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm focus:border-red-500/50 outline-none resize-none font-mono text-zinc-300" />
                  </div>
                </div>
              </section>
            )}

            {activeSection === "pricing" && (
              <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h3 className="text-xl font-bold mb-1">Pricing & Inventory</h3>
                  <p className="text-zinc-500 text-sm">Set your margins and manage stock levels.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-[#09090B] p-5 rounded-xl border border-white/10 shadow-lg space-y-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Regular Price (MRP) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-zinc-500 font-medium">₹</span>
                        <input type="number" value={formData.regular_price} onChange={(e) => setFormData({...formData, regular_price: e.target.value})} className="w-full pl-8 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm focus:border-red-500/50 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Sale Price <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-zinc-500 font-medium">₹</span>
                        <input type="number" value={formData.sale_price} onChange={(e) => setFormData({...formData, sale_price: e.target.value})} className="w-full pl-8 pr-4 py-2.5 bg-white/[0.03] border border-red-500/30 rounded-lg text-sm focus:border-red-500 outline-none text-red-100" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Available Stock <span className="text-red-500">*</span></label>
                      <input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm focus:border-red-500/50 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Cash on Delivery</label>
                      <select value={formData.cashOnDelivery} onChange={(e) => setFormData({...formData, cashOnDelivery: e.target.value})} className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm focus:border-red-500/50 outline-none appearance-none">
                        <option value="Yes" className="bg-[#09090B]">Yes, allow COD</option>
                        <option value="No" className="bg-[#09090B]">No, prepaid only</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeSection === "variants" && (
              <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h3 className="text-xl font-bold mb-1">Variants & Discovery</h3>
                  <p className="text-zinc-500 text-sm">Add colors, sizes, and tags for the search engine.</p>
                </div>
                
                {(["tags", "colors", "sizes"] as const).map((field) => (
                  <div key={field} className="bg-white/[0.02] p-5 rounded-xl border border-white/5 space-y-3">
                    <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">{field} (Press Enter to add)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      
                      {formData[field].map((item: string, i: number) => (
                        <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-white/10 text-xs font-medium rounded-full text-zinc-200">
                          {item} <button onClick={() => removeArrayItem(field, i)} className="hover:text-red-400"><X size={12}/></button>
                        </span>
                      ))}
                      
                    </div>
                    <input 
                      type="text" 
                      placeholder={`Add ${field}...`}
                      value={tempInput[field]} 
                      onChange={(e) => setTempInput({...tempInput, [field]: e.target.value})} 
                      onKeyDown={(e) => handleArrayAdd(field, e)}
                      className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm focus:border-red-500/50 outline-none" 
                    />
                  </div>
                ))}
              </section>
            )}

             {activeSection === "media" && (
              <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h3 className="text-xl font-bold mb-1">Images & Media</h3>
                  <p className="text-zinc-500 text-sm">Upload high-quality assets. (Wired to ImageKit)</p>
                </div>
                
                <div className="border-2 border-dashed border-white/10 hover:border-red-500/50 transition-colors rounded-xl p-10 flex flex-col items-center justify-center bg-white/[0.01] cursor-pointer group">
                  <div className="bg-white/5 p-4 rounded-full mb-4 group-hover:bg-red-500/10 group-hover:text-red-500 transition-colors">
                    <Plus size={24} />
                  </div>
                  <p className="text-sm font-semibold text-zinc-300">Click to upload images</p>
                  <p className="text-xs text-zinc-500 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                </div>
              </section>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}