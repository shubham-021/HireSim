"use client";
import { SignIn } from '@clerk/nextjs'
import { cn } from "@/lib/utils";

export default function Page() {
  return (
    <div className={cn("min-h-dvh flex items-center justify-center px-4 pt-24") }>
      <div className={cn("w-full max-w-md rounded-2xl border bg-card/60 backdrop-blur p-6 shadow-lg") }>
        <SignIn
          appearance={{
            elements: {
              card: "bg-transparent shadow-none border-none",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              formButtonPrimary: "bg-primary text-primary-foreground hover:opacity-90",
              formFieldInput: "bg-background",
              footerActionText: "text-muted-foreground",
              footerActionLink: "text-primary hover:underline",
            },
            layout: { socialButtonsVariant: "iconButton" }
          }}
        />
      </div>
    </div>
  )
}
