"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../../utils/supabase/server";

const LISTING_IMAGES_BUCKET = "listing-images";
const LISTING_IMAGES_PUBLIC_PATH =
  "/storage/v1/object/public/listing-images/";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SUPPORTED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

type ImageStoragePathFailureReason =
  | "invalid-url"
  | "origin-mismatch"
  | "prefix-mismatch"
  | "wrong-segments"
  | "uid-mismatch"
  | "invalid-filename"
  | "unsupported-extension";

type ImageStoragePathValidation =
  | { valid: true; storagePath: string }
  | { valid: false; reason: ImageStoragePathFailureReason };

export type ListingActionState = {
  status: "idle" | "success" | "warning" | "error";
  message: string;
};

const initialErrorState: ListingActionState = {
  status: "error",
  message: "We could not update that listing. Please try again.",
};

const imageCleanupWarningState: ListingActionState = {
  status: "warning",
  message:
    "Listing deleted, but its image cleanup failed. Please contact support to remove the leftover image.",
};

function getFormText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isListingStatus(value: string): value is "available" | "sold" {
  return value === "available" || value === "sold";
}

function getSafeErrorDetails(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return { message: typeof error === "string" ? error : "Unknown error" };
  }

  const possibleStorageError = error as Record<string, unknown>;

  return {
    name:
      typeof possibleStorageError.name === "string"
        ? possibleStorageError.name
        : undefined,
    message:
      typeof possibleStorageError.message === "string"
        ? possibleStorageError.message
        : "Unknown error",
    status:
      typeof possibleStorageError.status === "number"
        ? possibleStorageError.status
        : undefined,
    statusCode:
      typeof possibleStorageError.statusCode === "string"
        ? possibleStorageError.statusCode
        : undefined,
    code:
      typeof possibleStorageError.code === "string"
        ? possibleStorageError.code
        : undefined,
  };
}

function revalidateListingPaths(listingId: string) {
  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath("/account");
  revalidatePath(`/items/${listingId}`);
}

async function getAuthenticatedSeller() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    const sellerId = data?.claims?.sub;

    if (
      error ||
      typeof sellerId !== "string" ||
      !UUID_PATTERN.test(sellerId)
    ) {
      return null;
    }

    return { supabase, sellerId };
  } catch {
    return null;
  }
}

function getOwnedImageStoragePath(
  imageUrl: string | null,
  sellerId: string,
): ImageStoragePathValidation {
  const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!imageUrl || !configuredSupabaseUrl) {
    return { valid: false, reason: "invalid-url" };
  }

  let parsedImageUrl: URL;
  let configuredSupabaseOrigin: string;

  try {
    parsedImageUrl = new URL(imageUrl);
    configuredSupabaseOrigin = new URL(configuredSupabaseUrl).origin;
  } catch {
    return { valid: false, reason: "invalid-url" };
  }

  if (parsedImageUrl.username !== "" || parsedImageUrl.password !== "") {
    return { valid: false, reason: "invalid-url" };
  }

  if (parsedImageUrl.origin !== configuredSupabaseOrigin) {
    return { valid: false, reason: "origin-mismatch" };
  }

  if (!parsedImageUrl.pathname.startsWith(LISTING_IMAGES_PUBLIC_PATH)) {
    return { valid: false, reason: "prefix-mismatch" };
  }

  const encodedStoragePath = parsedImageUrl.pathname.slice(
    LISTING_IMAGES_PUBLIC_PATH.length,
  );
  let decodedStoragePath: string;

  try {
    decodedStoragePath = decodeURIComponent(encodedStoragePath);
  } catch {
    return { valid: false, reason: "invalid-url" };
  }

  const pathSegments = decodedStoragePath.split("/");

  if (
    pathSegments.length !== 2 ||
    pathSegments.some((segment) => segment === "")
  ) {
    return { valid: false, reason: "wrong-segments" };
  }

  const [ownerId, fileName] = pathSegments;

  if (
    ownerId.includes("/") ||
    ownerId.includes("\\") ||
    fileName.includes("/") ||
    fileName.includes("\\")
  ) {
    return { valid: false, reason: "wrong-segments" };
  }

  if (!UUID_PATTERN.test(ownerId) || ownerId !== sellerId) {
    return { valid: false, reason: "uid-mismatch" };
  }

  const extensionSeparator = fileName.lastIndexOf(".");

  if (extensionSeparator <= 0 || extensionSeparator === fileName.length - 1) {
    return { valid: false, reason: "invalid-filename" };
  }

  const generatedId = fileName.slice(0, extensionSeparator);
  const extension = fileName.slice(extensionSeparator + 1).toLowerCase();

  if (!UUID_PATTERN.test(generatedId)) {
    return { valid: false, reason: "invalid-filename" };
  }

  if (!SUPPORTED_IMAGE_EXTENSIONS.has(extension)) {
    return { valid: false, reason: "unsupported-extension" };
  }

  return { valid: true, storagePath: `${ownerId}/${fileName}` };
}

