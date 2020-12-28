import Image from "next/image";

interface Props {
  name: string;
  picture: string;
}

export default function Avatar({ name, picture }: Props) {
  return (
    <div className="flex items-center">
      <div className="w-12 h-12 mr-4 relative">
        <Image
          src={picture}
          alt={name}
          layout="fill"
          objectFit="cover"
          className="rounded-full"
        />
      </div>
      <div className="text-xl font-bold">{name}</div>
    </div>
  );
}
