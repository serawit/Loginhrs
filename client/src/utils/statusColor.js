// client/src/utils/statusColor.js
export const getStatusColor = (status) => {
  switch (status) {
    case "Approved":
      return "green";
    case "Pending":
      return "yellow";
    case "Rejected":
      return "red";
    default:
      return "gray"; // Default color if status is unknown
  }
};
