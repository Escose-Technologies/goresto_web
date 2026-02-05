import React from "react";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Award, Users, Brain, Globe } from "lucide-react";

const programs = [
    {
        icon: BookOpen,
        title: "Pre-Primary",
        description: "Play-based learning for ages 3-6, focusing on creativity, curiosity, and foundational skills.",
        age: "Ages 3-6",
        color: "bg-blue-500",
        lightColor: "bg-blue-50",
    },
    {
        icon: GraduationCap,
        title: "Primary School",
        description: "CBSE curriculum with interactive learning, building strong academic foundations.",
        age: "Grades 1-5",
        color: "bg-emerald-500",
        lightColor: "bg-emerald-50",
    },
    {
        icon: Award,
        title: "Middle School",
        description: "Advanced curriculum preparing students for high school with critical thinking skills.",
        age: "Grades 6-8",
        color: "bg-violet-500",
        lightColor: "bg-violet-50",
    },
    {
        icon: Brain,
        title: "High School",
        description: "Comprehensive preparation for board exams and competitive entrance tests.",
        age: "Grades 9-12",
        color: "bg-amber-500",
        lightColor: "bg-amber-50",
    },
];

const features = [
    {
        icon: Users,
        text: "Small class sizes for personalized attention",
    },
    {
        icon: Globe,
        text: "Global curriculum with local values",
    },
    {
        icon: Award,
        text: "100% board exam pass rate",
    },
];

const ProgramCard = ({ program, index }) => {
    const Icon = program.icon;
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all border border-slate-100"
        >
            <div className={`w-16 h-16 ${program.lightColor} rounded-xl flex items-center justify-center mb-6`}>
                <Icon className={`w-8 h-8 ${program.color.replace('bg-', 'text-')}`} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2 font-serif">{program.title}</h3>
            <p className="text-slate-600 mb-4">{program.description}</p>
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg">
                {program.age}
            </span>
        </motion.div>
    );
};

export const AcademicSection = () => {
    return (
        <section className="py-14 sm:py-24 bg-white relative overflow-hidden" id="academics">
            {/* Background Decorations */}
            <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
                {/* Section Header */}
                <div className="text-center mb-10 sm:mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4"
                    >
                        Our Programs
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4 sm:mb-5"
                    >
                        Academic <span className="text-primary">Excellence</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-600 max-w-2xl mx-auto text-lg"
                    >
                        From early childhood to high school, we provide a comprehensive education
                        that prepares students for success in academics and life.
                    </motion.p>
                </div>

                {/* Programs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-16">
                    {programs.map((program, index) => (
                        <ProgramCard key={program.title} program={program} index={index} />
                    ))}
                </div>

                {/* Features Row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-6 sm:p-8 md:p-12"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                                        <Icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <p className="text-slate-700 font-medium">{feature.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
