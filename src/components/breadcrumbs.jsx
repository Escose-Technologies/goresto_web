import React from "react";
import { ChevronRight, Home } from "lucide-react";

export const Breadcrumbs = ({ items = [] }) => {
    return (
        <nav aria-label="Breadcrumb" className="py-4">
            <ol className="flex items-center gap-2 text-sm">
                <li>
                    <a
                        href="/"
                        className="flex items-center gap-1 text-slate-500 hover:text-primary transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        <span>Home</span>
                    </a>
                </li>
                {items.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                        {index === items.length - 1 ? (
                            <span className="text-primary font-medium">{item.name}</span>
                        ) : (
                            <a
                                href={item.href}
                                className="text-slate-500 hover:text-primary transition-colors"
                            >
                                {item.name}
                            </a>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};
