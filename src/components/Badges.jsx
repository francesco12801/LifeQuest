import React from "react";
import { Award, Tag } from "lucide-react";

const Badges = ({ availableBadges, purchaseBadge, isLoading }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 w-full">
      <div className="flex items-center mb-6 text-indigo-700">
        <Award size={20} className="mr-2" />
        <h2 className="text-xl font-semibold">Available Badges</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {availableBadges.map((badge) => {
          const BadgeIcon = badge.icon;
          return (
            <div
              key={badge.id}
              className={`p-6 rounded-xl border ${
                badge.earned
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex justify-center mb-4">
                <div
                  className={`rounded-full p-4 ${
                    badge.earned
                      ? "bg-green-100 text-green-600"
                      : "bg-indigo-100 text-indigo-600"
                  }`}
                >
                  <BadgeIcon size={32} />
                </div>
              </div>

              <h3
                className={`text-lg font-medium text-center ${
                  badge.earned ? "text-green-700" : "text-gray-800"
                }`}
              >
                {badge.name}
              </h3>

              <p className="text-gray-600 text-sm text-center mt-2 mb-4">
                {badge.description}
              </p>

              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center text-gray-600">
                  <Tag size={14} className="mr-1" />
                  {badge.price} YODA
                </span>
                <span className="text-gray-500">
                  {badge.remaining}/{badge.supply}
                </span>
              </div>

              <div className="mt-4">
                {badge.earned ? (
                  <div className="bg-green-100 text-green-700 py-2 px-4 rounded-lg text-center font-medium">
                    Badge Earned
                  </div>
                ) : (
                  <button
                    onClick={() => purchaseBadge(badge.id)}
                    disabled={isLoading || badge.remaining === 0}
                    className={`w-full py-2 px-4 rounded-lg font-medium ${
                      isLoading || badge.remaining === 0
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {badge.remaining === 0 ? "Sold Out" : "Purchase"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-indigo-700 mb-3">
          How to Earn Badges
        </h3>
        <p className="text-gray-700 mb-4">
          There are two ways to earn VitaVerse badges:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            <span className="font-medium">Direct purchase:</span> You can
            purchase any badge with your YODA tokens.
          </li>
          <li>
            <span className="font-medium">Achieve goals:</span> Some badges can be
            earned automatically when you reach certain wellness goals. These badges
            will also reward you with YODA!
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Badges;