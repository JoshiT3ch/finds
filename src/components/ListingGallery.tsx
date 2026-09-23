"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ListingGalleryProps = {
  images: string[];
  title: string;
};

export default function ListingGallery({ images, title }: ListingGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const selectedIndexRef = useRef(0);

  const scrollViewerTo = (index: number, behavior: ScrollBehavior = "smooth") => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.scrollTo({ top: viewer.clientHeight * index, behavior });
  };

  const selectImage = (index: number) => {
    selectedIndexRef.current = index;
    setSelectedIndex(index);
    if (isViewerOpen) scrollViewerTo(index);
  };

  useEffect(() => {
    if (!isViewerOpen) return;

    const frame = requestAnimationFrame(() => {
      const viewer = viewerRef.current;
      if (viewer) {
        viewer.scrollTo({
          top: viewer.clientHeight * selectedIndexRef.current,
          behavior: "auto",
        });
      }
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsViewerOpen(false);
        return;
      }

      const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
      const backward = event.key === "ArrowUp" || event.key === "ArrowLeft";
      if (!forward && !backward) return;

      event.preventDefault();
      setSelectedIndex((currentIndex) => {
        const nextIndex = Math.min(
          images.length - 1,
          Math.max(0, currentIndex + (forward ? 1 : -1)),
        );
        selectedIndexRef.current = nextIndex;
        const viewer = viewerRef.current;
        if (viewer) {
          viewer.scrollTo({
            top: viewer.clientHeight * nextIndex,
            behavior: "smooth",
          });
        }
        return nextIndex;
      });
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [images.length, isViewerOpen]);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[72px_minmax(0,1fr)]">
        {images.length > 1 ? (
          <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
            {images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => selectImage(index)}
                aria-label={`Show photo ${index + 1} of ${images.length}`}
                aria-pressed={selectedIndex === index}
                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 bg-white transition focus:outline-none focus:ring-2 focus:ring-sage-900 focus:ring-offset-2 sm:h-[72px] sm:w-[72px] ${
                  selectedIndex === index
                    ? "border-sage-950"
                    : "border-transparent hover:border-sage-400"
                }`}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsViewerOpen(true)}
          className="group relative order-1 flex h-96 items-center justify-center overflow-hidden rounded-lg border border-sage-200 bg-white focus:outline-none focus:ring-2 focus:ring-sage-900 focus:ring-offset-2 sm:order-2 sm:h-[500px]"
          aria-label={`Open full-screen gallery for ${title}`}
        >
          <Image
            src={images[selectedIndex]}
            alt={`${title}, photo ${selectedIndex + 1} of ${images.length}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-contain"
          />
          <span className="absolute bottom-4 right-4 rounded-full bg-sage-300 px-3 py-1.5 text-xs font-semibold text-black opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
            View full screen
          </span>
        </button>
      </div>

      {isViewerOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photo gallery`}
          className="fixed inset-0 z-[100] bg-white"
        >
          <div className="pointer-events-none fixed inset-x-0 top-0 z-[102] flex items-center justify-between bg-gradient-to-b from-sage-200 to-transparent px-4 pb-12 pt-4 text-black sm:px-6">
            <p className="text-sm font-semibold" aria-live="polite">
              Photo {selectedIndex + 1} of {images.length}
            </p>
            <button
              type="button"
              onClick={() => setIsViewerOpen(false)}
              className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-sage-300 text-2xl text-black transition hover:bg-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-50"
              aria-label="Close full-screen gallery"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div
            ref={viewerRef}
            onScroll={(event) => {
              const viewer = event.currentTarget;
              if (viewer.clientHeight === 0) return;

              const index = Math.min(
                images.length - 1,
                Math.max(0, Math.round(viewer.scrollTop / viewer.clientHeight)),
              );
              selectedIndexRef.current = index;
              setSelectedIndex(index);
            }}
            className="h-full snap-y snap-mandatory overflow-y-auto overscroll-contain"
          >
            {images.map((image, index) => (
              <section
                key={`${image}-viewer`}
                className="relative flex h-screen snap-start items-center justify-center px-4 py-20 sm:px-24 lg:pr-40"
                aria-label={`Photo ${index + 1}`}
              >
                <div className="relative h-full w-full max-w-6xl">
                  <Image
                    src={image}
                    alt={`${title}, photo ${index + 1} of ${images.length}`}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    priority={index === selectedIndex}
                  />
                </div>
              </section>
            ))}
          </div>

          {images.length > 1 ? (
            <div className="fixed bottom-4 left-1/2 z-[102] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 gap-2 overflow-x-auto rounded-lg bg-sage-300 p-2 lg:bottom-auto lg:left-auto lg:right-5 lg:top-1/2 lg:max-h-[70vh] lg:max-w-none lg:-translate-y-1/2 lg:translate-x-0 lg:flex-col lg:overflow-y-auto">
              {images.map((image, index) => (
                <button
                  key={`${image}-viewer-thumbnail`}
                  type="button"
                  onClick={() => selectImage(index)}
                  aria-label={`Go to photo ${index + 1}`}
                  aria-pressed={selectedIndex === index}
                  className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded border-2 bg-white focus:outline-none focus:ring-2 focus:ring-sage-50 ${
                    selectedIndex === index
                      ? "border-sage-50"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}

          {images.length > 1 ? (
            <p className="pointer-events-none fixed bottom-4 left-5 z-[101] hidden rounded-full bg-sage-300 px-3 py-1.5 text-xs font-medium text-black sm:block lg:left-1/2 lg:-translate-x-1/2">
              Scroll or use arrow keys for the next photo
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
