"use client";

import { useState } from "react";
import { Store, Globe, MapPin, Clock, Plus, Trash2, Save, Link as LinkIcon } from "lucide-react";

interface SocialLink {
  type: string;
  url: string;
}

interface SellerProfileForm {
  name: string;
  bio: string;
  opening_hours: string;
  address: string;
  website: string;
  socialLinks: SocialLink[];
}

export default function StoreSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<SellerProfileForm>({
    name: "Atlas Default Store",
    bio: "We sell premium, high-quality goods.",
    opening_hours: "Mon-Fri: 9AM - 6PM",
    address: "123 Commerce St, Tech District",
    website: "https://atlas-store.com",
    socialLinks: [{ type: "instagram", url: "https://instagram.com/atlas" }]
  });

  const handleAddSocial = () => {
    setFormData({
      ...formData,
      socialLinks: [...formData.socialLinks, { type: "twitter", url: "" }]
    });
  };

  const handleRemoveSocial = (index: number) => {
    const newLinks = formData.socialLinks.filter((_, i) => i !== index);
    setFormData({ ...formData, socialLinks: newLinks });
  };

  const handleUpdateSocial = (index: number, field: "type" | "url", value: string) => {
    const newLinks = [...formData.socialLinks];
    if (newLinks[index]) {
      newLinks[index][field] = value;
      setFormData({ ...formData, socialLinks: newLinks });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Store profile saved successfully!");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans text-zinc-100 selection:bg-red-500/30">
      
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Storefront Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage how your shop appears to buyers on the Atlas marketplace.</p>
      </div>

      <div className="space-y-6">
        
        <section className="bg-[#09090B] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02]">
            <h2 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
              <Store size={16} className="text-zinc-500" /> Basic Information
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Store Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:bg-white/[0.05] focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Store Bio / Description</label>
              <textarea 
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:bg-white/[0.05] focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 outline-none transition-all resize-none leading-relaxed"
              />
            </div>
          </div>
        </section>

        <section className="bg-[#09090B] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02]">
            <h2 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
              <MapPin size={16} className="text-zinc-500" /> Location & Contact
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest flex items-center gap-1.5">
                <Clock size={12} /> Opening Hours
              </label>
              <input 
                type="text" 
                value={formData.opening_hours}
                onChange={(e) => setFormData({...formData, opening_hours: e.target.value})}
                placeholder="e.g. Mon-Fri: 9AM - 6PM"
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:bg-white/[0.05] focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest flex items-center gap-1.5">
                <Globe size={12} /> Website
              </label>
              <input 
                type="url" 
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                placeholder="https://"
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:bg-white/[0.05] focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Physical Address</label>
              <input 
                type="text" 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:bg-white/[0.05] focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 outline-none transition-all"
              />
            </div>
          </div>
        </section>

        <section className="bg-[#09090B] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
              <LinkIcon size={16} className="text-zinc-500" /> Social Links
            </h2>
            <button 
              onClick={handleAddSocial}
              className="text-xs font-semibold text-red-500 flex items-center gap-1 hover:text-red-400 transition-colors"
            >
              <Plus size={14} /> Add Link
            </button>
          </div>
          <div className="p-6 space-y-4">
            {formData.socialLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-3">
                <select 
                  value={link.type}
                  onChange={(e) => handleUpdateSocial(index, "type", e.target.value)}
                  className="w-36 px-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-zinc-300 focus:bg-white/[0.05] focus:border-red-500/50 outline-none cursor-pointer appearance-none"
                >
                  <option value="instagram" className="bg-[#09090B]">Instagram</option>
                  <option value="twitter" className="bg-[#09090B]">X (Twitter)</option>
                  <option value="facebook" className="bg-[#09090B]">Facebook</option>
                  <option value="tiktok" className="bg-[#09090B]">TikTok</option>
                </select>
                <input 
                  type="url" 
                  value={link.url}
                  onChange={(e) => handleUpdateSocial(index, "url", e.target.value)}
                  placeholder="https://"
                  className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:bg-white/[0.05] focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 outline-none transition-all"
                />
                <button 
                  onClick={() => handleRemoveSocial(index)}
                  className="p-2.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {formData.socialLinks.length === 0 && (
              <p className="text-sm text-zinc-500 text-center py-4 italic">No social links added yet.</p>
            )}
          </div>
        </section>

        <div className="flex items-center justify-end gap-4 pt-4">
          <button className="px-5 py-2.5 text-sm font-semibold text-zinc-400 hover:text-zinc-100 transition-colors">
            Discard Changes
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-500 transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)] disabled:opacity-70 disabled:hover:bg-red-600"
          >
            {isSaving ? "Saving..." : <><Save size={16} /> Save Profile</>}
          </button>
        </div>

      </div>
    </div>
  );
}