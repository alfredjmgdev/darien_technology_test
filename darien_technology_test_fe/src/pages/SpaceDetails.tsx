import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSpace } from "../context/SpaceContext";
import Header from "../components/Header";
import { Space } from "../types";

const SpaceDetailsContent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSpaceById, loading, error } = useSpace();
  const [space, setSpace] = useState<Space | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        if (id) {
          const spaceData = await getSpaceById(parseInt(id, 10));
          if (spaceData) {
            setSpace(spaceData);
          } else {
            setFetchError("Space not found");
          }
        }
      } catch (err) {
        console.error("Error fetching space:", err);
        setFetchError("Failed to load space details");
      }
    };

    fetchSpace();
  }, [id, getSpaceById]);

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || fetchError) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || fetchError}
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-blue-600 hover:text-blue-800"
          >
            &larr; Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-8">
            <p className="text-gray-600">Space not found</p>
            <Link
              to="/dashboard"
              className="mt-4 inline-block text-blue-600 hover:text-blue-800"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
            &larr; Back to Dashboard
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {space.name}
            </h1>
            <div className="flex items-center text-gray-600 mb-4">
              <svg
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{space.location}</span>
            </div>

            <div className="mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                Capacity: {space.capacity} people
              </span>
            </div>

            {space.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  Description
                </h2>
                <p className="text-gray-600">{space.description}</p>
              </div>
            )}

            <div className="mt-6">
              <Link
                to={`/reservations/new?spaceId=${space.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Reserve This Space
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpaceDetails = () => {
  return <SpaceDetailsContent />;
};

export default SpaceDetails;
