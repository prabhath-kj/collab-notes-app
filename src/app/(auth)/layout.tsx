"use client"

import ProtectedLayout from "@/components/auth/ProtectedLayoutForAuth"

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <ProtectedLayout>{children}</ProtectedLayout>

        </>
    )
}