import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export const Footer = () => {
    const footerLinks = {
        quickLinks: [
            { name: "About Us", href: "/about" },
            { name: "Academics", href: "/academics" },
            { name: "Admissions", href: "/admissions" },
            { name: "Infrastructure", href: "/infrastructure" },
            { name: "Gallery", href: "/gallery" },
        ],
        resources: [
            { name: "Notice Board", href: "/news" },
            { name: "Results", href: "/results" },
            { name: "Downloads", href: "/downloads" },
            { name: "Events", href: "/activities" },
            { name: "Contact Us", href: "/contact" },
        ],
    };

    const contactInfo = [
        { icon: MapPin, text: "123 School Road, City, State - 123456" },
        { icon: Phone, text: "+91-98765-43210" },
        { icon: Mail, text: "contact@tfsschool.edu" },
        { icon: Clock, text: "Mon - Sat: 8:00 AM - 4:00 PM" },
    ];

    const socialLinks = [
        { icon: Facebook, href: "#", label: "Facebook" },
        { icon: Twitter, href: "#", label: "Twitter" },
        { icon: Instagram, href: "#", label: "Instagram" },
        { icon: Youtube, href: "#", label: "YouTube" },
    ];

    return (
        <footer className="bg-white border-t border-slate-200">
            {/* Main Footer */}
            <div className="container mx-auto px-6 py-16 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* School Info */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-serif font-bold text-2xl">
                                F
                            </div>
                            <div>
                                <h3 className="font-serif font-bold text-lg text-slate-900">The First Step</h3>
                                <p className="text-xs text-slate-500">International School</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-6">
                            Nurturing young minds for a brighter future. Providing quality education with a focus on holistic development.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-3">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all duration-300"
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Quick Links</h4>
                        <ul className="space-y-3">
                            {footerLinks.quickLinks.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-slate-600 hover:text-primary transition-colors"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Resources</h4>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-slate-600 hover:text-primary transition-colors"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Contact Us</h4>
                        <ul className="space-y-4">
                            {contactInfo.map((item, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <item.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-600">{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Large Text Section */}
            <div className="w-full px-4 pb-8 overflow-hidden">
                <h2 className="text-[18vw] md:text-[16vw] lg:text-[14vw] font-bold text-primary leading-[0.85] tracking-tighter font-serif text-center whitespace-nowrap">
                    The First Step
                </h2>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-200">
                <div className="container mx-auto px-6 py-6 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <p>© 2026 The First Step International School. All Rights Reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms of Use</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
