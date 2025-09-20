"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

const premiumButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/25 hover:from-purple-700 hover:to-pink-700",
        destructive:
          "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg hover:shadow-xl hover:shadow-red-500/25 hover:from-red-700 hover:to-rose-700",
        outline:
          "border-2 border-purple-500/50 bg-transparent text-purple-400 hover:bg-purple-500/10 hover:border-purple-500 backdrop-blur-sm",
        secondary:
          "bg-gradient-to-r from-gray-800 to-gray-700 text-white hover:from-gray-700 hover:to-gray-600 shadow-lg",
        ghost: "hover:bg-purple-500/10 hover:text-purple-400 backdrop-blur-sm",
        link: "text-purple-400 underline-offset-4 hover:underline hover:text-purple-300",
        glass: "glass backdrop-blur-xl border border-white/20 text-white hover:bg-white/10",
        gradient:
          "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:shadow-indigo-500/25",
        neon: "bg-black border-2 border-purple-500 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:text-white",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-14 rounded-xl px-8 text-base font-semibold",
        xl: "h-16 rounded-2xl px-10 text-lg font-bold",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface PremiumButtonProps
  extends Omit<HTMLMotionProps<"button">, "size">,
    VariantProps<typeof premiumButtonVariants> {
  asChild?: boolean
  ripple?: boolean
  glow?: boolean
}

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ className, variant, size, asChild = false, ripple = true, glow = false, children, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([])
    const [isHovered, setIsHovered] = React.useState(false)

    const Comp = asChild ? Slot : motion.button

    const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget
      const rect = button.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      if (ripple) {
        const newRipple = { id: Date.now(), x, y }
        setRipples((prev) => [...prev, newRipple])

        setTimeout(() => {
          setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id))
        }, 1000)
      }
    }

    const buttonVariants = {
      rest: {
        scale: 1,
        rotateX: 0,
        rotateY: 0,
      },
      hover: {
        scale: 1.02,
        rotateX: 5,
        rotateY: 5,
        transition: { duration: 0.2 }
      },
      tap: {
        scale: 0.98,
        transition: { duration: 0.1 }
      }
    }

    return (
      <Comp
        ref={ref}
        className={cn(premiumButtonVariants({ variant, size, className }))}
        onClick={createRipple}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        variants={buttonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        style={{ perspective: 1000 }}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{
              left: ripple.x - 50,
              top: ripple.y - 50,
              width: 100,
              height: 100,
            }}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        ))}

        {/* Glow effect */}
        {glow && isHovered && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}

        {/* Shimmer effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />

        {/* Content */}
        <span className="relative z-10">{children}</span>
      </Comp>
    )
  }
)
PremiumButton.displayName = "PremiumButton"

export { PremiumButton, premiumButtonVariants }