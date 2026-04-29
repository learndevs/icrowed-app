import Link from "next/link";
import { Smartphone } from "lucide-react";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--surface)] px-4 py-12">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Smartphone className="w-4 h-4 text-white" />
        </div>
        iCrowed
      </Link>
      {children}
    </div>
  );
}
