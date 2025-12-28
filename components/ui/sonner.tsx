"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      expand={false}
      duration={2500}
      toastOptions={{
        classNames: {
          toast: "group toast bg-white border-slate-200 shadow-lg rounded-lg !py-2.5 !px-3 !max-w-[280px]",
          title: "text-slate-800 font-medium text-sm",
          description: "text-slate-500 text-xs",
          success: "!bg-sky-50 !border-sky-200 !text-sky-800 [&>svg]:!text-sky-500",
          error: "!bg-red-50 !border-red-200 !text-red-800 [&>svg]:!text-red-500",
          warning: "!bg-amber-50 !border-amber-200 !text-amber-800 [&>svg]:!text-amber-500",
          info: "!bg-blue-50 !border-blue-200 !text-blue-800 [&>svg]:!text-blue-500",
          actionButton: "!bg-sky-500 !text-white hover:!bg-sky-600",
          cancelButton: "!bg-slate-100 !text-slate-600 hover:!bg-slate-200",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin text-sky-500" />,
      }}
      style={
        {
          "--normal-bg": "white",
          "--normal-text": "#1e293b",
          "--normal-border": "#e2e8f0",
          "--border-radius": "0.75rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
