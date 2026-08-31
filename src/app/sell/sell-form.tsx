"use client";

import React, {
  type FormEvent,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { categories, conditions } from "@/data/listings";
import {
  createListing,
  type CreateListingState,
  type ListingFieldErrors,
  type ListingFormValues,
} from "./actions";

const initialDraft: ListingFormValues = {
  title: "",
  price: "",
  category: "",
  size: "",
  condition: "",
  location: "",
  description: "",
  flaws: "",
};

const initialState: CreateListingState = {
  status: "idle",
  message: "",
  values: initialDraft,
};

const inputClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const PRICE_PATTERN = /^\d+(?:\.\d{1,2})?$/;

type FieldName = keyof ListingFormValues;
type FormErrors = ListingFieldErrors;

function validateDraft(
  draft: ListingFormValues,
  image: File | null,
): FormErrors {
  const errors: FormErrors = {};
  const requiredFields: Array<[FieldName, string]> = [
    ["title", "Add a title for your item."],
    ["category", "Choose a category."],
    ["size", "Add the item size."],
    ["condition", "Choose the item condition."],
    ["location", "Add a location."],
    ["description", "Add a description."],
  ];

  requiredFields.forEach(([field, message]) => {
    if (!draft[field].trim()) errors[field] = message;
  });

  const price = Number(draft.price);
  const priceValue = draft.price.trim();
  if (!priceValue) {
    errors.price = "Add a price greater than 0.";
  } else if (
    !PRICE_PATTERN.test(priceValue) ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    errors.price = "Enter a valid price greater than 0.";
  }

  if (draft.category && !categories.includes(draft.category)) {
    errors.category = "Choose a valid category.";
  }

  if (draft.condition && !conditions.includes(draft.condition)) {
    errors.condition = "Choose a valid condition.";
  }

  if (!draft.description.trim()) {
    errors.description = "Add a description.";
  } else if (draft.description.trim().length > 500) {
    errors.description = "Keep the description to 500 characters or less.";
  }

  if (!image) {
    errors.image = "Add one listing photo.";
  } else if (!allowedImageTypes.includes(image.type)) {
    errors.image = "Upload a JPEG, PNG, or WebP image.";
  } else if (image.size > MAX_IMAGE_SIZE_BYTES) {
    errors.image = "Upload an image that is 5 MB or smaller.";
  }

  return errors;
}

function formatPreviewPrice(value: string) {
  const price = Number(value);

  if (!Number.isFinite(price) || price <= 0) {
    return "PHP 0";
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(price);
}

export function SellForm() {
  const [state, action, isPending] = useActionState(
    createListing,
    initialState,
  );
  const [draft, setDraft] = useState<ListingFormValues>(initialDraft);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPreview, setShowPreview] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messageId = state.message ? "sell-message" : undefined;
  const serverErrors =
    state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const visibleErrors = { ...serverErrors, ...errors };

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const getSelectedImage = () => imageInputRef.current?.files?.[0] ?? null;

  const updateField = (field: FieldName, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setShowPreview(false);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setErrors((current) => ({ ...current, image: undefined }));
    setShowPreview(false);

    if (!file) {
      setImageName("");
      setImagePreviewUrl(null);
      return;
    }

    setImageName(file.name);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const validateCurrentDraft = () => {
    const nextErrors = validateDraft(draft, getSelectedImage());
    setErrors(nextErrors);
    return nextErrors;
  };

  const handlePreview = () => {
    const nextErrors = validateCurrentDraft();
    setShowPreview(Object.keys(nextErrors).length === 0);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const nextErrors = validateCurrentDraft();

    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
      setShowPreview(false);
    }
  };

  const resetForm = () => {
    setDraft(initialDraft);
    setErrors({});
    setShowPreview(false);
    setImageName("");
    setImagePreviewUrl(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const fieldError = (field: keyof FormErrors) =>
    visibleErrors[field] ? (
      <p
        id={`${field}-error`}
        className="mt-1 text-sm text-red-600"
        role="alert"
      >
        {visibleErrors[field]}
      </p>
    ) : null;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
      <form
        action={action}
        onSubmit={handleSubmit}
        noValidate
        aria-describedby={messageId}
        className="rounded-lg border border-gray-200 bg-gray-50 p-5 sm:p-8"
      >
        {state.message ? (
          <div
            id={messageId}
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {state.message}
          </div>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Item title <span aria-hidden="true">*</span>
            </label>
            <input
              id="title"
              name="title"
              value={draft.title}
              onChange={(event) => updateField("title", event.target.value)}
              disabled={isPending}
              className={inputClassName}
              placeholder="e.g. Vintage denim jacket"
              aria-required="true"
              aria-invalid={Boolean(visibleErrors.title)}
              aria-describedby={
                visibleErrors.title ? "title-error" : undefined
              }
            />
            {fieldError("title")}
          </div>

          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Price (&#8369;) <span aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-3 text-gray-500">
                &#8369;
              </span>
              <input
                id="price"
                name="price"
                type="number"
                min="1"
                step="0.01"
                value={draft.price}
                onChange={(event) => updateField("price", event.target.value)}
                disabled={isPending}
                className={`${inputClassName} pl-9`}
                placeholder="1200"
                aria-required="true"
                aria-invalid={Boolean(visibleErrors.price)}
                aria-describedby={
                  visibleErrors.price ? "price-error" : undefined
                }
              />
            </div>
            {fieldError("price")}
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Category <span aria-hidden="true">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={draft.category}
              onChange={(event) => updateField("category", event.target.value)}
              disabled={isPending}
              className={inputClassName}
              aria-required="true"
              aria-invalid={Boolean(visibleErrors.category)}
              aria-describedby={
                visibleErrors.category ? "category-error" : undefined
              }
            >
              <option value="">Choose a category</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            {fieldError("category")}
          </div>

          <div>
            <label
              htmlFor="size"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Size <span aria-hidden="true">*</span>
            </label>
            <input
              id="size"
              name="size"
              value={draft.size}
              onChange={(event) => updateField("size", event.target.value)}
              disabled={isPending}
              className={inputClassName}
              placeholder="e.g. M, 30, or One Size"
              aria-required="true"
              aria-invalid={Boolean(visibleErrors.size)}
              aria-describedby={visibleErrors.size ? "size-error" : undefined}
            />
            {fieldError("size")}
          </div>

          <div>
            <label
              htmlFor="condition"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Condition <span aria-hidden="true">*</span>
            </label>
            <select
              id="condition"
              name="condition"
              value={draft.condition}
              onChange={(event) => updateField("condition", event.target.value)}
              disabled={isPending}
              className={inputClassName}
              aria-required="true"
              aria-invalid={Boolean(visibleErrors.condition)}
              aria-describedby={
                visibleErrors.condition ? "condition-error" : undefined
              }
            >
              <option value="">Choose a condition</option>
              {conditions.map((condition) => (
                <option key={condition}>{condition}</option>
              ))}
            </select>
            {fieldError("condition")}
          </div>

          <div>
            <label
              htmlFor="location"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Location <span aria-hidden="true">*</span>
            </label>
            <input
              id="location"
              name="location"
              value={draft.location}
              onChange={(event) => updateField("location", event.target.value)}
              disabled={isPending}
              className={inputClassName}
              placeholder="e.g. Manila, Metro Manila"
              aria-required="true"
              aria-invalid={Boolean(visibleErrors.location)}
              aria-describedby={
                visibleErrors.location ? "location-error" : undefined
              }
            />
            {fieldError("location")}
          </div>

          <div>
            <label
              htmlFor="flaws"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Flaws <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <input
              id="flaws"
              name="flaws"
              value={draft.flaws}
              onChange={(event) => updateField("flaws", event.target.value)}
              disabled={isPending}
              className={inputClassName}
              placeholder="e.g. Small mark near cuff"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Description <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              maxLength={500}
              value={draft.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              disabled={isPending}
              className={inputClassName}
              placeholder="Share details about the fit, wear, and anything buyers should know."
              aria-required="true"
              aria-invalid={Boolean(visibleErrors.description)}
              aria-describedby={
                visibleErrors.description
                  ? "description-error"
                  : "description-count"
              }
            />
            <div className="mt-1 flex justify-between gap-4">
              {fieldError("description") || <span />}
              <span id="description-count" className="text-sm text-gray-500">
                {draft.description.length}/500
              </span>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="image"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Photo <span aria-hidden="true">*</span>
            </label>
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 text-center">
              <input
                ref={imageInputRef}
                id="image"
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                onChange={handleImageChange}
                disabled={isPending}
                className="mx-auto block w-full max-w-sm cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-gray-900 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
                aria-required="true"
                aria-invalid={Boolean(visibleErrors.image)}
                aria-describedby={
                  visibleErrors.image ? "image-error" : "image-requirements"
                }
              />
              <p id="image-requirements" className="mt-3 text-sm text-gray-500">
                JPEG, PNG, or WebP up to 5 MB.
              </p>
              {imageName ? (
                <p className="mt-2 text-sm font-medium text-gray-700">
                  Selected: {imageName}
                </p>
              ) : null}
              {fieldError("image")}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={resetForm}
            disabled={isPending}
            className="rounded-lg border-2 border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Clear form
          </button>
          <button
            type="button"
            onClick={handlePreview}
            disabled={isPending}
            className="rounded-lg border-2 border-gray-900 px-5 py-3 font-semibold text-gray-900 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Preview listing
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isPending ? "Publishing..." : "List Item"}
          </button>
        </div>
      </form>

      <aside aria-live="polite" className="lg:sticky lg:top-6 lg:self-start">
        {showPreview ? (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex h-64 items-center justify-center overflow-hidden bg-gray-100 sm:h-80">
              {imagePreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreviewUrl}
                  alt="Selected listing preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-sm font-medium text-gray-500">
                  Photo preview
                </div>
              )}
            </div>
            <div className="p-6">
              <span className="inline-block rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                {draft.category}
              </span>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                {draft.title}
              </h2>
              <p className="mt-4 text-3xl font-bold text-gray-900">
                {formatPreviewPrice(draft.price)}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4 border-y border-gray-200 py-4 text-sm">
                <div>
                  <p className="text-gray-500">Size</p>
                  <p className="font-medium text-gray-900">{draft.size}</p>
                </div>
                <div>
                  <p className="text-gray-500">Condition</p>
                  <p className="font-medium text-gray-900">
                    {draft.condition}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{draft.location}</p>
                </div>
              </div>
              <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-gray-700">
                Description
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {draft.description}
              </p>
              {draft.flaws.trim() ? (
                <>
                  <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-gray-700">
                    Flaws
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {draft.flaws}
                  </p>
                </>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-gray-600">
            <h2 className="text-xl font-bold text-gray-900">
              Your listing preview
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              Complete the required fields, then select Preview listing to see
              how your item will appear on Finds.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
