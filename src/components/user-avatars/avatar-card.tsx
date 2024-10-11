import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import vrchat from "vrchat";

export default function AvatarCard(avatar: vrchat.Avatar): React.ReactNode {
  return (
    <Card className="w-full" key={avatar.id}>
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
