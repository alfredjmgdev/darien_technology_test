import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSpace } from "../context/SpaceContext";
import Header from "../components/Header";

const SpaceFormContent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSpaceById, createSpace, updateSpace, loading } = useSpace();
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!id;

  const formik = useFormik({
    initialValues: {
      name: "",
      location: "",
      capacity: 0,
      description: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required("Name is required")
        .max(255, "Name must be less than 255 characters"),
      location: Yup.string()
        .required("Location is required")
        .max(255, "Location must be less than 255 characters"),
      capacity: Yup.number()
        .required("Capacity is required")
        .positive("Capacity must be positive")
        .integer("Capacity must be an integer")
        .max(1000, "Capacity seems too large"),
      description: Yup.string().max(
        255,
        "Description must be less than 2000 characters"
      ),
    }),
    onSubmit: async (values) => {
      try {
        if (isEditMode && id) {
          await updateSpace(parseInt(id, 10), values);
          navigate(`/spaces/${id}`);
        } else {
          const newSpace = await createSpace(values);
          navigate(`/spaces/${newSpace.id}`);
        }
      } catch (err) {
        setError("Failed to save space");
        console.error(err);
      }
    },
  });

  useEffect(() => {
    const fetchSpace = async () => {
      if (isEditMode && id) {
        try {
          const space = await getSpaceById(parseInt(id, 10));
          if (space) {
            formik.setValues({
              name: space.name,
              location: space.location,
              capacity: space.capacity,
              description: space.description || "",
            });
          }
        } catch (err) {
          setError("Failed to load space details");
          console.error(err);
        }
      }
    };

    fetchSpace();
  }, [id, isEditMode]);

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {isEditMode ? "Edit Space" : "New Space"}
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={formik.handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-gray-700 font-medium mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                {...formik.getFieldProps("name")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formik.touched.name && formik.errors.name ? (
                <div className="text-red-600 text-sm mt-1">
                  {formik.errors.name}
                </div>
              ) : null}
            </div>

            <div className="mb-4">
              <label
                htmlFor="location"
                className="block text-gray-700 font-medium mb-2"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                {...formik.getFieldProps("location")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formik.touched.location && formik.errors.location ? (
                <div className="text-red-600 text-sm mt-1">
                  {formik.errors.location}
                </div>
              ) : null}
            </div>

            <div className="mb-4">
              <label
                htmlFor="capacity"
                className="block text-gray-700 font-medium mb-2"
              >
                Capacity
              </label>
              <input
                type="number"
                id="capacity"
                {...formik.getFieldProps("capacity")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formik.touched.capacity && formik.errors.capacity ? (
                <div className="text-red-600 text-sm mt-1">
                  {formik.errors.capacity}
                </div>
              ) : null}
            </div>

            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-gray-700 font-medium mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                {...formik.getFieldProps("description")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formik.touched.description && formik.errors.description ? (
                <div className="text-red-600 text-sm mt-1">
                  {formik.errors.description}
                </div>
              ) : null}
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || formik.isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading || formik.isSubmitting
                  ? "Saving..."
                  : isEditMode
                  ? "Update Space"
                  : "Create Space"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const SpaceForm = () => {
  return <SpaceFormContent />;
};

export default SpaceForm;
