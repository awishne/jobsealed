"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ProWaitlistDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">
          Join Pro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join the Pro waitlist</DialogTitle>
          <DialogDescription>
            Pro unlocks Magic Mic and Clean up notes. Join the waitlist and
            we&apos;ll notify you when it&apos;s available.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Form and signup wiring coming in Step 2.
        </p>
      </DialogContent>
    </Dialog>
  );
}
