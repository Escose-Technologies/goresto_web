import React from "react";
import { motion } from "framer-motion";
import {
    GraduationCap,
    Users,
    Shield,
    Laptop,
    Trophy,
    Heart,
} from "lucide-react";

const features = [
    {
        icon: GraduationCap,
        title: "World-Class Curriculum",
        description: "CBSE-aligned education with global perspectives, preparing students for national and international success.",
        color: "bg-primary",
        lightColor: "bg-primary/10",
    },
    {
        icon: Users,
        title: "15:1 Student-Teacher Ratio",
        description: "Personalized attention ensuring every child's unique potential is recognized and nurtured.",
        color: "bg-secondary",
        lightColor: "bg-secondary/10",
    },
    {
        icon: Shield,
        title: "Safe & Secure Campus",
        description: "24/7 CCTV surveillance, trained security personnel, and child-safe infrastructure for complete peace of mind.",
        color: "bg-emerald-500",
        lightColor: "bg-emerald-50",
    },
    {
        icon: Laptop,
        title: "Smart Classrooms",
        description: "Digital learning with interactive boards, computer labs, and AI-powered educational tools.",
        color: "bg-violet-500",
        lightColor: "bg-violet-50",
    },
    {
        icon: Trophy,
        title: "Proven Excellence",
        description: "Consistent 100% pass rate with top university placements and national-level achievements.",
        color: "bg-amber-500",
        lightColor: "bg-amber-50",
    },
    {
        icon: Heart,
        title: "Holistic Development",
        description: "Sports, arts, music, and extracurricular activities for complete personality development.",
        color: "bg-rose-500",
        lightColor: "bg-rose-50",
    },
];

const FeatureCard = ({ feature, index }) => {
    const Icon = feature.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-primary/20"
        >
            {/* Icon */}
            <div className={`w-14 h-14 rounded-xl ${feature.lightColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-7 h-7 ${feature.color === 'bg-primary' ? 'text-primary' : feature.color === 'bg-secondary' ? 'text-secondary' : feature.color.replace('bg-', 'text-')}`} />
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                {feature.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
                {feature.description}
            </p>

            {/* Decorative corner */}
            <div className={`absolute top-0 right-0 w-20 h-20 ${feature.lightColor} rounded-bl-[60px] rounded-tr-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        </motion.div>
    );
};

export function BentoGridSection() {
    return (
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden" id="why-choose">
            {/* Background Decorations */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4"
                    >
                        Why Choose Us
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-5"
                    >
                        The First Step <span className="text-primary">Advantage</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-600 max-w-2xl mx-auto text-lg"
                    >
                        Where tradition meets innovation. We create an environment that nurtures
                        curiosity, builds character, and prepares young minds for tomorrow's challenges.
                    </motion.p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} feature={feature} index={index} />
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center mt-14"
                >
                    <a
                        href="#admissions"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                    >
                        Schedule a Campus Visit
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
