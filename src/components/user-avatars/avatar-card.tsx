import { AvatarInfo } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function AvatarCard(avatar: AvatarInfo): React.ReactNode {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row justify-start items-center gap-4">
        <Avatar>
          <AvatarImage src={avatar.thumbnailImageUrl} />
          <AvatarFallback />
        </Avatar>
        <CardTitle>{avatar.name}</CardTitle>
        <CardDescription>{avatar.description}</CardDescription>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}
