'use client'

import { LoaderCircle } from "lucide-react";

export default function CheckoutPage() {

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
