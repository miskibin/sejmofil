import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, ThumbsDown, ChevronDown } from "lucide-react";
import CardWrapper from "@/components/card-wrapper";

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  replies?: Comment[];
  avatar?: string;
}

interface CommentSectionProps {
  comments: Comment[];
  totalComments: number;
}

export function CommentSection({
  comments,
  totalComments,
}: CommentSectionProps) {
  const CommentContent = () => (
    <div className="space-y-6">
      {/* Comment Input */}
      <div className="flex gap-3 items-start">
        <Avatar className="w-8 h-8" />
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <input
              type="text"
              placeholder="Co myślisz na ten Temat?"
              className="w-full bg-transparent outline-none"
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-primary">
              <span className="text-red-600">*</span> Pamiętaj, o zasadach
              Grzecznej dyskusji
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="text-gray-500">
                Anuluj
              </Button>
              <Button className="bg-primary text-white hover:bg-primary/90">
                Skomentuj
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <Avatar className="w-8 h-8" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{comment.author}</span>
              <span className="text-gray-500 text-sm">{comment.timestamp}</span>
            </div>
            <p className="mt-1">{comment.content}</p>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{comment.likes}</span>
                </button>
                <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                  <ThumbsDown className="w-4 h-4" />
                  <span>{comment.dislikes}</span>
                </button>
              </div>
              <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                <MessageSquare className="w-4 h-4" />
                <span>Reply</span>
              </button>
            </div>

            {/* Nested Replies */}
            {comment.replies && (
              <div className="mt-4 space-y-4 border-l-2 border-gray-100 pl-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <Avatar className="w-8 h-8" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{reply.author}</span>
                        <span className="text-gray-500 text-sm">
                          {reply.timestamp}
                        </span>
                      </div>
                      <p className="mt-1">{reply.content}</p>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{reply.likes}</span>
                          </button>
                          <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                            <ThumbsDown className="w-4 h-4" />
                            <span>{reply.dislikes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <CardWrapper
      title={`Komentarze (${totalComments})`}
      tabs={[
        {
          value: "komentarze",
          label: "Komentarze",
          content: <CommentContent />,
        },
        {
          value: "dyskusja",
          label: "Dyskusja Sejmowa",
          content: <div>Dyskusja Sejmowa content</div>,
        },
        {
          value: "najciekawsze",
          label: (
            <div className="flex items-center gap-1">
              Najciekawsze
              <ChevronDown className="w-4 h-4" />
            </div>
          ),
          content: <div>Najciekawsze content</div>,
        },
      ]}
    />
  );
}

export default CommentSection;
