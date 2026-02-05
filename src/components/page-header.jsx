import React from "react";
import { motion } from "framer-motion";

export const PageHeader = ({ title, subtitle }) => {
    return (
        <section className="relative bg-gradient-to-br from-primary via-primary-light to-primary overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Content */}
            <div className="relative container mx-auto px-6 py-20 md:py-28 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center"
                >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 tracking-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto"
                        >
                            {subtitle}
                        </motion.p>
                    )}
                </motion.div>
            </div>

            {/* Bottom Wave */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg
                    viewBox="0 0 1440 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-auto"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0 60L48 55C96 50 192 40 288 35C384 30 480 30 576 33.3C672 37 768 43 864 45C960 47 1056 45 1152 41.7C1248 38 1344 33 1392 30.3L1440 28V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z"
                        fill="#f8fafc"
                    />
                </svg>
            </div>
        </section>
    );
};
