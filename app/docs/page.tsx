import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";

const docsSections = [
  {
    title: "Getting Started",
    description:
      "Learn how to set up your account and create your first AI-generated content.",
    link: "/docs/getting-started",
  },
  {
    title: "Twitter Threads",
    description:
      "Discover how to create engaging Twitter threads using our AI technology.",
    link: "/docs/twitter-threads",
  },
  {
    title: "Instagram Captions",
    description:
      "Learn the best practices for generating Instagram captions that boost engagement.",
    link: "/docs/instagram-captions",
  },
  {
    title: "LinkedIn Posts",
    description:
      "Explore techniques for crafting professional LinkedIn content with AI assistance.",
    link: "/docs/linkedin-posts",
  },
  {
    title: "API Reference",
    description:
      "Detailed documentation for integrating our AI content generation into your applications.",
    link: "/docs/api-reference",
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Navbar />
      <main className="container mx-auto px-8 py-20">
        <h1 className="text-5xl font-bold mb-12 text-center text-white">
          Documentation
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {docsSections.map((section, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-gray-800 flex flex-col"
            >
              <h2 className="text-2xl font-bold mb-3 text-white">
                {section.title}
              </h2>
              <p className="text-gray-400 mb-4 flex-grow">
                {section.description}
              </p>
              <Button
                asChild
                className="w-full bg-white text-black hover:bg-gray-200"
              >
                <Link href={section.link}>Read More</Link>
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
