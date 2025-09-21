"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const premiumCardVariants = cva(
  "rounded-2xl border border-white/10 text-card-foreground shadow-xl backdrop-blur-xl transition-all duration-300 group relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-gray-900/80 to-gray-800/80 hover:from-gray-800/80 hover:to-gray-700/80",
        glass: "bg-white/5 backdrop-blur-2xl border-white/20 hover:bg-white/10",
        gradient: "bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-800/50",
        dark: "bg-black/50 border-gray-800/50 hover:border-gray-700/50",
        neon: "bg-black/80 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-2 hover:shadow-2xl",
        glow: "hover:shadow-purple-500/20 hover:border-purple-500/30",
        scale: "hover:scale-[1.02]",
        all: "hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      hover: "lift",
    },
  }
)

export interface PremiumCardProps
  extends Omit<HTMLMotionProps<"div">, "size">,
    VariantProps<typeof premiumCardVariants> {
  shine?: boolean
  magnetic?: boolean
}

const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, variant, size, hover, shine = false, magnetic = false, children, ...props }, ref) => {
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = React.useState(false)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!magnetic && !shine) return

      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20
      setMousePosition({ x, y })
    }

    const cardVariants = {
      rest: {
        scale: 1,
        rotateX: 0,
        rotateY: 0,
      },
      hover: magnetic ? {
        scale: 1.02,
        rotateX: mousePosition.y * 0.1,
        rotateY: mousePosition.x * 0.1,
        transition: { duration: 0.2 }
      } : hover === "scale" ? {
        scale: 1.02,
        transition: { duration: 0.2 }
      } : hover === "lift" ? {
        y: -8,
        transition: { duration: 0.2 }
      } : {}
    }

    return (
      <motion.div
        ref={ref}
        className={cn(premiumCardVariants({ variant, size, hover, className }))}
        variants={cardVariants}
        initial="rest"
        whileHover="hover"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={magnetic ? { perspective: 1000 } : undefined}
        {...props}
      >
        {/* Shine effect */}
        {shine && isHovered && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 0.8 }}
          />
        )}

        {/* Gradient border glow */}
        {variant === "neon" && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-sm -z-10" />
        )}

        {/* Content */}
        <div className="relative z-10">{children as React.ReactNode}</div>
      </motion.div>
    )
  }
)

PremiumCard.displayName = "PremiumCard"

const PremiumCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
PremiumCardHeader.displayName = "PremiumCardHeader"

const PremiumCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent",
      className
    )}
    {...props}
  />
))
PremiumCardTitle.displayName = "PremiumCardTitle"

const PremiumCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground text-gray-400", className)}
    {...props}
  />
))
PremiumCardDescription.displayName = "PremiumCardDescription"

const PremiumCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
PremiumCardContent.displayName = "PremiumCardContent"

const PremiumCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
PremiumCardFooter.displayName = "PremiumCardFooter"

export {
  PremiumCard,
  PremiumCardHeader,
  PremiumCardFooter,
  PremiumCardTitle,
  PremiumCardDescription,
  PremiumCardContent,
  premiumCardVariants,
}