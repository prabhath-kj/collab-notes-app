"use client"

import ProtectedRoute from "@/components/auth/ProtectedLayoutForPages"


export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <ProtectedRoute>{children}</ProtectedRoute>

        </>
    )
}