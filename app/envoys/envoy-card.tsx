import { Card } from "@/components/ui/card";
import { truncateText } from "@/lib/utils";
import { EnvoyShort } from "@/types/person";
import Image from "next/image";

export const EnvoyCard = ({ envoy }: { envoy: EnvoyShort }) => (
  <Card className="flex items-center justify-between p-2 border border-gray-200 rounded-md">
    <div>
      {/* Club and profession in smaller text */}
      <p className="text-sm text-gray-500 mb-1">
        {truncateText(envoy.club, 20)} •{" "}
        {truncateText(envoy?.profession || "", 20)}
      </p>

      {/* Name in larger, bolder text */}
      <h2 className="text-2xl font-bold text-gray-800 mb-1">
        {truncateText(`${envoy.firstName} ${envoy.lastName}`, 30)}
      </h2>

      {/* Votes in smaller text */}
      <p className="text-sm text-gray-600">
        {envoy.numberOfVotes.toLocaleString()}{" "}
        {envoy.numberOfVotes === 1 ? "Głos" : "Głosów"}
      </p>
    </div>

    {/* Image on the right */}
    <div className="relative w-16 h-16 ml-4">
      <Image
        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/MP/${envoy.id}.jpeg`}
        alt={`${envoy.firstName} ${envoy.lastName}`}
        fill
        className="object-cover rounded-md"
        sizes="64px"
      />
    </div>
  </Card>
);
