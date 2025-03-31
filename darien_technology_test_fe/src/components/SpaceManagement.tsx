import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSpace } from "../context/SpaceContext";
import Modal from "./Modal";
import { SpaceManagementProps } from "../interfaces/space";

const SpaceManagement = ({ space, onUpdate }: SpaceManagementProps) => {
  const { deleteSpace } = useSpace();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteSpace(space.id);
      setIsDeleteModalOpen(false);
      onUpdate();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete space";
      setDeleteError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    navigate(`/spaces/edit/${space.id}`);
  };

  return (
    <>
      <div className="flex space-x-4 mt-2">
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
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
        title="Delete Space"
        message={
          deleteError || `Are you sure you want to delete ${space.name}?`
        }
        confirmText={isDeleting ? "Deleting..." : "Delete Space"}
        cancelText="Keep Space"
        error={!!deleteError}
      />
    </>
  );
};

export default SpaceManagement;
