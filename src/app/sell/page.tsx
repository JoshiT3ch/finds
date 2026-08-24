'use client';

import React, { FormEvent, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { categories, conditions } from '@/data/listings';

type DraftListing = {
  title: string;
  price: string;
  category: string;
  size: string;
  condition: string;
  location: string;
  description: string;
  brand: string;
};

type FieldName = keyof DraftListing;
type FormErrors = Partial<Record<FieldName, string>>;

const initialDraft: DraftListing = {
  title: '',
  price: '',
  category: '',
  size: '',
  condition: '',
  location: '',
  description: '',
  brand: '',
};

const inputClassName =
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200';

function validateDraft(draft: DraftListing): FormErrors {
  const errors: FormErrors = {};
  const requiredFields: Array<[FieldName, string]> = [
    ['title', 'Add a title for your item.'],
    ['category', 'Choose a category.'],
    ['size', 'Add the item size.'],
    ['condition', 'Choose the item condition.'],
    ['location', 'Add a location.'],
    ['description', 'Add a description.'],
  ];

  requiredFields.forEach(([field, message]) => {
    if (!draft[field].trim()) errors[field] = message;
  });

  const price = Number(draft.price);
  if (!draft.price.trim()) {
    errors.price = 'Add a price greater than ₱0.';
  } else if (!Number.isFinite(price) || price <= 0) {
    errors.price = 'Enter a valid price greater than ₱0.';
  }

  if (draft.category && !categories.includes(draft.category)) {
    errors.category = 'Choose a valid category.';
  }

  if (draft.condition && !conditions.includes(draft.condition)) {
    errors.condition = 'Choose a valid condition.';
  }

  return errors;
}

export default function SellPage() {
  const [draft, setDraft] = useState<DraftListing>(initialDraft);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPreview, setShowPreview] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: FieldName, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitted(false);
  };

  const handlePreview = () => {
    const nextErrors = validateDraft(draft);
    setErrors(nextErrors);
    setShowPreview(Object.keys(nextErrors).length === 0);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateDraft(draft);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setSubmitted(true);
      setShowPreview(true);
    }
  };

  const resetForm = () => {
    setDraft(initialDraft);
    setErrors({});
    setShowPreview(false);
    setSubmitted(false);
  };

  const fieldError = (field: FieldName) =>
    errors[field] ? (
      <p id={`${field}-error`} className="mt-1 text-sm text-red-600" role="alert">
        {errors[field]}
      </p>
    ) : null;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Sell your find</h1>
          <p className="text-gray-600">
            Give a pre-loved piece a new home. Add the details below to prepare your Finds listing.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
          <form onSubmit={handleSubmit} noValidate className="rounded-lg border border-gray-200 bg-gray-50 p-5 sm:p-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
                  Item title <span aria-hidden="true">*</span>
                </label>
                <input
                  id="title"
                  value={draft.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  className={inputClassName}
                  placeholder="e.g. Vintage denim jacket"
                  aria-required="true"
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={errors.title ? 'title-error' : undefined}
                />
                {fieldError('title')}
              </div>

              <div>
                <label htmlFor="price" className="mb-2 block text-sm font-medium text-gray-700">
                  Price (₱) <span aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-3 text-gray-500">₱</span>
                  <input
                    id="price"
                    type="number"
                    min="1"
                    step="1"
                    value={draft.price}
                    onChange={(event) => updateField('price', event.target.value)}
                    className={`${inputClassName} pl-9`}
                    placeholder="1200"
                    aria-required="true"
                    aria-invalid={Boolean(errors.price)}
                    aria-describedby={errors.price ? 'price-error' : undefined}
                  />
                </div>
                {fieldError('price')}
              </div>

              <div>
                <label htmlFor="category" className="mb-2 block text-sm font-medium text-gray-700">
                  Category <span aria-hidden="true">*</span>
                </label>
                <select
                  id="category"
                  value={draft.category}
                  onChange={(event) => updateField('category', event.target.value)}
                  className={inputClassName}
                  aria-required="true"
                  aria-invalid={Boolean(errors.category)}
                  aria-describedby={errors.category ? 'category-error' : undefined}
                >
                  <option value="">Choose a category</option>
                  {categories.map((category) => <option key={category}>{category}</option>)}
                </select>
                {fieldError('category')}
              </div>

              <div>
                <label htmlFor="size" className="mb-2 block text-sm font-medium text-gray-700">
                  Size <span aria-hidden="true">*</span>
                </label>
                <input
                  id="size"
                  value={draft.size}
                  onChange={(event) => updateField('size', event.target.value)}
                  className={inputClassName}
                  placeholder="e.g. M, 30, or One Size"
                  aria-required="true"
                  aria-invalid={Boolean(errors.size)}
                  aria-describedby={errors.size ? 'size-error' : undefined}
                />
                {fieldError('size')}
              </div>

              <div>
                <label htmlFor="condition" className="mb-2 block text-sm font-medium text-gray-700">
                  Condition <span aria-hidden="true">*</span>
                </label>
                <select
                  id="condition"
                  value={draft.condition}
                  onChange={(event) => updateField('condition', event.target.value)}
                  className={inputClassName}
                  aria-required="true"
                  aria-invalid={Boolean(errors.condition)}
                  aria-describedby={errors.condition ? 'condition-error' : undefined}
                >
                  <option value="">Choose a condition</option>
                  {conditions.map((condition) => <option key={condition}>{condition}</option>)}
                </select>
                {fieldError('condition')}
              </div>

              <div>
                <label htmlFor="location" className="mb-2 block text-sm font-medium text-gray-700">
                  Location <span aria-hidden="true">*</span>
                </label>
                <input
                  id="location"
                  value={draft.location}
                  onChange={(event) => updateField('location', event.target.value)}
                  className={inputClassName}
                  placeholder="e.g. Manila, Metro Manila"
                  aria-required="true"
                  aria-invalid={Boolean(errors.location)}
                  aria-describedby={errors.location ? 'location-error' : undefined}
                />
                {fieldError('location')}
              </div>

              <div>
                <label htmlFor="brand" className="mb-2 block text-sm font-medium text-gray-700">
                  Brand <span className="font-normal text-gray-500">(optional)</span>
                </label>
                <input
                  id="brand"
                  value={draft.brand}
                  onChange={(event) => updateField('brand', event.target.value)}
                  className={inputClassName}
                  placeholder="e.g. Levi's"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
                  Description <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="description"
                  rows={5}
                  maxLength={500}
                  value={draft.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  className={inputClassName}
                  placeholder="Share details about the fit, wear, and anything buyers should know."
                  aria-required="true"
                  aria-invalid={Boolean(errors.description)}
                  aria-describedby={errors.description ? 'description-error' : 'description-count'}
                />
                <div className="mt-1 flex justify-between gap-4">
                  {fieldError('description') || <span />}
                  <span id="description-count" className="text-sm text-gray-500">{draft.description.length}/500</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <p className="mb-2 text-sm font-medium text-gray-700">Photos</p>
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 text-center">
                  <p className="font-medium text-gray-900">Photo uploads are coming soon</p>
                  <p className="mt-1 text-sm text-gray-500">For now, this demo uses a simple image placeholder in the preview.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={resetForm} className="rounded-lg border-2 border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-white focus:outline-none focus:ring-2 focus:ring-gray-400">
                Clear form
              </button>
              <button type="button" onClick={handlePreview} className="rounded-lg border-2 border-gray-900 px-5 py-3 font-semibold text-gray-900 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-gray-400">
                Preview listing
              </button>
              <button type="submit" className="rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400">
                List Item
              </button>
            </div>

            {submitted && (
              <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800" role="status">
                Your listing is ready. Account and database publishing will be connected in a later stage.
              </div>
            )}
          </form>

          <aside aria-live="polite" className="lg:sticky lg:top-6 lg:self-start">
            {showPreview ? (
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="bg-gray-100 p-10 text-center text-7xl" aria-label="Image placeholder">🧥</div>
                <div className="p-6">
                  <span className="inline-block rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">{draft.category}</span>
                  <h2 className="mt-4 text-2xl font-bold text-gray-900">{draft.title}</h2>
                  {draft.brand.trim() && <p className="mt-1 text-sm font-medium text-gray-500">{draft.brand}</p>}
                  <p className="mt-4 text-3xl font-bold text-gray-900">₱{Number(draft.price).toLocaleString()}</p>
                  <div className="mt-6 grid grid-cols-2 gap-4 border-y border-gray-200 py-4 text-sm">
                    <div><p className="text-gray-500">Size</p><p className="font-medium text-gray-900">{draft.size}</p></div>
                    <div><p className="text-gray-500">Condition</p><p className="font-medium text-gray-900">{draft.condition}</p></div>
                    <div className="col-span-2"><p className="text-gray-500">Location</p><p className="font-medium text-gray-900">{draft.location}</p></div>
                  </div>
                  <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-gray-700">Description</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{draft.description}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-gray-600">
                <h2 className="text-xl font-bold text-gray-900">Your listing preview</h2>
                <p className="mt-2 text-sm leading-relaxed">Complete the required fields, then select Preview listing to see how your item will appear on Finds.</p>
              </div>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
