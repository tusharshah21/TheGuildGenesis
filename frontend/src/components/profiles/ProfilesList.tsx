import { ProfileCard } from "./ProfileCard";
import { Search } from "lucide-react";
import { CreateProfileButton } from "./CreateProfileButton";
import { useGetProfiles } from "@/hooks/profiles/use-get-profiles";
import { PROFILES, type Profile } from "@/lib/constants/profileConstants";
import { useMemo, useState } from "react";

export function ProfilesList() {
  const { data, isLoading, error } = useGetProfiles();
  const [searchQuery, setSearchQuery] = useState("");

  const profiles: Profile[] =
    data && data.length > 0
      ? data.map((p) => ({
          address: p.address,
          name: p.name,
          description: p.description,
          badgeCount: 0,
          badges: [],
        }))
      : PROFILES;

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) => (p.name || "").toLowerCase().includes(q));
  }, [profiles, searchQuery]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-4 items-center pb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search profiles..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <CreateProfileButton />
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-600">Loading profiles...</p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600">{(error as Error).message}</p>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((profile) => (
          <ProfileCard
            key={profile.address}
            address={profile.address}
            name={profile.name}
            description={profile.description}
            badgeCount={profile.badgeCount}
            badges={profile.badges}
          />
        ))}
      </div>
    </main>
  );
}

export default ProfilesList;
