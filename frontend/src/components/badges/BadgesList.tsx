import React from "react";
import { BadgeCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetBadges } from "@/hooks/badges/use-get-badges";
import { HARD_CODED_BADGES, type Badge } from "@/lib/constants/badgeConstants";

export function BadgesList(): React.ReactElement {
  const { data, isLoading } = useGetBadges();
  const list = (data && data.length > 0 ? data : HARD_CODED_BADGES) as Badge[];

  if (isLoading) {
    return <div className="mx-auto w-full max-w-5xl p-4">Loading badges…</div>;
  }
  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((badge) => (
        <Card key={badge.name}>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center">
                <BadgeCheck className="h-4 w-4 mr-2" />
                {badge.name}
              </div>
            </CardTitle>
            <CardDescription>{badge.description}</CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      ))}
    </div>
  );
}

export default BadgesList;
