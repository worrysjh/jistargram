const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const isSameDay = (timestamp1, timestamp2) => {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const isSameSender = (currentMsg, nextMsg) => {
  if (!nextMsg) return false;
  return currentMsg.sender_id === nextMsg.sender_id;
};

export { formatDate, formatTime, isSameDay, isSameSender };
