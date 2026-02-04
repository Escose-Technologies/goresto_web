import React, { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Bell, Menu, X } from "lucide-react";
import { cn } from "../../lib/utils";

const Navbar = () => {
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Hide navbar on scroll down, show on scroll up
    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }
        setScrolled(latest > 50);
    });

    const navLinks = [
        { name: "About Us", href: "#about" },
        { name: "Academics", href: "#academics" },
        { name: "Administration", href: "#administration" },
        { name: "Infrastructure", href: "#infrastructure" },
        { name: "Activities", href: "#activities" },
        { name: "Gallery", href: "#gallery" },
        { name: "News & Update", href: "#news" },
    ];

    return (
        <>
            <motion.header
                variants={{
                    visible: { y: 0, opacity: 1 },
                    hidden: { y: -100, opacity: 0 },
                }}
                animate={hidden ? "hidden" : "visible"}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className={cn(
                    "fixed top-6 inset-x-0 mx-auto w-[95%] max-w-5xl z-50 rounded-full transition-all duration-300",
                    scrolled ? "glass shadow-xl py-3 px-6" : "bg-transparent py-4 px-6"
                )}
            >
                <nav className="flex items-center justify-between">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-serif font-bold text-xl">
                            F
                        </div>
                        <span className={cn(
                            "font-serif font-bold text-lg tracking-wide hidden sm:block",
                            scrolled ? "text-primary" : "text-primary"
                        )}>
                            The First Step
                        </span>
                    </a>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary/80",
                                    scrolled ? "text-slate-700" : "text-primary"
                                )}
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button className={cn(
                            "relative p-2 rounded-full transition-colors hover:bg-primary/10",
                            scrolled ? "text-slate-700 hover:bg-slate-100" : "text-primary"
                        )}>
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        </button>
                        <button
                            className={cn(
                                "md:hidden p-2 rounded-full transition-colors",
                                scrolled ? "text-slate-700 hover:bg-slate-100" : "text-primary hover:bg-primary/10"
                            )}
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </nav>
            </motion.header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute right-0 top-0 h-full w-[80%] max-w-sm bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <span className="font-serif font-bold text-xl text-primary">Menu</span>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 text-slate-500 hover:text-primary transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-lg font-medium text-slate-700 hover:text-primary transition-colors border-b border-slate-100 pb-2"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                                <h4 className="font-semibold text-primary mb-2">Latest Updates</h4>
                                <p className="text-sm text-slate-600">Admissions for 2026-27 are now open! Apply online.</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </>
    );
};

export default Navbar;
