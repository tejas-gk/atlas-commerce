"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, FieldValues } from "react-hook-form";
import { Save, Trash2, ArrowLeft, Loader2, Plus, Store, Globe, Clock, MapPin, Link2 } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";
import useSeller from "@/hooks/useSeller";

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
  shopId?: string;
}

const socialMediaOptions = [
  { label: "Facebook", value: "facebook" },
  { label: "YouTube", value: "youtube" },
  { label: "X (Twitter)", value: "x" },
];

// API call to update profile
const updateSellerProfile = async (data: SellerProfileForm) => {
  const response = await axiosInstance.put("/seller/api/edit-profile", data);
  return response.data;
};

const EditProfile = () => {
  const { seller } = useSeller();
  const router = useRouter();
  const queryClient = useQueryClient();

  // React Hook Form Setup
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SellerProfileForm>({
    defaultValues: {
      name: seller?.shop?.name || "",
      bio: seller?.shop?.bio || "",
      opening_hours: seller?.shop?.opening_hours || "Mon - Sat: 9 AM - 6 PM",
      address: seller?.shop?.address || "",
      website: seller?.shop?.website || "",
      socialLinks: seller?.shop?.socialLinks || [{ type: "facebook", url: "" }],
    },
  });

  React.useEffect(() => {
    setValue("name", seller?.shop?.name || "");
    setValue("bio", seller?.shop?.bio || "");
    setValue(
      "opening_hours",
      seller?.shop?.opening_hours || "Mon - Sat: 9 AM - 6 PM"
    );
    setValue("address", seller?.shop?.address || "");
    setValue("website", seller?.shop?.website || "");
    setValue(
      "socialLinks",
      seller?.shop?.socialLinks || [{ type: "facebook", url: "" }]
    );
  }, [seller?.activeShopId, seller?.shop, setValue]);

  const socialLinks = watch("socialLinks");

  // Mutation for updating the seller profile
  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: updateSellerProfile,
    onSuccess: (data) => {
      toast.success(data.message || "Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["seller"] });
      router.push("/");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update profile!"
      );
    },
  });

  // Form Submit Handler
  const onSubmit = (data: FieldValues) => {
    updateProfile({
      ...(data as SellerProfileForm),
      shopId: seller?.activeShopId,
    } as SellerProfileForm);
  };

  // Add New Social Link
  const addSocialLink = () => {
    setValue("socialLinks", [...socialLinks, { type: "facebook", url: "" }]);
  };

  // Remove Social Link
  const removeSocialLink = (index: number) => {
    const updatedLinks = socialLinks.filter((_, i) => i !== index);
    setValue("socialLinks", updatedLinks);
  };

  const countWords = (text: string) => text.trim().split(/\s+/).length;

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft size={14} />
            <span>Back to Profile</span>
          </button>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Edit Shop Profile</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Update your shop information and social links</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card className="seller-panel rounded-[28px] border-0 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-100">
                <Store size={16} className="text-[#86b81d]" />
              </div>
              <div>
                <h3 className="text-[#17320f] font-medium">Basic Information</h3>
                <p className="text-xs text-[#687259]">Your shop's core details</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Shop Name */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Shop Name</label>
                <Input
                  {...register("name", { required: "Shop name is required" })}
                  className="rounded-2xl border-[#dde1bc] bg-white"
                  placeholder="Enter your shop name"
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.name.message}</p>
                )}
              </div>

              {/* Shop Bio */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-muted-foreground">Shop Bio</label>
                  <span className="text-[10px] text-muted-foreground/40">
                    {countWords(watch("bio") || "")}/100 words
                  </span>
                </div>
                <textarea
                  {...register("bio", {
                    validate: (value) =>
                      countWords(value || "") <= 100 || "Bio can't exceed 100 words",
                  })}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-[#dde1bc] bg-white rounded-2xl text-[#17320f] placeholder:text-[#8f9670] outline-none focus:border-lime-400 transition-colors resize-none"
                  placeholder="Tell customers about your shop..."
                />
                {errors.bio && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.bio.message}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Contact & Location */}
          <Card className="seller-panel rounded-[28px] border-0 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-100">
                <MapPin size={16} className="text-[#86b81d]" />
              </div>
              <div>
                <h3 className="text-[#17320f] font-medium">Contact & Location</h3>
                <p className="text-xs text-[#687259]">Where customers can find you</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Opening Hours */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Opening Hours</label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b916a]" />
                  <Input
                    {...register("opening_hours")}
                    className="pl-9 rounded-2xl border-[#dde1bc] bg-white"
                    placeholder="e.g., Mon - Sat: 9 AM - 6 PM"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Shop Address</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b916a]" />
                  <Input
                    {...register("address")}
                    className="pl-9 rounded-2xl border-[#dde1bc] bg-white"
                    placeholder="Enter your shop address"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Online Presence */}
          <Card className="seller-panel rounded-[28px] border-0 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100">
                <Globe size={16} className="text-violet-500" />
              </div>
              <div>
                <h3 className="text-[#17320f] font-medium">Online Presence</h3>
                <p className="text-xs text-[#687259]">Website and social media links</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Website */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Website</label>
                <div className="relative">
                  <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b916a]" />
                  <Input
                    {...register("website", {
                      pattern: {
                        value:
                          /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]{2,256}\.[a-z]{2,6}\b)(\/[^\s]*)?$/,
                        message: "Enter a valid URL",
                      },
                    })}
                    className="pl-9 rounded-2xl border-[#dde1bc] bg-white"
                    placeholder="https://your-shop.com"
                  />
                </div>
                {errors.website && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.website.message}</p>
                )}
              </div>

              {/* Social Links */}
              <div>
                <label className="text-xs text-muted-foreground mb-3 block">Social Links</label>
                <div className="space-y-3">
                  {socialLinks.map((link, index) => (
                    <div key={`social-${index}`} className="flex gap-2">
                      <Controller
                        control={control}
                        name={`socialLinks.${index}.type`}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="w-32 h-9 px-3 text-sm border border-[#dde1bc] bg-white rounded-xl text-[#17320f] outline-none focus:border-lime-400 transition-colors"
                          >
                            {socialMediaOptions.map((option) => (
                              <option key={option.value} value={option.value} className="bg-card">
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
                      />

                      <div className="flex-1">
                        <Controller
                          control={control}
                          name={`socialLinks.${index}.url`}
                          rules={{
                            pattern: {
                              value:
                                /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]{1,256}\.[a-z]{1,6}\b)(\/[^\s]*)?$/,
                              message: `Enter a valid ${socialLinks[index]?.type} URL`,
                            },
                          }}
                          render={({ field }) => (
                            <Input
                              {...field}
                              className="rounded-2xl border-[#dde1bc] bg-white"
                              placeholder={`Enter ${socialLinks[index]?.type} URL`}
                            />
                          )}
                        />
                        {errors.socialLinks?.[index]?.url && (
                          <p className="text-red-400 text-xs mt-1.5">
                            {errors.socialLinks[index]?.url?.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSocialLink(index)}
                        className="h-9 w-9 text-muted-foreground hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSocialLink}
                  className="mt-3 gap-2 rounded-2xl border-[#dde1bc] bg-white hover:bg-[#f6f8ea]"
                >
                  <Plus size={14} />
                  Add Social Link
                </Button>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              className="rounded-2xl border-[#dde1bc] bg-white hover:bg-[#f6f8ea]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="gap-2 bg-[#86b81d] hover:bg-[#77a51b] text-white border-0 rounded-2xl"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
