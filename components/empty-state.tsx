import Image from 'next/image'
export const EmptyState = ({
  text,
  image,
}: {
  text?: string
  image: string
}) => (
  <div className="pb-6 text-center">
    <div className="mb-4 flex items-center justify-center">
      <Image
        src={image}
        width={300}
        height={300}
        alt="Empty state illustration"
      />
    </div>
    {text && <p className="text-gray-500">{text}</p>}
  </div>
)
