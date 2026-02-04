import React from "react";
import { Home, Mail, Phone } from "lucide-react";

export const TopBar = () => {
    return (
        <div className="bg-primary text-white text-xs py-1.5 hidden lg:block">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex items-center justify-between">
                    {/* Left Side - Contact Info */}
                    <div className="flex items-center gap-4">
                        <a href="/" className="flex items-center gap-1 hover:text-secondary transition-colors">
                            <Home className="w-3 h-3" />
                            <span>Home</span>
                        </a>
                        <a href="mailto:contact@tfsschool.edu" className="flex items-center gap-1 hover:text-secondary transition-colors">
                            <Mail className="w-3 h-3" />
                            <span>contact@tfsschool.edu</span>
                        </a>
                        <a href="tel:+919876543210" className="flex items-center gap-1 hover:text-secondary transition-colors">
                            <Phone className="w-3 h-3" />
                            <span>+91-98765-43210</span>
                        </a>
                    </div>

                    {/* Right Side - Quick Links */}
                    <div className="flex items-center gap-3">
                        <span className="text-white/80">CBSE Affiliation: 1730604</span>
                        <span className="text-white/40">|</span>
                        <span className="text-white/80">School Code: 10950</span>
                        <span className="text-white/40">|</span>
                        <a href="#contact" className="hover:text-secondary transition-colors">Contact Us</a>
                        <span className="text-white/40">|</span>
                        <a href="#admissions" className="hover:text-secondary transition-colors">Admission Enquiry</a>
                        <span className="text-white/40">|</span>
                        <a href="#" className="hover:text-secondary transition-colors">Career</a>
                        <span className="text-white/40">|</span>
                        <a href="#" className="hover:text-secondary transition-colors">Student Login</a>
                        <span className="text-white/40">|</span>
                        <a href="#" className="hover:text-secondary transition-colors">Staff Login</a>
                        <span className="text-white/40">|</span>
                        <a href="#" className="text-secondary font-semibold hover:text-white transition-colors">Notice Board</a>
                    </div>
                </div>
            </div>
        </div>
    );
};
