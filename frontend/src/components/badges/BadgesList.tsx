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
import { Search } from "lucide-react";
import { CreateBadgeButton } from "@/components/badges/CreateBadgeButton";

export function BadgesList(): React.ReactElement {
  const { data, isLoading } = useGetBadges();
  const list = (data && data.length > 0 ? data : HARD_CODED_BADGES) as Badge[];

  if (isLoading) {
    return <div className="mx-auto w-full max-w-5xl p-4">Loading badges…</div>;
  }
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-4 items-center pb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search badges..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <CreateBadgeButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </main>
  );
}

export default BadgesList;
