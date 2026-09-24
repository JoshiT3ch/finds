"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { categories, conditions } from "@/data/listings";
import { isDepartment } from "../../../utils/listings/departments";
import { createClient } from "../../../utils/supabase/server";

const LISTING_IMAGES_BUCKET = "listing-images";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_LISTING_IMAGES = 5;
const MAX_TOTAL_IMAGE_SIZE_BYTES =
  MAX_LISTING_IMAGES * MAX_IMAGE_SIZE_BYTES;
const SUCCESS_REDIRECT_PATH = "/browse?status=listing-created";
const PRICE_PATTERN = /^\d+(?:\.\d{1,2})?$/;

const allowedImageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type ListingFormValues = {
  department: string;
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
  department: string;
  values: ListingFormValues;
  title: string;
  price: number;
  category: string;
  size: string | null;
  condition: string;
  location: string;
  description: string;
  flaws: string | null;
  images: Array<{
    file: File;
    extension: (typeof allowedImageTypes)[keyof typeof allowedImageTypes];
  }>;
  coverImageIndex: number;
};

function getFormValue(formData: FormData, key: keyof ListingFormValues) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getFormValues(formData: FormData): ListingFormValues {
  return {
    department: getFormValue(formData, "department"),
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

function getSubmittedImages(formData: FormData) {
  return formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function getCoverImageIndex(formData: FormData, imageCount: number) {
  const value = formData.get("coverImageIndex");
  const parsedValue = typeof value === "string" ? Number(value) : 0;

  return Number.isInteger(parsedValue) && parsedValue >= 0 && parsedValue < imageCount
    ? parsedValue
    : 0;
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
    department: values.department.trim(),
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

  if (!isDepartment(trimmedValues.department)) {
    fieldErrors.department = "Choose Men, Women, or Kids.";
  }

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

  const submittedImages = getSubmittedImages(formData);
  const validatedImages: ValidatedListingInput["images"] = [];

  if (submittedImages.length === 0) {
    fieldErrors.image = "Add one listing photo.";
  } else if (submittedImages.length > MAX_LISTING_IMAGES) {
    fieldErrors.image = `Upload up to ${MAX_LISTING_IMAGES} listing photos.`;
  } else if (
    submittedImages.reduce((total, image) => total + image.size, 0) >
    MAX_TOTAL_IMAGE_SIZE_BYTES
  ) {
    fieldErrors.image = "Keep each image at 5 MB or smaller.";
  } else {
    for (const image of submittedImages) {
      if (!allowedImageTypes[image.type as keyof typeof allowedImageTypes]) {
        fieldErrors.image = "Upload only JPEG, PNG, or WebP images.";
        break;
      }

      if (image.size > MAX_IMAGE_SIZE_BYTES) {
        fieldErrors.image = "Keep each image at 5 MB or smaller.";
        break;
      }

      const extension = await getVerifiedImageExtension(image);

      if (!extension) {
        fieldErrors.image = "Upload only valid JPEG, PNG, or WebP images.";
        break;
      }

      validatedImages.push({ file: image, extension });
    }
  }

  if (
    hasFieldErrors(fieldErrors) ||
    validatedImages.length !== submittedImages.length
  ) {
    return { success: false, values, fieldErrors };
  }

  return {
    success: true,
    data: {
      department: trimmedValues.department,
      values,
      title: trimmedValues.title,
      price,
      category: trimmedValues.category,
      size: trimmedValues.size || null,
      condition: trimmedValues.condition,
      location: trimmedValues.location,
      description: trimmedValues.description,
      flaws: trimmedValues.flaws || null,
      images: validatedImages,
      coverImageIndex: getCoverImageIndex(formData, validatedImages.length),
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

  const storagePaths: string[] = [];
  const imageUrls: string[] = [];

  try {
    for (const image of validation.data.images) {
      const storagePath = `${userId}/${randomUUID()}.${image.extension}`;
      const { error: uploadError } = await supabase.storage
        .from(LISTING_IMAGES_BUCKET)
        .upload(storagePath, image.file, {
          contentType: image.file.type,
          upsert: false,
        });

      if (uploadError) {
        if (storagePaths.length > 0) {
          await supabase.storage
            .from(LISTING_IMAGES_BUCKET)
            .remove(storagePaths);
        }
        return errorState(
          "We could not upload those photos. Check the files and try again.",
          submittedValues,
          { image: "We could not upload those photos." },
        );
      }

      storagePaths.push(storagePath);
      const { data: publicUrlData } = supabase.storage
        .from(LISTING_IMAGES_BUCKET)
        .getPublicUrl(storagePath);

      if (!publicUrlData.publicUrl) {
        await supabase.storage
          .from(LISTING_IMAGES_BUCKET)
          .remove(storagePaths);
        return errorState(
          "We could not publish the listing right now.",
          submittedValues,
        );
      }

      imageUrls.push(publicUrlData.publicUrl);
    }

    const coverImageUrl = imageUrls[validation.data.coverImageIndex];
    const orderedImageUrls = [
      coverImageUrl,
      ...imageUrls.filter(
        (_imageUrl, index) => index !== validation.data.coverImageIndex,
      ),
    ];

    const { error: insertError } = await supabase.from("listings").insert({
      department: validation.data.department,
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
      image_url: coverImageUrl,
      image_urls: orderedImageUrls,
    });

    if (insertError) {
      await supabase.storage.from(LISTING_IMAGES_BUCKET).remove(storagePaths);
      return errorState(
        "We could not publish the listing right now. Please try again.",
        submittedValues,
      );
    }
  } catch {
    if (storagePaths.length > 0) {
      await supabase.storage
        .from(LISTING_IMAGES_BUCKET)
        .remove(storagePaths)
        .catch(() => undefined);
    }
    return errorState(
      "We could not publish the listing right now. Please try again.",
      submittedValues,
    );
  }

  revalidatePath("/");
  revalidatePath("/browse");
  redirect(SUCCESS_REDIRECT_PATH);
}
