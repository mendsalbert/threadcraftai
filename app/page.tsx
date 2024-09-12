import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  TwitterIcon,
  InstagramIcon,
  LinkedinIcon,
  ArrowRightIcon,
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { SignUpButton } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  const { userId } = auth();

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Navbar />

      <main className="container mx-auto px-8 py-20">
        <div className="text-center mb-32 max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-8 leading-tight text-white">
            AI-Powered Social Media Content Generator
          </h1>
          <p className="text-xl mb-12 text-gray-400">
            Create engaging Twitter threads and social media posts with
            cutting-edge AI technology.
          </p>
          <Button
            asChild
            className=" text-white bg-black hover:bg-black outline hover:outline-gray-700 px-10 py-3 rounded-md text-lg"
          >
            <Link href="/generate">Start Creating</Link>
          </Button>
        </div>

        <div className="mb-32" id="features">
          <h2 className="text-3xl font-bold mb-16 text-center text-white">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-5xl mx-auto">
            {[
              {
                title: "Twitter Threads",
                icon: <TwitterIcon className="w-8 h-8 mb-4 text-blue-400" />,
                description:
                  "Generate compelling Twitter threads that engage your audience.",
              },
              {
                title: "Instagram Captions",
                icon: <InstagramIcon className="w-8 h-8 mb-4 text-pink-400" />,
                description: "Create catchy captions for your Instagram posts.",
              },
              {
                title: "LinkedIn Posts",
                icon: <LinkedinIcon className="w-8 h-8 mb-4 text-blue-600" />,
                description:
                  "Craft professional content for your LinkedIn network.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-lg border border-gray-800 flex flex-col items-center text-center"
              >
                {feature.icon}
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-white">
            Ready to boost your social media presence?
          </h2>
          {userId ? (
            <Button
              asChild
              className="bg-blue-500 text-white hover:bg-blue-600 px-10 py-3 rounded-md text-lg"
            >
              <Link href="/generate">
                Generate Content Now <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <SignUpButton mode="modal">
              <Button className="bg-blue-500 text-white hover:bg-blue-600 px-10 py-3 rounded-md text-lg">
                Get Started <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </SignUpButton>
          )}
        </div>
      </main>
    </div>
  );
}
