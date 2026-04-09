/**
 * 3D Product Generation Widget for Medusa Admin
 * Provides UI for generating, previewing, resizing, and uploading 3D models
 * Integrates with EC2 generation service and S3 storage
 */

import React, { useRef, useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
} from "@medusajs/ui"
import { GENERATE_CONFIG, DEFAULT_PRODUCT_DIMENSIONS } from "../../lib/generate-config"

interface GenerationState {
  status: "idle" | "uploading" | "generating" | "processing" | "completed" | "error"
  progress: number
  message: string
  glbUrl?: string
  glbKey?: string
  usdzUrl?: string
  usdzKey?: string
  posterUrl?: string
  dimensions: {
    width: number
    height: number
    depth: number
    unit: string
  }
}

type DisplayUnit = "meters" | "millimeters" | "centimeters" | "inches" | "feet"
type ResizeMode = "manual" | "scale"

const UNIT_TO_MM: Record<DisplayUnit, number> = {
  millimeters: 1,
  centimeters: 10,
  inches: 25.4,
  feet: 304.8,
  meters: 1000,
}

const DISPLAY_TO_API_UNIT: Record<DisplayUnit, string> = {
  meters: "m",
  millimeters: "mm",
  centimeters: "cm",
  inches: "in",
  feet: "ft",
}

const DISPLAY_UNIT_LABEL: Record<DisplayUnit, string> = {
  meters: "m",
  millimeters: "mm",
  centimeters: "cm",
  inches: "in",
  feet: "ft",
}

interface OriginalModelState {
  glbUrl: string
  glbKey?: string
  dimensions: {
    width: number
    height: number
    depth: number
  }
  displayUnit: DisplayUnit
}

const defaultGenerationState: GenerationState = {
  status: "idle",
  progress: 0,
  message: "",
  dimensions: DEFAULT_PRODUCT_DIMENSIONS,
}

const toProxied = (urlOrKey?: string) => {
  if (!urlOrKey) return ""
  return `/admin/3d-proxy-model?url=${encodeURIComponent(urlOrKey)}`
}

const normalizeUnit = (unit?: string) => {
  const u = (unit || "").toLowerCase()
  if (["mm", "cm", "in", "ft", "m"].includes(u)) {
    return u
  }
  if (u === "meters" || u === "meter") return "m"
  if (u === "millimeters" || u === "millimeter") return "mm"
  if (u === "centimeters" || u === "centimeter") return "cm"
  if (u === "inches" || u === "inch") return "in"
  if (u === "feet" || u === "foot") return "ft"
  return "m"
}

const apiUnitToDisplay = (unit?: string): DisplayUnit => {
  const u = normalizeUnit(unit)
  if (u === "mm") return "millimeters"
  if (u === "cm") return "centimeters"
  if (u === "in") return "inches"
  if (u === "ft") return "feet"
  return "meters"
}

const convertDimension = (value: number, fromUnit: DisplayUnit, toUnit: DisplayUnit) => {
  if (!Number.isFinite(value)) return 0
  const inMm = value * UNIT_TO_MM[fromUnit]
  const converted = inMm / UNIT_TO_MM[toUnit]
  return Math.round(converted * 100) / 100
}

