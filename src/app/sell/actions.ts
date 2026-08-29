"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { categories, conditions } from "@/data/listings";
import { createClient } from "../../../utils/supabase/server";

const LISTING_IMAGES_BUCKET = "listing-images";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const SUCCESS_REDIRECT_PATH = "/browse?status=listing-created";
const PRICE_PATTERN = /^\d+(?:\.\d{1,2})?$/;

const allowedImageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type ListingFormValues = {
  title: string;
  price: string;
  category: string;
  size: string;
  condition: string;
  location: string;
  description: string;
  flaws: string;
};

export type ListingFieldErrors = Partial<
  Record<keyof ListingFormValues | "image", string>
>;

export type CreateListingState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: ListingFieldErrors;
  values: ListingFormValues;
};

type ValidatedListingInput = {
  values: ListingFormValues;
  title: string;
  price: number;
  category: string;
  size: string | null;
  condition: string;
  location: string;
  description: string;
  flaws: string | null;
  image: File;
  imageExtension: (typeof allowedImageTypes)[keyof typeof allowedImageTypes];
};

function getFormValue(formData: FormData, key: keyof ListingFormValues) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getFormValues(formData: FormData): ListingFormValues {
  return {
    title: getFormValue(formData, "title"),
    price: getFormValue(formData, "price"),
    category: getFormValue(formData, "category"),
    size: getFormValue(formData, "size"),
    condition: getFormValue(formData, "condition"),
    location: getFormValue(formData, "location"),
    description: getFormValue(formData, "description"),
    flaws: getFormValue(formData, "flaws"),
  };
}

function errorState(
  message: string,
  values: ListingFormValues,
  fieldErrors?: ListingFieldErrors,
): CreateListingState {
  return {
    status: "error",
    message,
    fieldErrors,
    values,
  };
}

