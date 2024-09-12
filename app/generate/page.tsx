"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Upload,
  Copy,
  Twitter,
  Instagram,
  Linkedin,
  Clock,
} from "lucide-react";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import { Navbar } from "@/components/Navbar";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  getUserPoints,
  saveGeneratedContent,
  updateUserPoints,
  getGeneratedContentHistory,
  createOrUpdateUser,
} from "@/utils/db/actions";
import { TwitterMock } from "@/components/social-mocks/TwitterMock";
import { InstagramMock } from "@/components/social-mocks/InstagramMock";
import { LinkedInMock } from "@/components/social-mocks/LinkedInMock";
import Link from "next/link";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const contentTypes = [
  { value: "twitter", label: "Twitter Thread" },
  { value: "instagram", label: "Instagram Caption" },
  { value: "linkedin", label: "LinkedIn Post" },
];

const MAX_TWEET_LENGTH = 280;
const POINTS_PER_GENERATION = 5;

interface HistoryItem {
  id: number;
  contentType: string;
  prompt: string;
  content: string;
  createdAt: Date;
}

export default function GenerateContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const [contentType, setContentType] = useState(contentTypes[0].value);
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<HistoryItem | null>(null);

  useEffect(() => {
    if (!apiKey) {
      console.error("Gemini API key is not set");
    }
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    } else if (isSignedIn && user) {
      console.log("User loaded:", user);
      fetchUserPoints();
      fetchContentHistory();
    }
  }, [isLoaded, isSignedIn, user, router]);

  const fetchUserPoints = async () => {
    if (user?.id) {
      console.log("Fetching points for user:", user.id);
      const points = await getUserPoints(user.id);
      console.log("Fetched points:", points);
      setUserPoints(points);
      if (points === 0) {
        console.log("User has 0 points. Attempting to create/update user.");
        const updatedUser = await createOrUpdateUser(
          user.id,
          user.emailAddresses[0].emailAddress,
          user.fullName || ""
        );
        console.log("Updated user:", updatedUser);
        if (updatedUser) {
          setUserPoints(updatedUser.points);
        }
      }
    }
  };

  const fetchContentHistory = async () => {
    if (user?.id) {
      const contentHistory = await getGeneratedContentHistory(user.id);
      setHistory(contentHistory);
    }
  };

  const handleGenerate = async () => {
    if (
      !genAI ||
      !user?.id ||
      userPoints === null ||
      userPoints < POINTS_PER_GENERATION
    ) {
      alert("Not enough points or API key not set.");
      return;
    }

    setIsLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      let promptText = `Generate ${contentType} content about "${prompt}".`;
      if (contentType === "twitter") {
        promptText +=
          " Provide a thread of 5 tweets, each under 280 characters.";
      }

      let imagePart: Part | null = null;
      if (contentType === "instagram" && image) {
        const reader = new FileReader();
        const imageData = await new Promise<string>((resolve) => {
          reader.onload = (e) => {
            if (e.target && typeof e.target.result === "string") {
              resolve(e.target.result);
            } else {
              resolve("");
            }
          };
          reader.readAsDataURL(image);
        });

        const base64Data = imageData.split(",")[1];
        if (base64Data) {
          imagePart = {
            inlineData: {
              data: base64Data,
              mimeType: image.type,
            },
          };
        }
        promptText +=
          " Describe the image and incorporate it into the caption.";
      }

      const parts: (string | Part)[] = [promptText];
      if (imagePart) parts.push(imagePart);

      const result = await model.generateContent(parts);
      const generatedText = result.response.text();

      let content: string[];
      if (contentType === "twitter") {
        content = generatedText
          .split("\n\n")
          .filter((tweet) => tweet.trim() !== "");
      } else {
        content = [generatedText];
      }

      setGeneratedContent(content);

      // Update points
      const updatedUser = await updateUserPoints(
        user.id,
        -POINTS_PER_GENERATION
      );
      if (updatedUser) {
        setUserPoints(updatedUser.points);
      }

      // Save generated content
      const savedContent = await saveGeneratedContent(
        user.id,
        content.join("\n\n"),
        prompt,
        contentType
      );

      if (savedContent) {
        setHistory((prevHistory) => [savedContent, ...prevHistory]);
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setGeneratedContent(["An error occurred while generating content."]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryItemClick = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    setContentType(item.contentType);
    setPrompt(item.prompt);
    setGeneratedContent(
      item.contentType === "twitter"
        ? item.content.split("\n\n")
        : [item.content]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderContentMock = () => {
    if (generatedContent.length === 0) return null;

    switch (contentType) {
      case "twitter":
        return <TwitterMock content={generatedContent} />;
      case "instagram":
        return <InstagramMock content={generatedContent[0]} />;
      case "linkedin":
        return <LinkedInMock content={generatedContent[0]} />;
      default:
        return null;
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="text-center bg-[#111111] p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-white mb-4">
            Welcome to ThreadCraft AI
          </h1>
          <p className="text-gray-400 mb-6">
            To start generating amazing content, please sign in or create an
            account.
          </p>
          <SignInButton mode="modal">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
              Sign In / Sign Up
            </Button>
          </SignInButton>
          <p className="text-gray-500 mt-4 text-sm">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <div className="flex flex-col lg:flex-row p-4 lg:p-6 gap-4 lg:gap-6 max-w-7xl mx-auto">
        <div className="w-full lg:w-1/4 bg-[#111111] p-4 rounded-lg overflow-y-auto lg:h-[calc(100vh-6rem)] mb-4 lg:mb-0">
          <h2 className="text-xl font-semibold mb-4">History</h2>
          {history.map((item) => (
            <div
              key={item.id}
              className="mb-3 p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#222222] transition-colors cursor-pointer"
              onClick={() => handleHistoryItemClick(item)}
            >
              <div className="flex items-center mb-1">
                {item.contentType === "twitter" && (
                  <Twitter className="mr-2 h-4 w-4 text-blue-400" />
                )}
                {item.contentType === "instagram" && (
                  <Instagram className="mr-2 h-4 w-4 text-pink-400" />
                )}
                {item.contentType === "linkedin" && (
                  <Linkedin className="mr-2 h-4 w-4 text-blue-600" />
                )}
                <span className="text-sm font-medium">{item.contentType}</span>
              </div>
              <p className="text-xs text-gray-400 truncate">{item.prompt}</p>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Clock className="mr-1 h-3 w-3" />
                {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 space-y-4 lg:space-y-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6">
            AI Content Generator
          </h1>

          <div className="flex items-center justify-between bg-[#111111] p-4 rounded-lg">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">Points:</span>
              <span className="text-lg font-bold text-blue-400">
                {userPoints !== null ? userPoints : "Loading..."}
              </span>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs lg:text-sm py-1 lg:py-2 px-2 lg:px-4 rounded-full transition-colors">
              <Link href={"/pricing"}>Get More Points</Link>
            </Button>
          </div>

          <div className="space-y-4">
            <div className="bg-[#111111] p-4 rounded-lg">
              <label className="block text-sm font-medium mb-1">
                Content Type
              </label>
              <Select onValueChange={setContentType} defaultValue={contentType}>
                <SelectTrigger className="w-full bg-[#111111] border-none">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        {type.value === "twitter" && (
                          <Twitter className="mr-2 h-4 w-4 text-blue-400" />
                        )}
                        {type.value === "instagram" && (
                          <Instagram className="mr-2 h-4 w-4 text-pink-400" />
                        )}
                        {type.value === "linkedin" && (
                          <Linkedin className="mr-2 h-4 w-4 text-blue-600" />
                        )}
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-[#111111] p-4 rounded-lg">
              <label
                htmlFor="prompt"
                className="block text-sm font-medium mb-1"
              >
                Prompt
              </label>
              <Textarea
                id="prompt"
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full bg-[#111111] border-none rounded-lg resize-none"
              />
            </div>

            {contentType === "instagram" && (
              <div className="bg-[#111111] p-4 rounded-lg">
                <label className="block text-sm font-medium mb-1">
                  Upload Image
                </label>
                <div className="flex flex-wrap items-center space-x-2 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex items-center justify-center px-4 py-2 bg-[#111111] rounded-lg text-sm font-medium hover:bg-[#1a1a1a] transition-colors"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    <span>Upload Image</span>
                  </label>
                  {image && (
                    <span className="text-sm text-gray-400">{image.name}</span>
                  )}
                </div>
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={
                isLoading ||
                !prompt ||
                userPoints === null ||
                userPoints < POINTS_PER_GENERATION
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                `Generate Content (${POINTS_PER_GENERATION} points)`
              )}
            </Button>

            {(selectedHistoryItem || generatedContent.length > 0) && (
              <div className="space-y-4 bg-[#111111] p-4 rounded-lg">
                <h2 className="text-xl font-semibold">
                  {selectedHistoryItem ? "History Item" : "Generated Content"}
                </h2>
                {contentType === "twitter" ? (
                  <div className="space-y-3">
                    {(selectedHistoryItem
                      ? selectedHistoryItem.content.split("\n\n")
                      : generatedContent
                    ).map((tweet, index) => (
                      <div
                        key={index}
                        className="bg-[#1a1a1a] p-4 rounded-lg relative"
                      >
                        <ReactMarkdown className="prose prose-invert max-w-none mb-2 text-sm">
                          {tweet}
                        </ReactMarkdown>
                        <div className="flex justify-between items-center text-gray-400 text-xs">
                          <span>
                            {tweet.length}/{MAX_TWEET_LENGTH}
                          </span>
                          <Button
                            onClick={() => copyToClipboard(tweet)}
                            className="bg-transparent hover:bg-[#222222] text-gray-300 rounded-full p-1 transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#1a1a1a] p-4 rounded-lg">
                    <ReactMarkdown className="prose prose-invert max-w-none text-sm">
                      {selectedHistoryItem
                        ? selectedHistoryItem.content
                        : generatedContent[0]}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            )}

            {generatedContent.length > 0 && (
              <div className="bg-[#111111] p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Preview</h2>
                {renderContentMock()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
