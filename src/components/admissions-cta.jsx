import React from "react";
import { motion } from "framer-motion";
import { Phone, MapPin, Clock, ArrowRight } from "lucide-react";

export const AdmissionsCTA = () => {
    return (
        <section className="py-14 sm:py-20 bg-slate-900 relative overflow-hidden" id="admissions">
            {/* Subtle gradient accents */}
            <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-blue-900/30 to-transparent" />
            <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-gradient-to-tl from-indigo-900/20 to-transparent" />

            <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
                <div className="grid lg:grid-cols-5 gap-8 sm:gap-10 items-center">
                    {/* Left Content - Takes 3 columns */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-3 text-center lg:text-left"
                    >
                        <span className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg mb-6">
                            Admissions Open 2026-27
                        </span>

                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4 sm:mb-6 leading-tight">
                            Ready to Begin <br />
                            <span className="text-blue-400">The First Step?</span>
                        </h2>

                        <p className="text-base sm:text-lg text-slate-300 mb-6 sm:mb-8 max-w-xl">
                            Join our community of learners. Admissions are now open for the 2026-27 academic session.
                            Schedule a campus tour and see the difference for yourself.
                        </p>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4 sm:gap-6">
                            <div className="text-center lg:text-left">
                                <p className="text-2xl sm:text-4xl font-bold text-white">98%</p>
                                <p className="text-xs sm:text-sm text-slate-400">Parent Satisfaction</p>
                            </div>
                            <div className="text-center lg:text-left border-x border-slate-700">
                                <p className="text-2xl sm:text-4xl font-bold text-white">100%</p>
                                <p className="text-xs sm:text-sm text-slate-400">University Placement</p>
                            </div>
                            <div className="text-center lg:text-left">
                                <p className="text-2xl sm:text-4xl font-bold text-blue-400">25+</p>
                                <p className="text-xs sm:text-sm text-slate-400">Years of Excellence</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right - Contact Card - Takes 2 columns */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
                            <h3 className="text-2xl font-bold text-slate-900 mb-6">Contact Us</h3>

                            {/* Contact Items */}
                            <div className="space-y-5">
                                {/* Phone */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Call Us</p>
                                        <p className="text-lg font-bold text-slate-900">+91 98765 43210</p>
                                        <p className="text-slate-600">+91 98765 43211</p>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Our Campus</p>
                                        <p className="text-slate-900">123 Education Lane</p>
                                        <p className="text-slate-600">Knowledge City - 560001</p>
                                    </div>
                                </div>

                                {/* Hours */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Office Hours</p>
                                        <p className="text-slate-900">Mon - Fri: 8 AM - 4 PM</p>
                                        <p className="text-slate-600">Saturday: 9 AM - 1 PM</p>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <a
                                href="tel:+919876543210"
                                className="mt-8 w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg group"
                            >
                                Call Now
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
