import { html, attrs, partial } from "../../../server/html.js";
import { categories, conditions } from "../../data/listings.js";
import { departments, isDepartment } from "../../../utils/listings/departments.js";
const initialDraft = {
    department: "",
    title: "",
    price: "",
    category: "",
    size: "",
    condition: "",
    location: "",
    description: "",
    flaws: "",
};
const initialState = {
    status: "idle",
    message: "",
    values: initialDraft,
};
const inputClassName = "w-full rounded-lg border border-sage-300 bg-surface px-4 py-3 text-black outline-none transition focus:border-sage-900 focus:ring-2 focus:ring-sage-200";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_LISTING_IMAGES = 5;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const PRICE_PATTERN = /^\d+(?:\.\d{1,2})?$/;
function validateDraft(draft, images) {
    const errors = {};
    if (!isDepartment(draft.department)) {
        errors.department = "Choose Men, Women, or Kids.";
    }
    const requiredFields = [
        ["title", "Add a title for your item."],
        ["category", "Choose a category."],
        ["size", "Add the item size."],
        ["condition", "Choose the item condition."],
        ["location", "Add a location."],
        ["description", "Add a description."],
    ];
    requiredFields.forEach(([field, message]) => {
        if (!draft[field].trim())
            errors[field] = message;
    });
    const price = Number(draft.price);
    const priceValue = draft.price.trim();
    if (!priceValue) {
        errors.price = "Add a price greater than 0.";
    }
    else if (!PRICE_PATTERN.test(priceValue) ||
        !Number.isFinite(price) ||
        price <= 0) {
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
    }
    else if (draft.description.trim().length > 500) {
        errors.description = "Keep the description to 500 characters or less.";
    }
    if (images.length === 0) {
        errors.image = "Add one listing photo.";
    }
    else if (images.length > MAX_LISTING_IMAGES) {
        errors.image = `Upload up to ${MAX_LISTING_IMAGES} listing photos.`;
    }
    else if (images.some((image) => !allowedImageTypes.includes(image.type))) {
        errors.image = "Upload only JPEG, PNG, or WebP images.";
    }
    else if (images.some((image) => image.size > MAX_IMAGE_SIZE_BYTES)) {
        errors.image = "Keep each image at 5 MB or smaller.";
    }
    return errors;
}
function formatPreviewPrice(value) {
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
    const state = initialState;
    const action = "/actions/createListing";
    const isPending = false;
    const draft = initialDraft;
    const errors = {};
    const showPreview = false;
    const imagePreviews = [];
    const coverImageIndex = 0;
    const messageId = state.message ? "sell-message" : undefined;
    const serverErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
    const visibleErrors = { ...serverErrors, ...errors };
    const fieldError = (field) => visibleErrors[field] ? (html `
<p class="mt-1 text-sm text-black" role="alert"${attrs({ "id": `${field}-error` })}>${visibleErrors[field]}</p>`) : null;
    return (html `
<div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
<form data-sell-form="true" class="rounded-lg border border-sage-200 bg-sage-50 p-5 sm:p-8" method="post"${attrs({ "action": action, "aria-describedby": messageId })}>${state.message ? (html `
<div role="alert" class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-black"${attrs({ "id": messageId })}>${state.message}</div>`) : null}
<div class="grid gap-6 sm:grid-cols-2">
<div class="sm:col-span-2">
<label for="department" class="mb-2 block text-sm font-medium text-black">Who is it for? <span aria-hidden="true">*</span></label>
<select id="department" name="department" aria-required="true"${attrs({ "data-value": draft.department, "disabled": isPending, "className": inputClassName, "aria-invalid": Boolean(visibleErrors.department), "aria-describedby": visibleErrors.department ? "department-error" : undefined })}>
<option value="">Choose Men, Women, or Kids</option>${departments.map((department) => (html `
<option${attrs({ "value": department })}>${department}</option>`))}</select>${fieldError("department")}</div>
<div class="sm:col-span-2">
<label for="title" class="mb-2 block text-sm font-medium text-black">Item title <span aria-hidden="true">*</span></label>
<input id="title" name="title" placeholder="e.g. Vintage denim jacket" aria-required="true"${attrs({ "value": draft.title, "disabled": isPending, "className": inputClassName, "aria-invalid": Boolean(visibleErrors.title), "aria-describedby": visibleErrors.title ? "title-error" : undefined })}>${fieldError("title")}</div>
<div>
<label for="price" class="mb-2 block text-sm font-medium text-black">Price (&#8369;) <span aria-hidden="true">*</span></label>
<div class="relative"><span class="pointer-events-none absolute left-4 top-3 text-black">&#8369;</span>
<input id="price" name="price" type="number" min="1" step="0.01" placeholder="1200" aria-required="true"${attrs({ "value": draft.price, "disabled": isPending, "className": `${inputClassName} pl-9`, "aria-invalid": Boolean(visibleErrors.price), "aria-describedby": visibleErrors.price ? "price-error" : undefined })}></div>${fieldError("price")}</div>
<div>
<label for="category" class="mb-2 block text-sm font-medium text-black">Category <span aria-hidden="true">*</span></label>
<select id="category" name="category" aria-required="true"${attrs({ "data-value": draft.category, "disabled": isPending, "className": inputClassName, "aria-invalid": Boolean(visibleErrors.category), "aria-describedby": visibleErrors.category ? "category-error" : undefined })}>
<option value="">Choose a category</option>${categories.map((category) => (html `
<option>${category}</option>`))}</select>${fieldError("category")}</div>
<div>
<label for="size" class="mb-2 block text-sm font-medium text-black">Size <span aria-hidden="true">*</span></label>
<input id="size" name="size" placeholder="e.g. M, 30, or One Size" aria-required="true"${attrs({ "value": draft.size, "disabled": isPending, "className": inputClassName, "aria-invalid": Boolean(visibleErrors.size), "aria-describedby": visibleErrors.size ? "size-error" : undefined })}>${fieldError("size")}</div>
<div>
<label for="condition" class="mb-2 block text-sm font-medium text-black">Condition <span aria-hidden="true">*</span></label>
<select id="condition" name="condition" aria-required="true"${attrs({ "data-value": draft.condition, "disabled": isPending, "className": inputClassName, "aria-invalid": Boolean(visibleErrors.condition), "aria-describedby": visibleErrors.condition ? "condition-error" : undefined })}>
<option value="">Choose a condition</option>${conditions.map((condition) => (html `
<option>${condition}</option>`))}</select>${fieldError("condition")}</div>
<div>
<label for="location" class="mb-2 block text-sm font-medium text-black">Location <span aria-hidden="true">*</span></label>
<input id="location" name="location" placeholder="e.g. Manila, Metro Manila" aria-required="true"${attrs({ "value": draft.location, "disabled": isPending, "className": inputClassName, "aria-invalid": Boolean(visibleErrors.location), "aria-describedby": visibleErrors.location ? "location-error" : undefined })}>${fieldError("location")}</div>
<div>
<label for="flaws" class="mb-2 block text-sm font-medium text-black">Flaws <span class="font-normal text-black">(optional)</span></label>
<input id="flaws" name="flaws" placeholder="e.g. Small mark near cuff"${attrs({ "value": draft.flaws, "disabled": isPending, "className": inputClassName })}></div>
<div class="sm:col-span-2">
<label for="description" class="mb-2 block text-sm font-medium text-black">Description <span aria-hidden="true">*</span></label><textarea id="description" name="description" placeholder="Share details about the fit, wear, and anything buyers should know." aria-required="true"${attrs({ "rows": 5, "maxLength": 500, "disabled": isPending, "className": inputClassName, "aria-invalid": Boolean(visibleErrors.description), "aria-describedby": visibleErrors.description
            ? "description-error"
            : "description-count" })}>${draft.description}</textarea>
<div class="mt-1 flex justify-between gap-4">${fieldError("description") || html `<span></span>`}<span id="description-count" class="text-sm text-black">${draft.description.length}/500</span></div></div>
<div class="sm:col-span-2">
<label for="images" class="mb-2 block text-sm font-medium text-black">Photos <span aria-hidden="true">*</span></label>
<div class="rounded-lg border-2 border-dashed border-sage-300 bg-surface p-6 text-center">
<input id="images" name="images" type="file" accept="image/jpeg,image/png,image/webp" class="mx-auto block w-full max-w-sm cursor-pointer rounded-lg border border-sage-300 bg-surface text-sm text-black file:mr-4 file:border-0 file:bg-sage-300 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-black hover:file:bg-sage-400 disabled:cursor-not-allowed disabled:opacity-70" aria-required="true"${attrs({ "multiple": true, "required": true, "disabled": isPending, "aria-invalid": Boolean(visibleErrors.image), "aria-describedby": visibleErrors.image ? "image-error" : "image-requirements" })}>
<input type="hidden" name="coverImageIndex"${attrs({ "value": coverImageIndex })}>
<p id="image-requirements" class="mt-3 text-sm text-black">Add up to ${MAX_LISTING_IMAGES} JPEG, PNG, or WebP images. Each image can be up to 5 MB.</p>${imagePreviews.length > 0 ? (html `
<div class="mt-5">
<p class="text-sm font-medium text-black">Choose the cover photo</p>
<div class="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">${imagePreviews.map((preview, index) => (html `
<button type="button"${attrs({ "aria-pressed": coverImageIndex === index, "aria-label": `Use ${preview.name} as the cover photo`, "className": `relative aspect-square overflow-hidden rounded-md border-2 bg-sage-100 transition focus:outline-none focus:ring-2 focus:ring-sage-900 focus:ring-offset-2 ${coverImageIndex === index
            ? "border-sage-950"
            : "border-transparent hover:border-sage-400"}` })}><img alt="" class="h-full w-full object-cover"${attrs({ "src": preview.url })}>${coverImageIndex === index ? (html `<span class="absolute inset-x-1 bottom-1 rounded bg-sage-300 px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black">Cover</span>`) : null}</button>`))}</div></div>`) : null}${fieldError("image")}</div></div></div>
<div class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
<button type="button" class="rounded-lg border-2 border-sage-300 px-5 py-3 font-semibold text-black transition hover:border-sage-400 hover:bg-surface focus:outline-none focus:ring-2 focus:ring-sage-400 disabled:cursor-not-allowed disabled:opacity-60"${attrs({ "disabled": isPending, "data-clear-form": true })}>Clear form</button>
<button type="button" class="rounded-lg border-2 border-sage-900 px-5 py-3 font-semibold text-black transition hover:bg-surface focus:outline-none focus:ring-2 focus:ring-sage-400 disabled:cursor-not-allowed disabled:opacity-60"${attrs({ "disabled": isPending, "data-preview-listing": true })}>Preview listing</button>
<button type="submit" class="rounded-lg bg-sage-300 px-5 py-3 font-semibold text-black transition hover:bg-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-400 disabled:cursor-not-allowed disabled:bg-sage-400"${attrs({ "disabled": isPending })}>${isPending ? "Publishing..." : "List Item"}</button></div></form>
<aside aria-live="polite" class="lg:sticky lg:top-6 lg:self-start">${showPreview ? (html `
<div class="overflow-hidden rounded-lg border border-sage-200 bg-surface shadow-sm">
<div class="flex h-64 items-center justify-center overflow-hidden bg-sage-100 sm:h-80">${imagePreviews[coverImageIndex] ? (
    // eslint-disable-next-line @next/next/no-img-element
    html `<img alt="Selected cover preview" class="h-full w-full object-cover"${attrs({ "src": imagePreviews[coverImageIndex].url })}>`) : (html `
<div class="text-sm font-medium text-black">Photo preview</div>`)}</div>${imagePreviews.length > 1 ? (html `
<div class="flex gap-2 overflow-x-auto border-b border-sage-200 p-3">${imagePreviews.map((preview, index) => (html `
<button type="button"${attrs({ "aria-label": `Preview ${preview.name}`, "className": `h-14 w-14 flex-shrink-0 overflow-hidden rounded border-2 bg-sage-100 ${coverImageIndex === index
            ? "border-sage-950"
            : "border-transparent"}` })}><img alt="" class="h-full w-full object-cover"${attrs({ "src": preview.url })}></button>`))}</div>`) : null}
<div class="p-6"><span class="inline-block rounded-full bg-sage-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black">${draft.department} · ${draft.category}</span>
<h2 class="mt-4 text-2xl font-bold text-black">${draft.title}</h2>
<p class="mt-4 text-3xl font-bold text-black">${formatPreviewPrice(draft.price)}</p>
<div class="mt-6 grid grid-cols-2 gap-4 border-y border-sage-200 py-4 text-sm">
<div>
<p class="text-black">Size</p>
<p class="font-medium text-black">${draft.size}</p></div>
<div>
<p class="text-black">Condition</p>
<p class="font-medium text-black">${draft.condition}</p></div>
<div class="col-span-2">
<p class="text-black">Location</p>
<p class="font-medium text-black">${draft.location}</p></div></div>
<h3 class="mt-5 text-sm font-semibold uppercase tracking-wide text-black">Description</h3>
<p class="mt-2 text-sm leading-relaxed text-black">${draft.description}</p>${draft.flaws.trim() ? (html `
<h3 class="mt-5 text-sm font-semibold uppercase tracking-wide text-black">Flaws</h3>
<p class="mt-2 text-sm leading-relaxed text-black">${draft.flaws}</p>`) : null}</div></div>`) : (html `
<div class="rounded-lg border border-sage-200 bg-sage-50 p-6 text-black">
<h2 class="text-xl font-bold text-black">Your listing preview</h2>
<p class="mt-2 text-sm leading-relaxed">Complete the required fields, then select Preview listing to see how your item will appear on Finds.</p></div>`)}</aside></div>`);
}
