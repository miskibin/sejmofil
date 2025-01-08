import Image from "next/image";
export const EmptyState = ({
  text,
  image,
}: {
  text: string;
  image: string;
}) => (
  <div className="text-center pb-6">
    <div className="flex justify-center mb-4">
      <Image
        src={image}
        width={200}
        height={200}
        alt="Empty state illustration"
      />
    </div>
    <p className="text-gray-500">{text}</p>
  </div>
);
