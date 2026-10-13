"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SmallSpinner from "@/components/SmallSpinner";

export default function DiamondForm({
  isFormOpen,
  setIsFormOpen,
  formType,
  formValues,
  setFormValues,
  handleFormSubmit,
  addUpdateLoading,
  shapeList = [],
  colorList = [],
  clarityList = [],
  cutList = [],
  polishList = [],
  symmetryList = [],
  fluorescenceList = [],
  labList = [],
}) {
  return (
    <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
      <SheetContent className="sm:max-w-2xl h-full overflow-y-auto scrollbar-none p-6">
        <SheetHeader className="pt-16 pb-4 mb-2 border-b border-zinc-200">
          <SheetTitle className="text-2xl font-bold text-zinc-900">
            {formType === "add"
              ? "Create Diamond"
              : `Edit Diamond: ${formValues?.stockId || ""}`}
          </SheetTitle>
        </SheetHeader>
        <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Stock ID *</label>
              <Input
                required
                placeholder="e.g. SX-VDIA0003-0050"
                value={formValues.stockId}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, stockId: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Status</label>
              <select
                className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-blue-500"
                value={formValues.status}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Shape</label>
              <select
                className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-blue-500"
                value={formValues.shape}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, shape: e.target.value }))
                }
              >
                <option value="">Select Shape</option>
                {shapeList.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.code || p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Color</label>
              <select
                className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-blue-500"
                value={formValues.color}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, color: e.target.value }))
                }
              >
                <option value="">Select Color</option>
                {colorList.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.code || p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Clarity</label>
              <select
                className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-blue-500"
                value={formValues.clarity}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, clarity: e.target.value }))
                }
              >
                <option value="">Select Clarity</option>
                {clarityList.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.code || p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Cut</label>
              <select
                className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-blue-500"
                value={formValues.cut}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, cut: e.target.value }))
                }
              >
                <option value="">Select Cut</option>
                {cutList.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.code || p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Polish</label>
              <select
                className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-blue-500"
                value={formValues.polish}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, polish: e.target.value }))
                }
              >
                <option value="">Select Polish</option>
                {polishList.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.code || p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Symmetry</label>
              <select
                className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-blue-500"
                value={formValues.symmetry}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, symmetry: e.target.value }))
                }
              >
                <option value="">Select Symmetry</option>
                {symmetryList.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.code || p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Fluorescence</label>
              <select
                className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-blue-500"
                value={formValues.fluorescence}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, fluorescence: e.target.value }))
                }
              >
                <option value="">Select Fluorescence</option>
                {fluorescenceList.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.code || p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Lab</label>
              <select
                className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-blue-500"
                value={formValues.certLab}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, certLab: e.target.value }))
                }
              >
                <option value="">Select Lab</option>
                {labList.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.code || p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Creation (Natural/CVD/HPHT)</label>
              <Input
                placeholder="e.g. CVD, HPHT, Natural"
                value={formValues.creation}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, creation: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Carat</label>
              <Input
                type="number"
                step="any"
                placeholder="e.g. 1.25"
                value={formValues.carat}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, carat: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Carat No</label>
              <Input
                placeholder="e.g. 1"
                value={formValues.caratNo}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, caratNo: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Size (MM)</label>
              <Input
                placeholder="e.g. 3.74*3.4*2.33"
                value={formValues.sizeMM}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, sizeMM: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Cert No</label>
              <Input
                placeholder="e.g. GCAL-334738"
                value={formValues.certNo}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, certNo: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Cert Link</label>
              <Input
                placeholder="e.g. https://cdn.example.com/cert.pdf"
                value={formValues.certLink}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, certLink: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Country</label>
              <Input
                placeholder="e.g. India"
                value={formValues.country}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, country: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">RAP ($)</label>
              <Input
                type="number"
                placeholder="e.g. 385000"
                value={formValues.rap}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, rap: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Discount (%)</label>
              <Input
                type="number"
                step="any"
                placeholder="e.g. 43"
                value={formValues.disc}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, disc: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Gemstone Type</label>
              <Input
                placeholder="e.g. Diamond"
                value={formValues.gemstoneType}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, gemstoneType: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Gemstone Origin</label>
              <Input
                placeholder="e.g. South Africa"
                value={formValues.gemstoneOrigin}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, gemstoneOrigin: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 mt-4 pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={addUpdateLoading}
            >
              {addUpdateLoading ? (
                <SmallSpinner />
              ) : formType === "add" ? (
                "Create"
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
