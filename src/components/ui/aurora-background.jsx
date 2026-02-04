import { cn } from "../../lib/utils";
import React from "react";

export const AuroraBackground = ({
    className,
    children,
    showRadialGradient = true,
    ...props
}) => {
    return (
        <main
            className={cn(
                "relative flex flex-col  h-[100vh] items-center justify-center bg-slate-50 text-slate-950 transition-bg",
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className={cn(
                        'filter blur-[60px] opacity-50',
                        'absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2',
                        'w-[60vw] h-[60vw] rounded-full',
                        'bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400',
                        'animate-aurora'
                    )}
                ></div>
                <div
                    className={cn(
                        'filter blur-[80px] opacity-40',
                        'absolute top-0 left-0 w-full h-full',
                        'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-200 via-transparent to-transparent'
                    )}
                ></div>
            </div>
            {children}
        </main>
    );
};
