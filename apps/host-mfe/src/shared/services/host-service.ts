import { format } from "date-fns";

  export const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "dd MMM yy h:mm a");
    } catch (e) {
      return dateStr;
    }
  };

 export const getVerificationColor = (status: string) => {
  switch (status) {
    // 🟢 Green
    case "Valid":
      return "#28a745";

    // 🔴 Red
    case "Invalid":
    case "System Error":
    case "Match Found":
    case "Match Not Found":
      return "#dc3545";

    // 🟠 Orange
    case "ID Unrecognized":
    case "Unable to Perform":
      return "#fd7e14";

    // 🟡 Yellow
    case "Skipped":
      return "#ffc107";

    default:
      return "#6b7280";
  }
};