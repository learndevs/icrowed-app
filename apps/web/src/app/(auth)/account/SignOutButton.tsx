"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";
import { customerSignOut } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await customerSignOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="outline" className="w-full gap-2" onClick={handleSignOut}>
      <LogOut className="w-4 h-4" />
      Sign Out
    </Button>
  );
}
