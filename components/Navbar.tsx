"use client";
import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  SignedOut,
  SignedIn,
  useAuth,
} from "@clerk/nextjs";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const { userId } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="container mx-auto px-4 sm:px-8 py-4 sm:py-6 border-b">
      <nav className="flex flex-wrap justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center">
          <span className="text-xl cursor-pointer sm:text-xl font-bold text-white">
            <Link href={"/"}>ThreadCraft AI</Link>
          </span>
        </div>
        <button
          className="sm:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
        <div
          className={`w-full sm:w-auto ${
            isMenuOpen ? "block" : "hidden"
          } sm:block mt-4 sm:mt-0`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8">
            <Link
              href="#features"
              className="text-gray-400 hover:text-white transition-colors py-2 sm:py-0"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-gray-400 hover:text-white transition-colors py-2 sm:py-0"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="text-gray-400 hover:text-white transition-colors py-2 sm:py-0"
            >
              Docs
            </Link>
            {userId ? (
              <>
                <Link
                  href="/generate"
                  className="text-gray-400 hover:text-white transition-colors py-2 sm:py-0"
                >
                  Dashboard
                </Link>
                <SignedOut>
                  <SignInButton />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-gray-400 border border-1 border-gray-200 rounded-md px-3 py-1 hover:text-white transition-colors mt-2 sm:mt-0">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="text-gray-400 border border-1 border-gray-200 rounded-md px-3 py-1 hover:text-white transition-colors mt-2 sm:mt-0">
                    Sign Up
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
