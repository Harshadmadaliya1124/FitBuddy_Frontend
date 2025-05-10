import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axiosInstance from "../../api/axios";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(
        appointments.filter((appt) => appt.status === filter)
      );
    }
  }, [filter, appointments]);

  const fetchAppointments = async () => {
    try {
      const response = await axiosInstance.get(
        "/api/appointment/doctor-schedule",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setAppointments(response.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to fetch appointments");
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await axiosInstance.patch(
        `/api/appointment/${appointmentId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchAppointments();
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update appointment status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
        <select
          className="px-4 py-2 border rounded-lg"
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          {/* <option value="pending">Pending</option> */}
          {/* <option value="confirmed">Confirmed</option> */}
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <tr key={appointment._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {appointment.patientId?.name || "Unknown"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(appointment.appointmentDate).toLocaleDateString()}{" "}
                  {appointment.timeSlot?.startTime} -{" "}
                  {appointment.timeSlot?.endTime}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      appointment.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : appointment.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : appointment.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : appointment.status === "completed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {appointment.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          handleStatusChange(appointment._id, "confirmed")
                        }
                        className="text-teal-600 hover:text-teal-900"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(appointment._id, "cancelled")
                        }
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {(appointment.status === "confirmed" ||
                    appointment.status === "scheduled") && (
                    <>
                      <button
                        onClick={() =>
                          handleStatusChange(appointment._id, "completed")
                        }
                        className="text-teal-600 hover:text-teal-900"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(appointment._id, "cancelled")
                        }
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Appointments;
