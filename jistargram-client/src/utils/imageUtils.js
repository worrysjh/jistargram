export const getImageUrl = (path, defaultImage = "/common/img/사용자이미지.jpeg") => {
  if (!path) return defaultImage;
  if (path.startsWith("http") || path.startsWith("https")) {
    return path;
  }
  return `${process.env.REACT_APP_API_URL}${path}`;
};
