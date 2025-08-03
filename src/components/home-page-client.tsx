"use client";

import ChatInterface from "~/components/chat-interface";
import { AuthButton } from "~/components/auth-button";
import { useSession } from "next-auth/react";

export function HomePageClient() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-xl font-semibold">Mosaic</h1>
          <AuthButton />
        </div>
      </header>
      {session ? (
        <ChatInterface />
      ) : (
        <div className="flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Welcome to Mosaic</h2>
            <p className="mb-8 text-lg text-gray-600">Sign in to start chatting</p>
            <AuthButton />
          </div>
        </div>
      )}
    </div>
  );
}