"use client";
import { CardWrapper } from "@/components/ui/card-wrapper";
import { useState } from "react";
import { Credenza } from "@/components/ui/credenza";

interface StatCardProps {
  title: string;
  value: number | string;
  category: string;
  sourceDescription?: string;
  sourceUrls?: string[];
  headerIcon?: React.ReactNode;
  detailsModalContent?: React.ReactNode;
}

export default function StatCard({
  title,
  value,
  headerIcon,
  category,
  sourceDescription,
  sourceUrls,
  detailsModalContent,
}: StatCardProps) {
  const [modalOpenState, setModalOpenState] = useState(false);

  return (
    <>
      {detailsModalContent && (
        <Credenza
          open={modalOpenState}
          onOpenChange={(openState) => setModalOpenState(openState)}
        >
          {detailsModalContent}
        </Credenza>
      )}

      <CardWrapper
        title={category}
        subtitle={title}
        showSource={true}
        sourceDescription={sourceDescription}
        sourceUrls={sourceUrls}
        variant="inverted"
        headerIcon={headerIcon}
        showGradient={false}
      >
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-bold">{value}</div>
          {detailsModalContent && (
            <button
              onClick={() => setModalOpenState(true)}
              className="text-xs hover:underline"
            >
              Zobacz szczegóły
            </button>
          )}
        </div>
      </CardWrapper>
    </>
  );
}
