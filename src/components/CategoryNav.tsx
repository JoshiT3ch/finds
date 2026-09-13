"use client";

import Link from "next/link";
import { useState } from "react";
import { departments } from "../../utils/listings/departments";

type CategoryOption = {
  label: string;
  href: string;
};

type CategoryGroup = {
  id: string;
  label: string;
  browseHref: string;
  description: string;
  options: CategoryOption[];
};

const categoryGroups: CategoryGroup[] = [
  ...departments.map((department) => ({
    id: department.toLowerCase(),
    label: department,
    browseHref: `/browse?department=${department}`,
    description: `Explore pre-loved clothing, shoes, and accessories for ${department.toLowerCase()}.`,
    options: [
      { label: `All ${department}`, href: `/browse?department=${department}` },
      ...["Jackets", "Tops", "Bottoms", "Dresses", "Shoes", "Accessories"].map((category) => ({
        label: category,
        href: `/browse?department=${department}&category=${category}`,
      })),
    ],
  })),
  {
    id: "clothing",
    label: "Clothing",
    browseHref: "/browse",
    description: "Second-hand wardrobe staples for every style.",
    options: [
      { label: "Jackets & Coats", href: "/browse?category=Jackets" },
      { label: "Tops & Tees", href: "/browse?category=Tops" },
      { label: "Bottoms", href: "/browse?category=Bottoms" },
      { label: "Dresses", href: "/browse?category=Dresses" },
    ],
  },
  {
    id: "shoes",
    label: "Shoes",
    browseHref: "/browse?category=Shoes",
    description: "Pre-loved pairs ready for their next outing.",
    options: [
      { label: "All Shoes", href: "/browse?category=Shoes" },
      {
        label: "Sneakers",
        href: "/browse?category=Shoes&search=sneaker",
      },
      { label: "Boots", href: "/browse?category=Shoes&search=boot" },
      { label: "Sandals", href: "/browse?category=Shoes&search=sandal" },
    ],
  },
  {
    id: "accessories",
    label: "Accessories",
    browseHref: "/browse?category=Accessories",
    description: "Finishing touches with plenty of life left.",
    options: [
      {
        label: "All Accessories",
        href: "/browse?category=Accessories",
      },
      {
        label: "Bags",
        href: "/browse?category=Accessories&search=bag",
      },
      {
        label: "Jewelry",
        href: "/browse?category=Accessories&search=jewel",
      },
      {
        label: "Hats",
        href: "/browse?category=Accessories&search=hat",
      },
    ],
  },
];

export default function CategoryNav() {
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const openGroup = categoryGroups.find((group) => group.id === openGroupId);

  return (
    <div
      className="relative border-t border-gray-100 bg-white"
      onMouseLeave={() => setOpenGroupId(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpenGroupId(null);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpenGroupId(null);
        }
      }}
    >
      <nav
        aria-label="Browse categories"
        className="mx-auto flex max-w-7xl items-center gap-7 overflow-x-auto px-4 sm:px-6 lg:px-8"
      >
        <Link
          href="/browse"
          className="flex-shrink-0 border-b-2 border-transparent py-3 text-sm font-semibold text-gray-900 transition hover:border-gray-900"
          onMouseEnter={() => setOpenGroupId(null)}
          onFocus={() => setOpenGroupId(null)}
        >
          All Finds
        </Link>

        {categoryGroups.map((group) => {
          const isOpen = openGroupId === group.id;

          return (
            <button
              key={group.id}
              type="button"
              aria-expanded={isOpen}
              aria-controls={`category-panel-${group.id}`}
              onMouseEnter={() => setOpenGroupId(group.id)}
              onFocus={() => setOpenGroupId(group.id)}
              onClick={() => setOpenGroupId(group.id)}
              className={`flex flex-shrink-0 items-center gap-1.5 border-b-2 py-3 text-sm font-medium transition ${
                isOpen
                  ? "border-gray-900 text-gray-950"
                  : "border-transparent text-gray-600 hover:border-gray-400 hover:text-gray-950"
              }`}
            >
              {group.label}
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                aria-hidden="true"
                className={`h-3.5 w-3.5 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                <path d="m5 7.5 5 5 5-5" strokeLinecap="round" />
              </svg>
            </button>
          );
        })}
      </nav>

      {openGroup ? (
        <div
          id={`category-panel-${openGroup.id}`}
          className="absolute inset-x-0 top-full z-50 border-y border-gray-200 bg-white shadow-lg"
        >
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-7 sm:grid-cols-[minmax(0,2fr)_minmax(230px,1fr)] sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                Shop {openGroup.label}
              </p>
              <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-3">
                {openGroup.options.map((option) => (
                  <li key={option.label}>
                    <Link
                      href={option.href}
                      onClick={() => setOpenGroupId(null)}
                      className="block rounded-md px-2 py-2.5 text-sm text-gray-700 transition hover:bg-gray-100 hover:text-gray-950 focus-visible:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
                    >
                      {option.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-gray-100 p-5">
              <p className="text-sm font-semibold text-gray-950">
                Find your next favorite
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {openGroup.description}
              </p>
              <Link
                href={openGroup.browseHref}
                onClick={() => setOpenGroupId(null)}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-950 underline decoration-gray-400 underline-offset-4 hover:decoration-gray-950"
              >
                Browse all {openGroup.label.toLowerCase()}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
