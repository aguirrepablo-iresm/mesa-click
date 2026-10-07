import React from "react";
import Link from "next/link";
import Logo from "@/components/brand/Logo";

export default function RegistroBrand() {
  return (
    <Link href="/" className="auth-brand">
      <span><Logo className="w-[21px] h-[21px]" /></span>Mesa <strong>CLICK</strong>
    </Link>
  );
}
