import Image from "next/image";
export const EmptyState = ({
  text,
  image,
}: {
  text?: string;
  image: string;
}) => (
  <div className="text-center pb-6">
    <div className="flex justify-center items-center mb-4">
      <Image
        src={image}
        width={300}
        height={300}
        alt="Empty state illustration"
      />
    </div>
    {text && <p className="text-gray-500">{text}</p>}
  </div>
);
