import { format } from "date-fns";

  export const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "dd MMM yy h:mm a");
    } catch (e) {
      return dateStr;
    }
  };