function getSubmittedImage(formData: FormData) {
  const value = formData.get("image");

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

function hasFieldErrors(fieldErrors: ListingFieldErrors) {
  return Object.values(fieldErrors).some(Boolean);
}

async function getVerifiedImageExtension(image: File) {
  const imageExtension =
    allowedImageTypes[image.type as keyof typeof allowedImageTypes];

  if (!imageExtension) {
    return null;
  }

  const bytes = new Uint8Array(await image.slice(0, 12).arrayBuffer());
  const isJpeg =
    bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  const isWebp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;

  if (
    (imageExtension === "jpg" && isJpeg) ||
    (imageExtension === "png" && isPng) ||
    (imageExtension === "webp" && isWebp)
  ) {
    return imageExtension;
  }

  return null;
}

async function validateListingInput(formData: FormData): Promise<
  | { success: true; data: ValidatedListingInput }
  | {
      success: false;
      values: ListingFormValues;
      fieldErrors: ListingFieldErrors;
    }
> {
  const values = getFormValues(formData);
  const trimmedValues = {
    title: values.title.trim(),
    price: values.price.trim(),
    category: values.category.trim(),
    size: values.size.trim(),
    condition: values.condition.trim(),
    location: values.location.trim(),
    description: values.description.trim(),
    flaws: values.flaws.trim(),
  };
  const fieldErrors: ListingFieldErrors = {};

  if (!trimmedValues.title) {
    fieldErrors.title = "Add a title for your item.";
  }

  if (!trimmedValues.category) {
    fieldErrors.category = "Choose a category.";
  } else if (!categories.includes(trimmedValues.category)) {
    fieldErrors.category = "Choose a valid category.";
  }

  if (!trimmedValues.size) {
    fieldErrors.size = "Add the item size.";
  }

  if (!trimmedValues.condition) {
    fieldErrors.condition = "Choose the item condition.";
  } else if (!conditions.includes(trimmedValues.condition)) {
    fieldErrors.condition = "Choose a valid condition.";
  }

  if (!trimmedValues.location) {
    fieldErrors.location = "Add a location.";
  }

  if (!trimmedValues.description) {
    fieldErrors.description = "Add a description.";
  } else if (trimmedValues.description.length > 500) {
    fieldErrors.description = "Keep the description to 500 characters or less.";
  }

  const price = Number(trimmedValues.price);
  if (!trimmedValues.price) {
    fieldErrors.price = "Add a price greater than 0.";
  } else if (
    !PRICE_PATTERN.test(trimmedValues.price) ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    fieldErrors.price = "Enter a valid price greater than 0.";
  }

  const image = getSubmittedImage(formData);
  let imageExtension:
    | (typeof allowedImageTypes)[keyof typeof allowedImageTypes]
    | null = null;

  if (!image) {
    fieldErrors.image = "Add one listing photo.";
  } else if (!allowedImageTypes[image.type as keyof typeof allowedImageTypes]) {
    fieldErrors.image = "Upload a JPEG, PNG, or WebP image.";
  } else if (image.size > MAX_IMAGE_SIZE_BYTES) {
    fieldErrors.image = "Upload an image that is 5 MB or smaller.";
  } else {
    imageExtension = await getVerifiedImageExtension(image);

    if (!imageExtension) {
      fieldErrors.image = "Upload a valid JPEG, PNG, or WebP image.";
    }
  }

  if (hasFieldErrors(fieldErrors) || !image || !imageExtension) {
    return { success: false, values, fieldErrors };
  }

  return {
    success: true,
    data: {
      values,
      title: trimmedValues.title,
      price,
      category: trimmedValues.category,
      size: trimmedValues.size || null,
      condition: trimmedValues.condition,
      location: trimmedValues.location,
      description: trimmedValues.description,
      flaws: trimmedValues.flaws || null,
      image,
      imageExtension,
    },
  };
}

export async function createListing(
  _previousState: CreateListingState,
  formData: FormData,
): Promise<CreateListingState> {
  const submittedValues = getFormValues(formData);
  let supabase: Awaited<ReturnType<typeof createClient>>;

  try {
    supabase = await createClient();
  } catch {
    return errorState(
      "Listing creation is unavailable right now.",
      submittedValues,
    );
  }

  const authResult = await supabase.auth.getUser().catch(() => null);

  if (!authResult) {
    return errorState(
      "Listing creation is unavailable right now.",
      submittedValues,
    );
  }

  if (authResult.error || !authResult.data.user) {
    redirect("/login?next=/sell");
  }

  const userId = authResult.data.user.id;
  const validation = await validateListingInput(formData);

  if (!validation.success) {
    return errorState(
      "Check the highlighted fields.",
      validation.values,
      validation.fieldErrors,
    );
  }

  const storagePath = `${userId}/${randomUUID()}.${validation.data.imageExtension}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from(LISTING_IMAGES_BUCKET)
      .upload(storagePath, validation.data.image, {
        contentType: validation.data.image.type,
        upsert: false,
      });

    if (uploadError) {
      return errorState(
        "We could not upload that photo. Check the file and try again.",
        submittedValues,
        { image: "We could not upload that photo." },
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from(LISTING_IMAGES_BUCKET)
      .getPublicUrl(storagePath);

    const imageUrl = publicUrlData.publicUrl;

    if (!imageUrl) {
      await supabase.storage.from(LISTING_IMAGES_BUCKET).remove([storagePath]);
      return errorState(
        "We could not publish the listing right now.",
        submittedValues,
      );
    }

    const { error: insertError } = await supabase.from("listings").insert({
      title: validation.data.title,
      category: validation.data.category,
      size: validation.data.size,
      condition: validation.data.condition,
      price: validation.data.price,
      location: validation.data.location,
      description: validation.data.description,
      flaws: validation.data.flaws,
      status: "available",
      seller_id: userId,
      image_url: imageUrl,
    });

    if (insertError) {
      await supabase.storage.from(LISTING_IMAGES_BUCKET).remove([storagePath]);
      return errorState(
        "We could not publish the listing right now. Please try again.",
        submittedValues,
      );
    }
  } catch {
    return errorState(
      "We could not publish the listing right now. Please try again.",
      submittedValues,
    );
  }

  revalidatePath("/");
  revalidatePath("/browse");
  redirect(SUCCESS_REDIRECT_PATH);
}
