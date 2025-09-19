"use client"

import { motion } from "framer-motion"
import { Loader2, Sparkles, Wand2 } from "lucide-react"

interface LoadingScreenProps {
  message?: string
  progress?: number
}

export default function LoadingScreen({ message = "Creating magic...", progress = 0 }: LoadingScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center">
        {/* Animated logo/icon */}
        <motion.div
          className="relative mb-8"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              <Wand2 className="h-10 w-10 text-white" />
            </div>
          </div>
          {/* Orbiting particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
              style={{
                top: "50%",
                left: "50%",
              }}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.5,
              }}
            >
              <div className="absolute w-full h-full" style={{ transform: `translateX(${40 + i * 10}px)` }}>
                <Sparkles className="h-3 w-3 text-purple-400" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Loading text */}
        <motion.h2
          className="text-2xl font-bold text-white mb-4"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {message}
        </motion.h2>

        {/* Progress bar */}
        {progress > 0 && (
          <div className="w-64 mx-auto">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">{progress}%</p>
          </div>
        )}

        {/* Loading dots */}
        <motion.div className="flex justify-center gap-1 mt-6">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-purple-500 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}