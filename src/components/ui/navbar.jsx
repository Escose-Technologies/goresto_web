import React, { useState } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Bell, Menu, X, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

const Navbar = () => {
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    // Hide navbar on scroll down, show on scroll up
    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        if (latest > previous && latest > 150) {
            setHidden(true);
            setActiveDropdown(null);
        } else {
            setHidden(false);
        }
    });

    const navLinks = [
        {
            name: "About Us",
            href: "/about",
            children: [
                { name: "About TFS", href: "/about" },
                { name: "Vision & Mission", href: "/about/vision-mission" },
                { name: "Principal's Message", href: "/about/principal-message" },
                { name: "Salient Features", href: "/about/salient-features" },
            ]
        },
        {
            name: "Academics",
            href: "/academics",
            children: [
                { name: "Overview", href: "/academics" },
                { name: "Pre-Primary (Nursery-UKG)", href: "/academics/pre-primary" },
                { name: "Primary (I-V)", href: "/academics/primary" },
                { name: "Middle School (VI-VIII)", href: "/academics/middle-school" },
                { name: "Secondary (IX-X)", href: "/academics/secondary" },
                { name: "Senior Secondary (XI-XII)", href: "/academics/senior-secondary" },
            ]
        },
        {
            name: "Admissions",
            href: "/admissions",
            children: [
                { name: "Admission Info", href: "/admissions" },
                { name: "Admission Procedure", href: "/admissions/procedure" },
                { name: "Fee Structure", href: "/admissions/fee-structure" },
            ]
        },
        {
            name: "Infrastructure",
            href: "/infrastructure",
            children: [
                { name: "Overview", href: "/infrastructure" },
                { name: "Laboratories", href: "/infrastructure/laboratories" },
                { name: "Library", href: "/infrastructure/library" },
                { name: "Sports Facilities", href: "/infrastructure/sports" },
            ]
        },
        {
            name: "Activities",
            href: "/activities"
        },
        {
            name: "Gallery",
            href: "/gallery",
            children: [
                { name: "Photo Gallery", href: "/gallery/photos" },
                { name: "Video Gallery", href: "/gallery/videos" },
            ]
        },
        {
            name: "Contact",
            href: "/contact"
        },
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
                    "fixed top-14 inset-x-0 mx-auto w-[95%] max-w-5xl z-50 rounded-full transition-all duration-300",
                    "bg-white/90 backdrop-blur-md shadow-lg border border-slate-200/50 py-3 px-6"
                )}
                onMouseLeave={() => setActiveDropdown(null)}
            >
                <nav className="flex items-center justify-between">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-serif font-bold text-xl">
                            F
                        </div>
                        <span className="font-serif font-bold text-lg tracking-wide hidden sm:block text-primary">
                            The First Step
                        </span>
                    </a>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <div
                                key={link.name}
                                className="relative"
                                onMouseEnter={() => link.children && setActiveDropdown(link.name)}
                            >
                                <a
                                    href={link.href}
                                    className="text-sm font-medium text-slate-700 hover:text-primary transition-colors flex items-center gap-1"
                                >
                                    {link.name}
                                    {link.children && (
                                        <ChevronDown className={cn(
                                            "w-3.5 h-3.5 transition-transform",
                                            activeDropdown === link.name && "rotate-180"
                                        )} />
                                    )}
                                </a>

                                {/* Dropdown */}
                                <AnimatePresence>
                                    {link.children && activeDropdown === link.name && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute top-full left-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 overflow-hidden"
                                        >
                                            {link.children.map((child) => (
                                                <a
                                                    key={child.name}
                                                    href={child.href}
                                                    className="block px-4 py-2 text-sm text-slate-600 hover:bg-primary/5 hover:text-primary transition-colors"
                                                >
                                                    {child.name}
                                                </a>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 rounded-full text-slate-700 hover:bg-slate-100 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        </button>
                        <button
                            className="md:hidden p-2 rounded-full text-slate-700 hover:bg-slate-100 transition-colors"
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
                        className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white p-6 shadow-2xl overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <span className="font-serif font-bold text-xl text-primary">Menu</span>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 text-slate-500 hover:text-primary transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <div key={link.name}>
                                    <a
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block py-3 text-lg font-medium text-slate-800 hover:text-primary transition-colors border-b border-slate-100"
                                    >
                                        {link.name}
                                    </a>
                                    {link.children && (
                                        <div className="pl-4 py-2 space-y-1 bg-slate-50 rounded-lg mb-2">
                                            {link.children.map((child) => (
                                                <a
                                                    key={child.name}
                                                    href={child.href}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="block py-2 text-sm text-slate-600 hover:text-primary transition-colors"
                                                >
                                                    {child.name}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 p-4 bg-primary/5 rounded-xl">
                            <h4 className="font-semibold text-primary mb-2">Admissions Open</h4>
                            <p className="text-sm text-slate-600">Admissions for 2026-27 are now open!</p>
                            <a href="/admissions" className="inline-block mt-2 text-sm font-medium text-primary hover:underline">
                                Apply Now →
                            </a>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </>
    );
};

export default Navbar;
