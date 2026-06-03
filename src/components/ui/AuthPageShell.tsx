'use client'

import * as React from 'react'

interface AuthPageShellProps {
  title: string
  description?: string
  children: React.ReactNode
  preview?: React.ReactNode
  showPreview?: boolean
}

export function AuthPageShell({
  title,
  description,
  children,
  preview,
  showPreview = false,
}: AuthPageShellProps) {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,460px)_1fr]">
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md rounded-[32px] border border-border bg-background/95 p-8 shadow-[0_28px_60px_-30px_rgba(15,23,42,0.5)] backdrop-blur-xl">
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
                {description ? (
                  <p className="text-sm leading-6 text-muted-foreground">{description}</p>
                ) : null}
              </div>
              {children}
            </div>
          </div>
        </div>

        {showPreview ? (
          <div className="hidden md:flex items-center justify-center px-6 py-12">
            <div className="relative max-w-lg rounded-[32px] border border-white/10 bg-[#111111]/95 p-8 text-white shadow-[0_24px_80px_-40px_rgba(0,0,0,0.5)]">
              {preview}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}
