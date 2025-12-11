export function calculateDateDifference(pastDate, currentDate) {
  const past = new Date(pastDate);
  const current = new Date(currentDate);
  const diffInMs = current - past;
  const diffInDays = Math.floor(diffInMs);

  if (diffInDays < 1000 * 60) return "방금전";
  else if (diffInDays < 1000 * 60 * 60)
    return Math.floor(diffInDays / (1000 * 60)) + "분";
  else if (diffInDays < 1000 * 60 * 60 * 24)
    return Math.floor(diffInDays / (1000 * 60 * 60)) + "시간";
  else if (diffInDays < 1000 * 60 * 60 * 24 * 30)
    return Math.floor(diffInDays / (1000 * 60 * 60 * 24)) + "일";
  else if (diffInDays < 1000 * 60 * 60 * 24 * 365)
    return Math.floor(diffInDays / (1000 * 60 * 60 * 24 * 7)) + "주";
}
