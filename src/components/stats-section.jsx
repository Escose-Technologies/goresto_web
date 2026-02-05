import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const StatItem = ({ end, label, suffix = "+" }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            const duration = 2000; // 2 seconds
            const steps = 60;
            const stepTime = duration / steps;
            const increment = end / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(current));
                }
            }, stepTime);

            return () => clearInterval(timer);
        }
    }, [isInView, end]);

    return (
        <div ref={ref} className="text-center p-4 sm:p-6 bg-white/5 rounded-2xl glass-dark backdrop-blur-sm border border-white/10">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2 font-serif">
                {count}
                {suffix}
            </div>
            <div className="text-blue-100 text-sm md:text-base font-medium tracking-wide">{label}</div>
        </div>
    );
};

export const StatsSection = () => {
    return (
        <section className="py-12 sm:py-20 bg-primary relative overflow-hidden">
            {/* Background Patterns */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                <div className="absolute top-10 right-10 w-64 h-64 border-[40px] border-white rounded-full"></div>
                <div className="absolute bottom-10 left-10 w-96 h-96 border-[60px] border-white rounded-full"></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 relative z-10">
                <StatItem end={2000} label="Happy Students" />
                <StatItem end={150} label="Expert Faculty" />
                <StatItem end={25} label="Years of Excellence" />
                <StatItem end={50} label="Awards Won" />
            </div>
        </section>
    );
};
