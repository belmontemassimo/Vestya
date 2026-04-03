"use client";

import { useState, useRef } from "react";
import { Check, Map, ImageIcon, Upload, Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { WidgetType } from "@/types/dashboard";
import { getWidgetsForContext } from "@/config/widget-registry";
import {
  getPropertyCoverUploadUrl,
  setPropertyCoverImage,
  createProperty,
} from "@/actions/property.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

type PickerStep = "widgets" | "selectProperty" | "createProperty" | "selectDisplay" | "uploadImage";

const PROPERTY_TYPES = [
  "HOUSE", "APARTMENT", "CONDO", "VILLA", "CABIN", "LAND", "COMMERCIAL", "BOAT", "CAR", "OTHER",
] as const;

const newPropertySchema = z.object({
  name: z.string().min(1),
  propertyType: z.enum(PROPERTY_TYPES),
  city: z.string().optional(),
  country: z.string().optional(),
});

type NewPropertyValues = z.infer<typeof newPropertySchema>;

interface WidgetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: "family" | "property";
  existingWidgetTypes: string[];
  onAddWidget: (type: WidgetType, config?: Record<string, unknown>) => void;
  properties?: Array<{ id: string; name: string }>;
}

export function WidgetPicker({
  open,
  onOpenChange,
  context,
  existingWidgetTypes,
  onAddWidget,
  properties = [],
}: WidgetPickerProps) {
  const t = useTranslations("widgets");
  const tp = useTranslations("properties");
  const router = useRouter();
  const [step, setStep] = useState<PickerStep>("widgets");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableWidgets = getWidgetsForContext(context);

  const form = useForm<NewPropertyValues>({
    resolver: zodResolver(newPropertySchema),
    defaultValues: { name: "", propertyType: "HOUSE", city: "", country: "" },
  });

  function reset() {
    setStep("widgets");
    setSelectedPropertyId(null);
    setIsUploading(false);
    setIsCreating(false);
    form.reset();
  }

  function handleWidgetClick(type: WidgetType, hasConfig: boolean) {
    const allowDuplicates = type === "property" || type === "calendar" || type === "property-calendar";
    if (existingWidgetTypes.includes(type) && !allowDuplicates) return;

    if (hasConfig && type === "property") {
      setStep("selectProperty");
      return;
    }

    onAddWidget(type);
    reset();
    onOpenChange(false);
  }

  function handlePropertySelect(propertyId: string) {
    setSelectedPropertyId(propertyId);
    setStep("selectDisplay");
  }

  async function handleCreateProperty(values: NewPropertyValues) {
    setIsCreating(true);
    try {
      const result = await createProperty(values);
      if (!result.success) {
        toast.error(result.error ?? tp("error"));
        return;
      }
      toast.success(tp("created"));
      router.refresh();
      // Continue the widget flow with the newly created property
      setSelectedPropertyId(result.data.id);
      setStep("selectDisplay");
    } catch {
      toast.error(tp("error"));
    } finally {
      setIsCreating(false);
    }
  }

  function handleDisplayMap() {
    onAddWidget("property", {
      propertyId: selectedPropertyId!,
      displayMode: "map",
    });
    reset();
    onOpenChange(false);
  }

  function handleDisplayImage() {
    setStep("uploadImage");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedPropertyId) return;

    setIsUploading(true);
    try {
      const urlResult = await getPropertyCoverUploadUrl(
        selectedPropertyId,
        file.type,
      );
      if (!urlResult.success) {
        toast.error(urlResult.error ?? "Failed to get upload URL");
        return;
      }

      const { uploadUrl, storageKey } = urlResult.data;

      const xhr = new XMLHttpRequest();
      await new Promise<void>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      await setPropertyCoverImage(selectedPropertyId, storageKey);

      onAddWidget("property", {
        propertyId: selectedPropertyId,
        displayMode: "image",
        coverImage: storageKey,
      });

      reset();
      onOpenChange(false);
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("addWidget")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("addWidget")}
          </DialogDescription>
        </DialogHeader>

        {step === "selectProperty" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">{t("selectProperty")}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {properties.map((property) => (
                <Button
                  key={property.id}
                  variant="outline"
                  className="justify-start"
                  onClick={() => handlePropertySelect(property.id)}
                >
                  {property.name}
                </Button>
              ))}
              <Button
                variant="outline"
                className="justify-start border-dashed text-slate-500 hover:text-slate-700"
                onClick={() => setStep("createProperty")}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("createNewProperty")}
              </Button>
            </div>
          </div>
        )}

        {step === "createProperty" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">{t("createNewProperty")}</p>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleCreateProperty)}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tp("name")}</FormLabel>
                        <FormControl>
                          <Input placeholder={tp("namePlaceholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tp("typeLabel")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PROPERTY_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {tp(`type.${type}` as Parameters<typeof tp>[0])}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tp("city")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tp("country")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setStep("selectProperty");
                    }}
                  >
                    {t("cancel")}
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {tp("addProperty")}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {step === "selectDisplay" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">{t("chooseDisplay")}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleDisplayMap}
                className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 p-6 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                  <Map className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{t("displayMap")}</p>
                  <p className="mt-1 text-xs text-slate-400">{t("displayMapDesc")}</p>
                </div>
              </button>
              <button
                type="button"
                onClick={handleDisplayImage}
                className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 p-6 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
                  <ImageIcon className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{t("displayImage")}</p>
                  <p className="mt-1 text-xs text-slate-400">{t("displayImageDesc")}</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === "uploadImage" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">{t("uploadCoverImage")}</p>
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors",
                isUploading
                  ? "border-blue-300 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300",
              )}
            >
              {isUploading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="text-sm text-slate-600">Uploading...</span>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500 mb-3">
                    {t("dropOrClickImage")}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t("selectImage")}
                  </Button>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>
        )}

        {step === "widgets" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availableWidgets.map((def) => {
              const canDuplicate = def.type === "property" || def.type === "calendar" || def.type === "property-calendar";
              const isAdded =
                existingWidgetTypes.includes(def.type) &&
                !canDuplicate;
              const Icon = def.icon;
              const titleKey = def.titleKey.replace("widgets.", "");

              return (
                <button
                  key={def.type}
                  type="button"
                  onClick={() => handleWidgetClick(def.type, def.hasConfig)}
                  disabled={isAdded}
                  className={cn(
                    "relative rounded-xl border p-4 text-left transition-colors",
                    isAdded
                      ? "cursor-default border-green-200 bg-green-50/30 opacity-70"
                      : "cursor-pointer border-slate-200 hover:border-blue-300 hover:bg-blue-50/50",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <Icon className="h-4.5 w-4.5 text-slate-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700">
                        {t(titleKey as Parameters<typeof t>[0])}
                      </p>
                    </div>
                  </div>
                  {isAdded && (
                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