const ProductGenerationWidget = () => {
  const [state, setState] = useState<GenerationState>(defaultGenerationState)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showDimensions, setShowDimensions] = useState(true)
  const [dimensionUnit, setDimensionUnit] = useState<DisplayUnit>("millimeters")
  const [showGeneratorModal, setShowGeneratorModal] = useState(false)
  const [showEditProportionsModal, setShowEditProportionsModal] = useState(false)
  const [resizeMode, setResizeMode] = useState<ResizeMode>("manual")
  const [scaleValue, setScaleValue] = useState("1")
  const [isResizing, setIsResizing] = useState(false)
  const [originalModel, setOriginalModel] = useState<OriginalModelState | null>(null)
  const hasModel = Boolean(state.glbUrl)
  const isBusy = state.status === "uploading" || state.status === "processing" || isResizing

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    if (customElements.get("model-viewer")) {
      return
    }

    const existing = document.querySelector('script[data-model-viewer="1"]')
    if (existing) {
      return
    }

    const script = document.createElement("script")
    script.type = "module"
    script.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
    script.setAttribute("data-model-viewer", "1")
    script.onerror = () => {
      console.error("Failed to load model-viewer script from CDN")
    }
    document.head.appendChild(script)
  }, [])

  const resetAll = () => {
    setState(defaultGenerationState)
    setSelectedImages([])
    setDimensionUnit("millimeters")
    setShowDimensions(true)
    setResizeMode("manual")
    setScaleValue("1")
    setIsResizing(false)
    setOriginalModel(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleCancelFlow = () => {
    setShowEditProportionsModal(false)
    setShowGeneratorModal(false)
    resetAll()
  }

  const handleRegenerate = () => {
    resetAll()
    setShowGeneratorModal(true)
  }

  const handleUnitChange = (newUnit: DisplayUnit) => {
    setState((s) => ({
      ...s,
      dimensions: {
        width: convertDimension(s.dimensions.width, dimensionUnit, newUnit),
        height: convertDimension(s.dimensions.height, dimensionUnit, newUnit),
        depth: convertDimension(s.dimensions.depth, dimensionUnit, newUnit),
        unit: DISPLAY_TO_API_UNIT[newUnit],
      },
    }))
    setDimensionUnit(newUnit)
  }

  const handleResetDimensions = () => {
    if (!originalModel) {
      return
    }

    const toUnit = dimensionUnit
    const fromUnit = originalModel.displayUnit
    setState((s) => ({
      ...s,
      glbUrl: originalModel.glbUrl,
      glbKey: originalModel.glbKey,
      usdzUrl: undefined,
      usdzKey: undefined,
      dimensions: {
        width: convertDimension(originalModel.dimensions.width, fromUnit, toUnit),
        height: convertDimension(originalModel.dimensions.height, fromUnit, toUnit),
        depth: convertDimension(originalModel.dimensions.depth, fromUnit, toUnit),
        unit: DISPLAY_TO_API_UNIT[toUnit],
      },
      message: "Dimensions reset to original generated model",
      status: "completed",
    }))
    setShowEditProportionsModal(false)
  }

  const incrementScale = () => {
    const current = parseFloat(scaleValue) || 1
    setScaleValue((Math.round((current + 0.1) * 100) / 100).toString())
  }

  const decrementScale = () => {
    const current = parseFloat(scaleValue) || 1
    if (current <= 0.1) {
      return
    }
    setScaleValue((Math.round((current - 0.1) * 100) / 100).toString())
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((f) =>
        GENERATE_CONFIG.SUPPORTED_FORMATS.includes(f.type)
      )
      setSelectedImages(files)
      setState((s) => ({
        ...s,
        message: `${files.length} image(s) selected`,
      }))
    }
  }

  const handleGenerate = async () => {
    if (selectedImages.length === 0) {
      setState((s) => ({ ...s, status: "error", message: "Please select at least one image" }))
      return
    }

    setState((s) => ({
      ...s,
      status: "uploading",
      progress: 10,
      message: "Uploading images to EC2 service...",
    }))

    try {
      const formData = new FormData()
      selectedImages.forEach((img) => {
        formData.append("images", img)
      })

      const response = await fetch(GENERATE_CONFIG.API_ENDPOINTS.GENERATE, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = `Generation failed: ${response.statusText}`
        try {
          const errorBody = await response.json()
          if (errorBody?.error) {
            errorMessage = `Generation failed: ${errorBody.error}`
          }
        } catch {
          // Keep fallback status text if response isn't JSON
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      if (!data.success || !data.s3_key) {
        throw new Error(data.error || "Generation failed")
      }

      const glbUrl = data.file_url || data.model_url || data.s3_url || data.s3_key

      let nextDimensions = state.dimensions
      const backendDimensions = data.dimensions
      if (backendDimensions) {
        // ConsumAR backend reports dimensions in meters by default.
        const backendUnit = apiUnitToDisplay(backendDimensions.unit || "m")
        const toUiUnit = dimensionUnit
        nextDimensions = {
          width: convertDimension(Number(backendDimensions.width || 0), backendUnit, toUiUnit),
          height: convertDimension(Number(backendDimensions.height || 0), backendUnit, toUiUnit),
          depth: convertDimension(Number(backendDimensions.depth || 0), backendUnit, toUiUnit),
          unit: DISPLAY_TO_API_UNIT[toUiUnit],
        }
      }

      setState((s) => ({
        ...s,
        status: "completed",
        progress: 100,
        message: "Model generated successfully",
        glbUrl,
        glbKey: data.s3_key,
        posterUrl: data.poster_s3_key,
        dimensions: nextDimensions,
      }))

      if (!originalModel && glbUrl) {
        setOriginalModel({
          glbUrl,
          glbKey: data.s3_key,
          dimensions: {
            width: nextDimensions.width,
            height: nextDimensions.height,
            depth: nextDimensions.depth,
          },
          displayUnit: dimensionUnit,
        })
      }

      // Auto-convert to USDZ if user might need iOS AR
      await convertToUSDZ(data.s3_key || glbUrl)

      setState((s) => ({
        ...s,
        status: "completed",
        progress: 100,
        message: "Generation complete. Preview and files are ready.",
      }))
    } catch (error: any) {
      setState((s) => ({
        ...s,
        status: "error",
        message: `Error: ${error.message}`,
      }))
    }
  }

  const convertToUSDZ = async (glbKey: string) => {
    try {
      const response = await fetch(GENERATE_CONFIG.API_ENDPOINTS.CONVERT_USDZ, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s3_key: glbKey }),
      })

      if (response.ok) {
        const data = await response.json()
        const usdzUrl = data.file_url || data.model_url || data.s3_url || data.s3_key
        if (usdzUrl) {
          setState((s) => ({ ...s, usdzUrl, usdzKey: data.s3_key }))
        }
      }
    } catch (error) {
      console.warn("USDZ conversion skipped:", error)
    }
  }

  const handleResize = async () => {
    if (!state.glbUrl) {
      setState((s) => ({ ...s, message: "No model to resize" }))
      return
    }

    setState((s) => ({
      ...s,
      status: "processing",
      progress: 50,
      message: "Resizing model...",
    }))
    setIsResizing(true)

    try {
      let targetWidth = state.dimensions.width
      let targetHeight = state.dimensions.height
      let targetDepth = state.dimensions.depth

      if (resizeMode === "scale") {
        const scale = parseFloat(scaleValue)
        if (!Number.isFinite(scale) || scale <= 0) {
          throw new Error("Scale factor must be greater than 0")
        }
        targetWidth = Math.round(targetWidth * scale * 100) / 100
        targetHeight = Math.round(targetHeight * scale * 100) / 100
        targetDepth = Math.round(targetDepth * scale * 100) / 100
      }

      const response = await fetch(GENERATE_CONFIG.API_ENDPOINTS.RESIZE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          s3_key: state.glbKey || state.glbUrl,
          width: targetWidth,
          height: targetHeight,
          depth: targetDepth,
          unit: DISPLAY_TO_API_UNIT[dimensionUnit],
        }),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.error || "Resize failed")
      }

      const data = await response.json()
      const glbUrl = data.file_url || data.model_url || data.s3_url || data.s3_key
      setState((s) => ({
        ...s,
        status: "completed",
        progress: 100,
        glbUrl,
        glbKey: data.s3_key || s.glbKey,
        usdzUrl: undefined,
        usdzKey: undefined,
        dimensions: {
          width: targetWidth,
          height: targetHeight,
          depth: targetDepth,
          unit: DISPLAY_TO_API_UNIT[dimensionUnit],
        },
        message: "Model resized successfully",
      }))

      await convertToUSDZ(data.s3_key || glbUrl)
      setShowEditProportionsModal(false)
      setScaleValue("1")
    } catch (error: any) {
      setState((s) => ({
        ...s,
        status: "error",
        message: `Resize error: ${error.message}`,
      }))
    } finally {
      setIsResizing(false)
    }
  }

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <Heading level="h3">3D Model Generation</Heading>
        <div className="flex items-center gap-3">
          {state.status === "completed" && <span className="text-green-600">Ready</span>}
          <Button size="small" onClick={() => setShowGeneratorModal(true)}>
            Generate / Manage 3D
          </Button>
        </div>
      </div>

      <div className="p-6 text-sm text-ui-fg-subtle">
        Generate, preview, resize, and download GLB/USDZ.
      </div>

      {showGeneratorModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-xl bg-ui-bg-base shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-ui-bg-base px-6 py-4">
              <div>
                <Heading level="h2">3D Product Generator</Heading>
                <p className="mt-1 text-xs text-ui-fg-subtle">
                  Upload product images, generate model, edit proportions, then download GLB/USDZ.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="small" onClick={handleRegenerate} disabled={!hasModel || isBusy}>
                  Regenerate
                </Button>
                <Button variant="secondary" size="small" onClick={handleCancelFlow}>
                  Cancel
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-2 rounded-lg border bg-ui-bg-subtle p-3 text-xs md:grid-cols-4">
          <div className="font-medium text-ui-fg-base">1. Upload Images</div>
          <div className="font-medium text-ui-fg-base">2. Generate</div>
          <div className="font-medium text-ui-fg-base">3. Edit Proportions</div>
          <div className="font-medium text-ui-fg-base">4. Download GLB / USDZ</div>
        </div>

        {/* Image Upload Section */}
        <div className="rounded-lg border p-4">
          <Label className="mb-2 block">Upload Product Images</Label>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="block flex-1"
              disabled={state.status === "uploading" || state.status === "processing"}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={state.status === "uploading" || state.status === "processing"}
            >
              Browse
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {selectedImages.length > 0
              ? `${selectedImages.length} file(s) selected`
              : "Select valid product images (JPEG, PNG, WebP)"}
          </p>

          <div className="mt-3">
            <Button
              onClick={handleGenerate}
              disabled={selectedImages.length === 0 || state.status === "uploading" || state.status === "processing"}
              isLoading={state.status === "uploading" || state.status === "processing"}
            >
              {state.status === "uploading" || state.status === "processing" ? "Generating..." : "Generate 3D Model"}
            </Button>
          </div>
        </div>

        {/* Status Message */}
        {state.message && (
          <div
            className={`p-3 rounded text-sm ${
              state.status === "error"
                ? "bg-red-50 text-red-800"
                : state.status === "completed"
                  ? "bg-green-50 text-green-800"
                  : "bg-blue-50 text-blue-800"
            }`}
          >
            {state.message}
          </div>
        )}

        {/* Dimensions Section */}
        {state.glbUrl && (
          <div className="space-y-4 rounded-lg border p-4">
            <Heading level="h3">Model Dimensions</Heading>
            <div className="rounded border bg-ui-bg-subtle p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ui-fg-subtle">Current model dimensions</span>
                <button
                  type="button"
                  onClick={() => setShowDimensions((v) => !v)}
                  className="text-ui-fg-base underline"
                >
                  {showDimensions ? "Hide" : "Show"}
                </button>
              </div>
              {showDimensions && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div>W: {state.dimensions.width || 0} {DISPLAY_UNIT_LABEL[dimensionUnit]}</div>
                  <div>H: {state.dimensions.height || 0} {DISPLAY_UNIT_LABEL[dimensionUnit]}</div>
                  <div>D: {state.dimensions.depth || 0} {DISPLAY_UNIT_LABEL[dimensionUnit]}</div>
                </div>
              )}
            </div>

            {/* Inline 3D preview rendered in-page (ConsumAR parity) */}
            <div className="relative h-[420px] w-full overflow-hidden rounded border bg-white">
              {React.createElement("model-viewer", {
                src: toProxied(state.glbUrl),
                "ios-src": state.usdzUrl ? toProxied(state.usdzUrl) : undefined,
                alt: "3D model preview",
                "camera-controls": true,
                "touch-action": "pan-y",
                "auto-rotate": true,
                ar: true,
                "ar-modes": "webxr scene-viewer quick-look",
                "ar-scale": "fixed",
                style: {
                  width: "100%",
                  height: "100%",
                  background: "#fff",
                },
              } as any)}

              {showDimensions && (
                <div className="pointer-events-none absolute left-3 top-3 z-10 rounded bg-white/90 px-3 py-2 text-xs font-medium shadow">
                  <div>W: {state.dimensions.width || 0}{DISPLAY_UNIT_LABEL[dimensionUnit]}</div>
                  <div>H: {state.dimensions.height || 0}{DISPLAY_UNIT_LABEL[dimensionUnit]}</div>
                  <div>D: {state.dimensions.depth || 0}{DISPLAY_UNIT_LABEL[dimensionUnit]}</div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Width</Label>
                <Input
                  type="number"
                  value={state.dimensions.width}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      dimensions: { ...s.dimensions, width: Number(e.target.value) },
                    }))
                  }
                  disabled={state.status !== "completed"}
                />
              </div>
              <div>
                <Label className="mb-2 block">Height</Label>
                <Input
                  type="number"
                  value={state.dimensions.height}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      dimensions: { ...s.dimensions, height: Number(e.target.value) },
                    }))
                  }
                  disabled={state.status !== "completed"}
                />
              </div>
              <div>
                <Label className="mb-2 block">Depth</Label>
                <Input
                  type="number"
                  value={state.dimensions.depth}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      dimensions: { ...s.dimensions, depth: Number(e.target.value) },
                    }))
                  }
                  disabled={state.status !== "completed"}
                />
              </div>
              <div>
                <Label className="mb-2 block">Unit</Label>
                <select
                  value={dimensionUnit}
                  onChange={(e) => handleUnitChange(e.target.value as DisplayUnit)}
                  disabled={state.status !== "completed"}
                  className="w-full border rounded px-2 py-2"
                >
                  {(Object.keys(DISPLAY_TO_API_UNIT) as DisplayUnit[]).map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => setShowEditProportionsModal(true)}
                disabled={state.status !== "completed"}
                variant="secondary"
              >
                Edit Proportions (Advanced)
              </Button>
              <Button
                onClick={handleResize}
                disabled={state.status !== "completed" || isResizing}
              >
                {isResizing ? "Resizing..." : "Apply Dimensions"}
              </Button>
            </div>
          </div>
        )}

        {/* Preview & Download Section */}
        {state.glbUrl && (
          <div className="space-y-4 rounded-lg border p-4">
            <Heading level="h3">Assets</Heading>
            <div className="space-y-2 text-sm">
              {state.glbUrl && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>GLB Model</span>
                  <div className="flex items-center gap-3">
                    <a
                      href={toProxied(state.glbUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ui-fg-interactive underline"
                    >
                      View
                    </a>
                    <a
                      href={`${toProxied(state.glbUrl)}&download=1&filename=model.glb`}
                      className="text-ui-fg-interactive underline"
                    >
                      Download
                    </a>
                  </div>
                </div>
              )}
              {state.usdzUrl && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>USDZ Model (iOS AR)</span>
                  <div className="flex items-center gap-3">
                    <a
                      href={toProxied(state.usdzUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ui-fg-interactive underline"
                    >
                      View
                    </a>
                    <a
                      href={`${toProxied(state.usdzUrl)}&download=1&filename=model.usdz`}
                      className="text-ui-fg-interactive underline"
                    >
                      Download
                    </a>
                  </div>
                </div>
              )}
              {state.posterUrl && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>Poster Image</span>
                  <a
                    href={toProxied(state.posterUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ui-fg-interactive underline"
                  >
                    View
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button variant="secondary" onClick={handleCancelFlow}>
            Close
          </Button>
          <Button variant="secondary" onClick={handleRegenerate} disabled={!hasModel || isBusy}>
            Regenerate
          </Button>
        </div>
            </div>
          </div>
        </div>
      )}

      {showEditProportionsModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-ui-bg-base shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <Heading level="h2">Edit Proportions</Heading>
              <Button variant="secondary" size="small" onClick={() => setShowEditProportionsModal(false)}>
                Back
              </Button>
            </div>

            <div className="space-y-4 p-6">
              <div className="rounded-lg border bg-ui-bg-subtle p-3">
                <Label className="mb-2 block">Resize Mode</Label>
                <p className="mb-2 text-xs text-ui-fg-subtle">
                  Choose manual entry or a scale factor for proportional resize.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant={resizeMode === "manual" ? "primary" : "secondary"}
                    size="small"
                    onClick={() => setResizeMode("manual")}
                  >
                    Manual
                  </Button>
                  <Button
                    variant={resizeMode === "scale" ? "primary" : "secondary"}
                    size="small"
                    onClick={() => setResizeMode("scale")}
                  >
                    Scale
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="mb-2 block">Unit</Label>
                  <p className="mb-2 text-xs text-ui-fg-subtle">
                    Unit changes convert all dimensions immediately.
                  </p>
                  <select
                    value={dimensionUnit}
                    onChange={(e) => handleUnitChange(e.target.value as DisplayUnit)}
                    className="w-full rounded border px-2 py-2"
                  >
                    {(Object.keys(DISPLAY_TO_API_UNIT) as DisplayUnit[]).map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                {resizeMode === "scale" && (
                  <div>
                    <Label className="mb-2 block">Scale Factor</Label>
                    <p className="mb-2 text-xs text-ui-fg-subtle">
                      Example: 2 doubles size, 0.5 halves size.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="small" onClick={decrementScale}>-</Button>
                      <Input
                        value={scaleValue}
                        onChange={(e) => setScaleValue(e.target.value)}
                      />
                      <Button variant="secondary" size="small" onClick={incrementScale}>+</Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label className="mb-2 block">Depth</Label>
                  <Input
                    type="number"
                    value={state.dimensions.depth}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        dimensions: { ...s.dimensions, depth: Number(e.target.value) },
                      }))
                    }
                    disabled={resizeMode !== "manual"}
                  />
                  {resizeMode === "scale" && (
                    <p className="mt-1 text-xs text-ui-fg-subtle">
                      Result: {Math.round(state.dimensions.depth * (parseFloat(scaleValue) || 1) * 100) / 100}
                      {DISPLAY_UNIT_LABEL[dimensionUnit]}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block">Width</Label>
                  <Input
                    type="number"
                    value={state.dimensions.width}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        dimensions: { ...s.dimensions, width: Number(e.target.value) },
                      }))
                    }
                    disabled={resizeMode !== "manual"}
                  />
                  {resizeMode === "scale" && (
                    <p className="mt-1 text-xs text-ui-fg-subtle">
                      Result: {Math.round(state.dimensions.width * (parseFloat(scaleValue) || 1) * 100) / 100}
                      {DISPLAY_UNIT_LABEL[dimensionUnit]}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block">Height</Label>
                  <Input
                    type="number"
                    value={state.dimensions.height}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        dimensions: { ...s.dimensions, height: Number(e.target.value) },
                      }))
                    }
                    disabled={resizeMode !== "manual"}
                  />
                  {resizeMode === "scale" && (
                    <p className="mt-1 text-xs text-ui-fg-subtle">
                      Result: {Math.round(state.dimensions.height * (parseFloat(scaleValue) || 1) * 100) / 100}
                      {DISPLAY_UNIT_LABEL[dimensionUnit]}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                {originalModel && (
                  <Button variant="secondary" onClick={handleResetDimensions}>
                    Reset
                  </Button>
                )}
                <Button variant="secondary" onClick={() => setShowEditProportionsModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleResize} disabled={isResizing}>
                  {isResizing ? "Resizing..." : "Apply & Resize"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductGenerationWidget
