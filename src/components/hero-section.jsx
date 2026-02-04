import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AuroraBackground } from "./ui/aurora-background";

export const HeroSection = () => {
    return (
        <AuroraBackground>
            <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center min-h-screen">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <span className="inline-block px-5 py-2.5 bg-blue-100/80 backdrop-blur-sm text-primary text-sm font-semibold rounded-full border border-primary/20">
                        • Now Accepting Admissions for 2026-27
                    </span>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-slate-900 mb-6 leading-tight max-w-5xl"
                >
                    Where <span className="text-primary">Future Leaders</span> Take Their First Step.
                </motion.h1>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-base md:text-lg text-slate-700 max-w-2xl mx-auto mb-12 leading-relaxed font-sans"
                >
                    Experience a world-class curriculum designed to nurture curiosity, innovation, and character in a safe, state-of-the-art campus.
                </motion.p>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex items-center justify-center"
                >
                    <a
                        href="#admissions"
                        className="px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg group"
                    >
                        Admission Open 2026
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                </motion.div>
            </div>
        </AuroraBackground>
    );
};
