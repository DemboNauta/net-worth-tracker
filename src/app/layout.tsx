import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
    title: "Net Worth Tracker",
    description: "Seguimiento de patrimonio personal",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" className="dark">
            <body className="antialiased bg-background text-foreground min-h-screen">
                <div className="flex min-h-screen">
                    <Sidebar />
                    <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 max-w-5xl w-full">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
