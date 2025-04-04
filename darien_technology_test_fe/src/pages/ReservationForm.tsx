import { useState, useEffect } from "react";
import {
  useNavigate,
  useSearchParams,
  useParams,
  Link,
} from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ReservationProvider,
  useReservation,
} from "../context/ReservationContext";
import { useSpace } from "../context/SpaceContext";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import {
  formatDateForInput,
  formatTimeForInput,
  formatISOTimeForInput,
} from "../utils/dateUtils";
import { addHours } from "date-fns";

const ReservationFormContent = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const spaceIdParam = searchParams.get("spaceId");
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getReservationById,
    createReservation,
    updateReservation,
    loading: reservationLoading,
  } = useReservation();
  const { spaces, getSpaces, loading: spaceLoading } = useSpace();
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const isEditMode = !!id;

  const formik = useFormik({
    initialValues: {
      spaceId: spaceIdParam ? parseInt(spaceIdParam, 10) : 0,
      reservationDate: formatDateForInput(new Date()),
      startTime: formatTimeForInput(new Date()),
      endTime: formatTimeForInput(addHours(new Date(), 1)),
    },
    validationSchema: Yup.object({
      spaceId: Yup.number()
        .required("Space is required")
        .positive("Please select a space"),
      reservationDate: Yup.string()
        .required("Date is required")
        .test("is-not-past", "Date cannot be in the past", (value) => {
          const today = new Date().toISOString().split("T")[0];
          return value >= today;
        }),
      startTime: Yup.string().required("Start time is required"),
      endTime: Yup.string()
        .required("End time is required")
        .test(
          "is-greater",
          "End time should be greater than start time",
          function (value) {
            const { startTime } = this.parent;
            return value > startTime;
          }
        ),
    }),
    onSubmit: async (values) => {
      try {
        if (!user) {
          setError("You must be logged in to make a reservation");
          return;
        }

        const reservationData = {
          spaceId: values.spaceId,
          userEmail: user.email,
          reservationDate: values.reservationDate,
          startTime: `${values.reservationDate}T${values.startTime}:00`,
          endTime: `${values.reservationDate}T${values.endTime}:00`,
        };

        if (isEditMode && id) {
          try {
            await updateReservation(parseInt(id, 10), reservationData);
            navigate(`/reservations/${id}`);
          } catch (err: any) {
            if (err.response?.status === 400) {
              setError(err.response.data.message);
            } else {
              setError("Failed to update reservation");
            }
            console.error(err);
          }
        } else {
          try {
            const newReservation = await createReservation(reservationData);
            if (newReservation && newReservation.id) {
              navigate(`/reservations/${newReservation.id}`);
            }
          } catch (err: any) {
            if (err.response?.status === 400) {
              setError(err.response.data.message);
            } else {
              setError("Failed to create reservation");
            }
            console.error(err);
          }
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error(err);
      }
    },
  });

  useEffect(() => {
    if (dataLoaded) return;

    const fetchData = async () => {
      try {
        await getSpaces();

        if (isEditMode && id) {
          const reservation = await getReservationById(parseInt(id, 10));
          if (reservation) {
            formik.setValues({
              spaceId: reservation.spaceId,
              reservationDate: reservation.reservationDate.split("T")[0],
              startTime: formatISOTimeForInput(reservation.startTime),
              endTime: formatISOTimeForInput(reservation.endTime),
            });
          }
        }
        setDataLoaded(true);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
      }
    };

    fetchData();
  }, [id, isEditMode, getSpaces, getReservationById, dataLoaded, spaceIdParam]);

  const loading = reservationLoading || spaceLoading;

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {isEditMode ? "Edit Reservation" : "New Reservation"}
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={formik.handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="spaceId"
                className="block text-gray-700 font-medium mb-2"
              >
                Space
              </label>
              <select
                id="spaceId"
                {...formik.getFieldProps("spaceId")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a space</option>
                {spaces.map((space) => (
                  <option key={space.id} value={space.id}>
                    {space.name} - {space.location}
                  </option>
                ))}
              </select>
              {formik.touched.spaceId && formik.errors.spaceId ? (
                <div className="text-red-600 text-sm mt-1">
                  {formik.errors.spaceId}
                </div>
              ) : null}
            </div>

            <div className="mb-4">
              <label
                htmlFor="reservationDate"
                className="block text-gray-700 font-medium mb-2"
              >
                Date
              </label>
              <input
                type="date"
                id="reservationDate"
                {...formik.getFieldProps("reservationDate")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formik.touched.reservationDate &&
              formik.errors.reservationDate ? (
                <div className="text-red-600 text-sm mt-1">
                  {formik.errors.reservationDate}
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="startTime"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  {...formik.getFieldProps("startTime")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formik.touched.startTime && formik.errors.startTime ? (
                  <div className="text-red-600 text-sm mt-1">
                    {formik.errors.startTime}
                  </div>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="endTime"
                  className="block text-gray-700 font-medium mb-2"
                >
                  End Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  {...formik.getFieldProps("endTime")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formik.touched.endTime && formik.errors.endTime ? (
                  <div className="text-red-600 text-sm mt-1">
                    {formik.errors.endTime}
                  </div>
                ) : null}
              </div>
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
                  ? "Update Reservation"
                  : "Create Reservation"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ReservationForm = () => {
  return (
    <ReservationProvider>
      <ReservationFormContent />
    </ReservationProvider>
  );
};

export default ReservationForm;