export async function updateListingStatus(
  _previousState: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  const listingId = getFormText(formData, "listingId");
  const requestedStatus = getFormText(formData, "status");

  if (!UUID_PATTERN.test(listingId) || !isListingStatus(requestedStatus)) {
    return initialErrorState;
  }

  const seller = await getAuthenticatedSeller();
  if (!seller) {
    return {
      status: "error",
      message: "Your session has expired. Please log in again.",
    };
  }

  const { data, error } = await seller.supabase
    .from("listings")
    .update({ status: requestedStatus })
    .eq("id", listingId)
    .eq("seller_id", seller.sellerId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return initialErrorState;
  }

  revalidateListingPaths(listingId);

  return {
    status: "success",
    message:
      requestedStatus === "sold"
        ? "Listing marked as sold."
        : "Listing is available again.",
  };
}

export async function deleteListing(
  _previousState: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  const listingId = getFormText(formData, "listingId");
  const confirmation = getFormText(formData, "confirmation");

  if (!UUID_PATTERN.test(listingId) || confirmation !== "delete") {
    return initialErrorState;
  }

  const seller = await getAuthenticatedSeller();
  if (!seller) {
    return {
      status: "error",
      message: "Your session has expired. Please log in again.",
    };
  }

  const { data: listing, error: listingError } = await seller.supabase
    .from("listings")
    .select("image_url")
    .eq("id", listingId)
    .eq("seller_id", seller.sellerId)
    .maybeSingle();

  if (listingError || !listing) {
    return initialErrorState;
  }

  const { data: deletedListing, error: deleteError } = await seller.supabase
    .from("listings")
    .delete()
    .eq("id", listingId)
    .eq("seller_id", seller.sellerId)
    .select("id")
    .maybeSingle();

  if (deleteError || !deletedListing) {
    return {
      status: "error",
      message: "We could not delete that listing. Please try again.",
    };
  }

  let result: ListingActionState = {
    status: "success",
    message: "Listing deleted.",
  };

  try {
    const storagePathValidation = getOwnedImageStoragePath(
      listing.image_url,
      seller.sellerId,
    );

    if (!storagePathValidation.valid) {
      console.error(
        "Supabase listing image removal skipped: image URL validation failed.",
        { reason: storagePathValidation.reason },
      );
      result = imageCleanupWarningState;
    } else {
      const { error: storageError } = await seller.supabase.storage
        .from(LISTING_IMAGES_BUCKET)
        .remove([storagePathValidation.storagePath]);

      if (storageError) {
        console.error(
          "Supabase listing image removal failed.",
          getSafeErrorDetails(storageError),
        );
        result = imageCleanupWarningState;
      }
    }
  } catch (error) {
    console.error(
      "Supabase listing image removal threw unexpectedly.",
      getSafeErrorDetails(error),
    );
    result = imageCleanupWarningState;
  }

  revalidateListingPaths(listingId);

  return result;
}
