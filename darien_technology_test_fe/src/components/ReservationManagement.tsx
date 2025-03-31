import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReservation } from "../context/ReservationContext";
import { formatDate, formatTime } from "../utils/dateUtils";
import Modal from "./Modal";
import { ReservationCardProps } from "../interfaces/reservation";

const ReservationCard = ({
  reservation,
  spaceName,
  onUpdate,
}: ReservationCardProps) => {
  const { deleteReservation } = useReservation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteReservation(reservation.id);
      setIsDeleteModalOpen(false);
      onUpdate();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to cancel reservation";
      setDeleteError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    navigate(`/reservations/edit/${reservation.id}`);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold text-gray-800">{spaceName}</h3>
            <span className="text-sm text-gray-500">
              {formatDate(reservation.reservationDate)}
            </span>
          </div>

          <div className="mt-2 text-gray-600">
            <p>
              Time: {formatTime(reservation.startTime)} -{" "}
              {formatTime(reservation.endTime)}
            </p>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <Link
              to={`/reservations/${reservation.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Details
            </Link>
            <div className="flex space-x-4">
              <button
                onClick={handleEdit}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
              >
                {isDeleting ? "Cancelling..." : "Cancel Reservation"}
              </button>
            </div>
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
    </>
  );
};

export default ReservationCard;
