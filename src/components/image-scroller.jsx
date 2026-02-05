import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Camera } from "lucide-react";

const slides = [
    {
        id: 1,
        // Replace with: "/images/campus-front.jpg"
        image: null,
        gradient: "from-primary/80 to-blue-400",
        title: "Our Campus",
        subtitle: "A world-class learning environment",
    },
    {
        id: 2,
        image: null,
        gradient: "from-emerald-500/80 to-teal-400",
        title: "Smart Classrooms",
        subtitle: "Technology-enabled interactive learning",
    },
    {
        id: 3,
        image: null,
        gradient: "from-secondary/80 to-amber-400",
        title: "Sports & Athletics",
        subtitle: "Building champions on and off the field",
    },
    {
        id: 4,
        image: null,
        gradient: "from-violet-500/80 to-purple-400",
        title: "Science Laboratories",
        subtitle: "Hands-on experiments and discovery",
    },
    {
        id: 5,
        image: null,
        gradient: "from-rose-500/80 to-pink-400",
        title: "Cultural Events",
        subtitle: "Celebrating talent and creativity",
    },
    {
        id: 6,
        image: null,
        gradient: "from-cyan-500/80 to-sky-400",
        title: "Library & Resources",
        subtitle: "A treasure trove of knowledge",
    },
];

const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction) => ({
        x: direction > 0 ? -300 : 300,
        opacity: 0,
    }),
};

export function ImageScroller() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef(null);

    const startAutoPlay = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 4000);
    }, []);

    useEffect(() => {
        if (!isPaused) {
            startAutoPlay();
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPaused, startAutoPlay]);

    const goTo = (index) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
        startAutoPlay();
    };

    const goNext = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % slides.length);
        startAutoPlay();
    };

    const goPrev = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
        startAutoPlay();
    };

    const current = slides[currentIndex];

    return (
        <section className="py-14 sm:py-20 bg-white relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-10 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
                {/* Section Header */}
                <div className="text-center mb-8 sm:mb-14">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4"
                    >
                        <Camera className="w-4 h-4" />
                        Campus Life
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4 sm:mb-5"
                    >
                        A Glimpse Into <span className="text-primary">Our World</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-600 max-w-2xl mx-auto text-lg"
                    >
                        Explore our vibrant campus, modern facilities, and the memorable
                        moments that make our school special.
                    </motion.p>
                </div>

                {/* Carousel */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="relative"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Main Slide */}
                    <div className="relative w-full h-[300px] sm:h-[400px] md:h-[480px] rounded-2xl overflow-hidden shadow-xl">
                        <AnimatePresence initial={false} custom={direction} mode="wait">
                            <motion.div
                                key={current.id}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.3 },
                                }}
                                className="absolute inset-0"
                            >
                                {current.image ? (
                                    <img
                                        src={current.image}
                                        alt={current.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className={`w-full h-full bg-gradient-to-br ${current.gradient} flex items-center justify-center`}
                                    >
                                        <div className="text-center text-white/80">
                                            <Camera className="w-16 h-16 mx-auto mb-3 opacity-60" />
                                            <p className="text-sm font-medium">
                                                Replace with school photo
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Overlay with title */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-1">
                                        {current.title}
                                    </h3>
                                    <p className="text-white/80 text-sm md:text-base">
                                        {current.subtitle}
                                    </p>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Arrows */}
                        <button
                            onClick={goPrev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors z-10"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-slate-800" />
                        </button>
                        <button
                            onClick={goNext}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors z-10"
                            aria-label="Next slide"
                        >
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-slate-800" />
                        </button>
                    </div>

                    {/* Dots & Thumbnails */}
                    <div className="flex items-center justify-center gap-2 mt-6">
                        {slides.map((slide, index) => (
                            <button
                                key={slide.id}
                                onClick={() => goTo(index)}
                                className={`relative h-2 rounded-full transition-all duration-300 ${
                                    index === currentIndex
                                        ? "w-8 bg-primary"
                                        : "w-2 bg-slate-300 hover:bg-slate-400"
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Thumbnail Strip */}
                    <div className="hidden md:flex items-center justify-center gap-3 mt-6">
                        {slides.map((slide, index) => (
                            <button
                                key={slide.id}
                                onClick={() => goTo(index)}
                                className={`relative w-20 h-14 rounded-lg overflow-hidden transition-all duration-300 ${
                                    index === currentIndex
                                        ? "ring-2 ring-primary ring-offset-2 scale-105"
                                        : "opacity-60 hover:opacity-90"
                                }`}
                                aria-label={`Go to ${slide.title}`}
                            >
                                {slide.image ? (
                                    <img
                                        src={slide.image}
                                        alt={slide.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className={`w-full h-full bg-gradient-to-br ${slide.gradient}`}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
