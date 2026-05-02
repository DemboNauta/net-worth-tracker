"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/historial", label: "Historial", icon: History },
    { href: "/categorias", label: "Categorías", icon: Tag },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-56 min-h-screen border-r bg-card flex-shrink-0 hidden md:flex flex-col">
            <div className="px-5 py-5 border-b">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground text-xs font-bold">$</span>
                    </div>
                    <span className="font-semibold text-sm">Net Worth Tracker</span>
                </div>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
                {nav.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                            pathname === href
                                ? "bg-primary text-primary-foreground font-medium"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
