import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useReservation } from "../context/ReservationContext";
import { useSpace } from "../context/SpaceContext";
import Header from "../components/Header";
import SpaceCard from "../components/SpaceCard";
import ReservationCard from "../components/ReservationManagement";
import Pagination from "../components/Pagination";

const DashboardContent = () => {
  const {
    reservations,
    loading: reservationLoading,
    error: reservationError,
    currentPage: reservationPage,
    pagination,
    fetchReservations,
  } = useReservation();

  const {
    spaces,
    loading: spaceLoading,
    error: spaceError,
    fetchSpaces,
  } = useSpace();

  const [activeTab, setActiveTab] = useState("spaces");

  useEffect(() => {
    fetchSpaces();
    fetchReservations();
  }, []);

  const handlePageChange = (page: number) => {
    fetchReservations(page);
  };

  const handleReservationUpdate = () => {
    fetchReservations(reservationPage);
  };

  const loading = reservationLoading || spaceLoading;
  const error = reservationError || spaceError;

  return (
    <div>
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("spaces")}
              className={`px-4 py-2 rounded-md ${
                activeTab === "spaces"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Spaces
            </button>
            <button
              onClick={() => setActiveTab("reservations")}
              className={`px-4 py-2 rounded-md ${
                activeTab === "reservations"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Reservations
            </button>
          </div>

          <Link
            to={activeTab === "spaces" ? "/spaces/new" : "/reservations/new"}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {activeTab === "spaces" ? "Add New Space" : "Make New Reservation"}
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {!loading && !error && (
          <>
            {activeTab === "spaces" ? (
              <>
                {spaces.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No spaces available.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {spaces.map((space) => (
                      <SpaceCard
                        key={space.id}
                        space={space}
                        onUpdate={fetchSpaces}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {reservations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      You don't have any reservations yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reservations.map((reservation) => {
                      const space = spaces.find(
                        (s) => s.id === reservation.spaceId
                      );
                      return (
                        <div key={reservation.id}>
                          <ReservationCard
                            reservation={reservation}
                            spaceName={
                              space
                                ? space.name
                                : `Space #${reservation.spaceId}`
                            }
                            onUpdate={handleReservationUpdate}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {pagination.totalPages > 1 && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

const Dashboard = () => {
  return <DashboardContent />;
};

export default Dashboard;
