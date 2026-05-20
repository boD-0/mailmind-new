"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAvatarStore } from "@/stores/avatarStore";
import { AVATARS } from "@/data/avatars";

export function AvatarPicker() {
  const { selectedAvatarId, setSelectedAvatar } = useAvatarStore();
  const selectedAvatar = AVATARS[selectedAvatarId - 1] ?? AVATARS[0]!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <div className="w-full max-w-md mx-auto overflow-hidden">
        {/* Background header with gradient */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: 1,
            height: "8rem",
            transition: {
              height: { type: "spring" as const, stiffness: 100, damping: 20 },
            },
          }}
          className="bg-gradient-to-r from-[#ff5f5f]/20 to-[#ff5f5f]/10 w-full rounded-t-2xl"
        />

        <div className="px-8 pb-8 -mt-16">
          {/* Main avatar display */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              transition: { type: "spring" as const, stiffness: 200, damping: 20 },
            }}
            className="relative w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-white bg-white shadow-xl flex items-center justify-center"
          >
            <div className="w-full h-full flex items-center justify-center scale-[3]">
              {selectedAvatar.svg}
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
            className="text-center mt-4"
          >
            <h2 className="text-2xl font-bold text-gray-900">
              Alege-ți avatarul
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Selectează avatarul care te reprezintă
            </p>
          </motion.div>

          {/* Avatar selection row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.4 } }}
            className="flex justify-center gap-4 mt-6"
          >
            {AVATARS.map((avatar, i) => (
              <motion.button
                key={avatar.id}
                onClick={() => setSelectedAvatar(avatar.id)}
                initial={{ y: 20, opacity: 0 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  transition: { type: "spring" as const, stiffness: 300, damping: 20, delay: 0.5 + i * 0.1 },
                }}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                className={cn(
                  "relative w-14 h-14 rounded-full overflow-hidden border-2 transition-colors duration-300",
                  selectedAvatarId === avatar.id
                    ? "border-[#ff5f5f] ring-2 ring-[#ff5f5f]/30 ring-offset-2 ring-offset-white"
                    : "border-gray-200 hover:border-gray-300"
                )}
                aria-label={`Select ${avatar.alt}`}
                aria-pressed={selectedAvatarId === avatar.id}
              >
                <div className="w-full h-full flex items-center justify-center">
                  {avatar.svg}
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/** Renders just the avatar circle — used in header / sidebar */
export function AvatarCircle({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const { selectedAvatarId } = useAvatarStore();
  const avatar = AVATARS[selectedAvatarId - 1] ?? AVATARS[0]!;

  const sizeMap: Record<"sm" | "md" | "lg", string> = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden bg-gradient-to-tr from-[#ff5f5f] to-[#ff5f5f]/70 border border-gray-200 flex items-center justify-center",
        sizeMap[size]
      )}
    >
      <div className="w-full h-full flex items-center justify-center scale-[2.5]">
        {avatar.svg}
      </div>
    </div>
  );
}
