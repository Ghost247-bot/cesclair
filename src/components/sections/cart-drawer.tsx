"use client";

import Image from 'next/image';
import Link from 'next/link';
import { X, ArrowRight, Info } from 'lucide-react';

export default function CartDrawer() {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      <aside className="absolute top-0 right-0 h-full w-full max-w-[440px] bg-white text-primary-text shadow-xl flex flex-col">
        <div className="border-b border-border">
          <div className="px-6 pt-4 pb-3">
            <p className="text-center text-[13px] text-secondary-text mb-1.5">
              <span className="font-medium text-primary-text">$125.00</span> away from free standard shipping
            </p>
            <div className="w-full bg-[#f8f6f4] h-1 rounded-full overflow-hidden">
              <div className="h-full bg-green-800" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center px-6 py-4">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.08em]">Your Bag (0)</h2>
          <button aria-label="Close cart" className="p-1">
            <X className="h-5 w-5 text-primary-text" />
          </button>
        </div>

        <div className="flex-grow flex flex-col items-center pt-8 pb-12 px-6 overflow-y-auto">
          <div className="w-full flex flex-col items-center text-center">
            <div className="relative w-[352px] h-[440px]">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/Empty_Bag_State_Image-1.jpg"
                alt="Your cart is empty"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-medium mt-[-60px] relative z-10 bg-white px-2">
              Your bag is empty.
              <br />
              Not sure where to start?
            </h3>
            <div className="mt-8 flex flex-col items-center space-y-4">
              <Link href="/collections/womens-new-arrivals" className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.05em] text-primary-text hover:text-link-hover">
                <ArrowRight className="h-3 w-3" />
                Shop New Arrivals
              </Link>
              <Link href="/collections/womens-best-sellers" className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.05em] text-primary-text hover:text-link-hover">
                <ArrowRight className="h-3 w-3" />
                Shop Best Sellers
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-auto px-6 pt-4 pb-6 border-t border-border bg-white">
          <div className="py-3.5">
            <div className="flex items-center">
              <button className="flex-grow text-left">
                <div className="flex items-center">
                  <span className="text-[13px] text-primary-text font-medium">PackageProtect with </span>
                  <span className="text-[13px] text-primary-text mx-1">by</span>
                  <span className="font-semibold text-[13px]">Onward</span>
                  <Info className="ml-1.5 h-[13px] w-[13px] text-gray-700" />
                </div>
                <p className="text-[11px] text-gray-500 mt-1 font-light text-left">
                  Protect your package, earn cashback, and more.
                </p>
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center py-4">
            <h3 className="text-lg font-bold">SUBTOTAL</h3>
            <p className="text-lg font-bold">$0.00</p>
          </div>

          <button className="w-full bg-primary text-primary-foreground uppercase text-[13px] font-medium tracking-[0.05em] py-4 rounded-[2px] hover:bg-gray-800 transition-colors">
            Continue to Checkout
          </button>
        </div>
      </aside>
    </div>
  );
}