import { useTheme } from "next-themes"
import { Toaster as Sonner, toast as sonnerToast } from "sonner"

// Add global CSS for toast close button positioning
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    [data-sonner-toast] [data-close-button] {
      position: absolute !important;
      top: 8px !important;
      right: -8px !important;
      left: auto !important;
      z-index: 10 !important;
    }
  `;
  document.head.appendChild(style);
}

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton={true}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:!bg-[#FFFFFE] group-[.toaster]:!text-gray-900 group-[.toaster]:!border-gray-200 group-[.toaster]:shadow-lg group-[.toaster]:font-light",
          description: "group-[.toast]:!text-gray-600 group-[.toast]:font-light",
          error: "group-[.toaster]:!bg-[#FFFFFE] group-[.toaster]:!text-gray-900 group-[.toaster]:!border-gray-200 group-[.toaster]:shadow-lg group-[.toaster]:font-light",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "!absolute !top-2 !right-2 !left-auto !bg-transparent !border-0 !text-gray-400 hover:!text-gray-600 !p-1 !h-6 !w-6 !flex !items-center !justify-center !rounded-full hover:!bg-gray-100 !z-10",
        },
      }}
      {...props}
    />
  )
}

// Enhanced toast utilities
const toast = {
  // Auto-dismissing toasts (default behavior)
  success: (message: string, options?: { description?: string; duration?: number; action?: { label: string; onClick: () => void } }) => {
    return sonnerToast.success(message, {
      duration: options?.duration || 4000,
      description: options?.description,
      action: options?.action,
    })
  },

  error: (message: string, options?: { description?: string; duration?: number; action?: { label: string; onClick: () => void } }) => {
    return sonnerToast.error(message, {
      duration: options?.duration || 5000,
      description: options?.description,
      action: options?.action,
    })
  },

  warning: (message: string, options?: { description?: string; duration?: number; action?: { label: string; onClick: () => void } }) => {
    return sonnerToast.warning(message, {
      duration: options?.duration || 4000,
      description: options?.description,
      action: options?.action,
    })
  },

  info: (message: string, options?: { description?: string; duration?: number; action?: { label: string; onClick: () => void } }) => {
    return sonnerToast.info(message, {
      duration: options?.duration || 4000,
      description: options?.description,
      action: options?.action,
    })
  },

  // Basic toast (auto-dismiss)
  default: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast(message, {
      duration: options?.duration || 3000,
      description: options?.description,
    })
  },

  // Sticky toasts (persist until manually closed)
  stickySuccess: (message: string, options?: { description?: string }) => {
    return sonnerToast.success(message, {
      duration: Infinity,
      description: options?.description,
      dismissible: true,
    })
  },

  stickyError: (message: string, options?: { description?: string }) => {
    return sonnerToast.error(message, {
      duration: Infinity,
      description: options?.description,
      dismissible: true,
    })
  },

  stickyWarning: (message: string, options?: { description?: string }) => {
    return sonnerToast.warning(message, {
      duration: Infinity,
      description: options?.description,
      dismissible: true,
    })
  },

  stickyInfo: (message: string, options?: { description?: string }) => {
    return sonnerToast.info(message, {
      duration: Infinity,
      description: options?.description,
      dismissible: true,
    })
  },

  // Progress toasts (auto-dismiss after 4 seconds)
  progress: (message: string, options?: { description?: string }) => {
    return sonnerToast(message, {
      duration: 4000,
      description: options?.description,
      dismissible: true,
      icon: '⏳', // Use an hourglass emoji as a progress indicator
    })
  },

  // Dismiss specific toast
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId)
  },

  // Access to original sonner toast for advanced usage
  raw: sonnerToast,
}

export { Toaster, toast }
