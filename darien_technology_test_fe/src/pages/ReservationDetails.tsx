import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ReservationProvider,
  useReservation,
} from "../context/ReservationContext";
import { useSpace } from "../context/SpaceContext";
import Header from "../components/Header";
import { Reservation } from "../types";
import { formatDate, formatTime } from "../utils/dateUtils";
import Modal from "../components/Modal";

const ReservationDetailsContent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getReservationById,
    deleteReservation,
    loading: reservationLoading,
  } = useReservation();
  const { getSpaceById, loading: spaceLoading } = useSpace();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [spaceName, setSpaceName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Use useCallback to memoize the fetch function
  const fetchReservation = useCallback(async () => {
    if (!id) return;

    try {
      const fetchedReservation = await getReservationById(parseInt(id, 10));
      if (fetchedReservation) {
        setReservation(fetchedReservation);

        // Fetch space details
        const space = await getSpaceById(fetchedReservation.spaceId);
        if (space) {
          setSpaceName(space.name);
        }
      }
    } catch (err) {
      setError("Failed to load reservation details");
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    fetchReservation();
  }, [fetchReservation]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      if (id) {
        await deleteReservation(parseInt(id, 10));
        navigate("/dashboard");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to cancel reservation";
      setDeleteError(errorMessage);
      setIsDeleteModalOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/reservations/edit/${id}`);
    }
  };

  const loading = reservationLoading || spaceLoading;

  if (loading && !reservation) {
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

  if (error) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>Reservation not found</p>
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
          <button
            onClick={() => navigate("/dashboard")}
            className="text-blue-600 hover:text-blue-800"
          >
            &larr; Back to Dashboard
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Reservation Details
          </h1>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {spaceName || `Space #${reservation.spaceId}`}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{formatDate(reservation.startTime)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Time</p>
              <p className="font-medium">{formatTime(reservation.startTime)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Time</p>
              <p className="font-medium">{formatTime(reservation.endTime)}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Reservation
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? "Cancelling..." : "Cancel Reservation"}
            </button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
        title="Cancel Reservation"
        message={
          deleteError || "Are you sure you want to cancel this reservation?"
        }
        confirmText={isDeleting ? "Cancelling..." : "Cancel Reservation"}
        cancelText="Keep Reservation"
        error={!!deleteError}
      />
    </div>
  );
};

const ReservationDetails = () => {
  return (
    <ReservationProvider>
      <ReservationDetailsContent />
    </ReservationProvider>
  );
};

export default ReservationDetails;
