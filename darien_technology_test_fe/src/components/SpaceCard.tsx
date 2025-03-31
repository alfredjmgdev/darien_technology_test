import { Link } from "react-router-dom";
import SpaceManagement from "./SpaceManagement";
import { useAuth } from "../context/AuthContext";
import { SpaceCardProps } from "../interfaces/space";

const SpaceCard = ({ space, onUpdate }: SpaceCardProps) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{space.name}</h3>
        <p className="text-gray-600 mt-1">{space.location}</p>
        <div className="mt-2">
          <span className="text-sm text-gray-500">
            Capacity: {space.capacity} people
          </span>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <Link
            to={`/spaces/${space.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Details
          </Link>
          {isAuthenticated && (
            <SpaceManagement space={space} onUpdate={onUpdate} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SpaceCard;
