"use client";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Share2, ArrowBigUp, ArrowBigDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { truncateText, cn } from "@/lib/utils";
import { updateVote } from "@/lib/queries";

type VoteType = 1 | -1 | null;

export default function PostCard({
  category = "Uncategorized",
  title,
  description,
  comments,
  pointId,
  proceedingNumber,
  date,
  votes = { upvotes: 0, downvotes: 0 },
  initialUserVote = null,
  userId,
}: {
  category?: string;
  title: string;
  description: string;
  comments: number;
  pointId: number | string;
  proceedingNumber: number | string;
  date: string;
  votes?: { upvotes: number; downvotes: number };
  initialUserVote?: VoteType;
  userId?: string;
}) {
  const formattedDate = new Date(date).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const rawDate = new Date(date).toISOString().split("T")[0]; // Format date for image URL

  const [isSharing, setIsSharing] = useState(false);
  const [userVote, setUserVote] = useState<VoteType>(initialUserVote);
  const [voteScore, setVoteScore] = useState(votes.upvotes - votes.downvotes);
  const [postCategory, postTitle] = title.split("|", 2); // Split title into category and actual title

  const updateVoteInDB = async (newVote: VoteType) => {
    if (!userId) return;
    try {
      await updateVote(Number(pointId), newVote, userId);
    } catch (error) {
      console.error("Failed to update vote:", error);
      // Revert optimistic update
      setUserVote(initialUserVote);
      setVoteScore(votes.upvotes - votes.downvotes);
    }
  };

  const handleVote = async (newVote: VoteType) => {
    const diff =
      newVote === 1
        ? userVote === -1
          ? 2
          : 1
        : newVote === -1
        ? userVote === 1
          ? -2
          : -1
        : userVote === 1
        ? -1
        : 1;
    setUserVote(newVote);
    setVoteScore(voteScore + diff);
    await updateVoteInDB(newVote);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSharing(true);
    const shareUrl = `${window.location.origin}/proceedings/${proceedingNumber}/${date}/${pointId}`;
    try {
      if (
        navigator.share &&
        navigator.canShare({
          title,
          text: truncateText(description, 200, true),
          url: shareUrl,
        })
      ) {
        await navigator.share({
          title,
          text: truncateText(description, 200, true),
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch (error) {
      console.log("🚀 ~ handleShare ~ error:", error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-2 sm:p-4">
      {/* ...Header and image content... */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge>{postCategory || category}</Badge>
            <span className="text-sm text-muted-foreground">
              {formattedDate}
            </span>
          </div>
          <Link href={`/proceedings/${proceedingNumber}/${date}/${pointId}`}>
            <h2 className="text-xl font-semibold mb-2">{postTitle}</h2>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {truncateText(description, 320, true)}
          </p>
        </div>
        <Link
          href={`/proceedings/${proceedingNumber}/${date}/${pointId}`}
          className="w-full md:w-[200px] lg:w-[300px]"
        >
          <div className="relative rounded-lg overflow-hidden bg-muted aspect-[16/10]">
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/proceedings/${proceedingNumber}/${rawDate}/${pointId}.jpg`}
              alt={title}
              className="object-cover object-center transition-transform duration-300 hover:scale-105"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 200px, 300px"
            />
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div
          className={cn("flex flex-row items-center rounded-2xl", {
            "bg-primary *:text-white *:hover:bg-primary/90 *:hover:text-white":
              userVote === 1,
            "bg-blue-900 *:text-white *:hover:bg-blue-800 *:hover:text-white":
              userVote === -1,
            "border-transparent": userVote !== 1 && userVote !== -1,
          })}
        >
          <Button
            onClick={() => handleVote(userVote === 1 ? null : 1)}
            className="rounded-l-2xl"
            variant={"ghost"}
          >
            <ArrowBigUp
              className={cn("h-6 w-6", {
                "fill-current text-white": userVote === 1,
              })}
            />
          </Button>
          <span className="font-medium px-1">{voteScore}</span>
          <Button
            onClick={() => handleVote(userVote === -1 ? null : -1)}
            className="rounded-r-2xl"
            variant={"ghost"}
          >
            <ArrowBigDown
              className={cn("h-6 w-6", {
                "fill-current text-white": userVote === -1,
              })}
            />
          </Button>
        </div>
        <span className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> {comments} komentarzy
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          disabled={isSharing}
        >
          <Share2 className={cn("w-4 h-4", isSharing && "animate-pulse")} />
          <span className="ml-2">
            {isSharing ? "Udostępnianie..." : "Udostępnij"}
          </span>
        </Button>
      </div>
    </div>
  );
}
