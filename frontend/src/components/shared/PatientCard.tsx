import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PatientCardProps {
  id: string;
  name: string;
  schedule?: string;
  type?: string;
  time?: string;
  age?: number;
  gender?: string;
  status?: "active" | "inactive";
}

export const PatientCard = ({ id, name, schedule, type, time, age, gender, status }: PatientCardProps) => {
  const navigate = useNavigate();
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-pink-100 text-pink-600",
      "bg-purple-100 text-purple-600",
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600",
      "bg-yellow-100 text-yellow-600",
    ];
    return colors[name.length % colors.length];
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/professional/patients/${id}`)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className={`${getAvatarColor(name)} h-12 w-12`}>
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-semibold">{name}</h4>
            {schedule && (
              <p className="text-sm text-primary">{schedule}</p>
            )}
            {age && gender && (
              <p className="text-sm text-muted-foreground">
                {gender === "male" ? "Masculino" : "Feminino"} - {age} anos
              </p>
            )}
          </div>
          {time && (
            <Badge variant="secondary" className="text-xs">
              {time}
            </Badge>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
