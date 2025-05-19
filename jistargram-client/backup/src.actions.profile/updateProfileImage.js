import { authFetch } from "../../utils/authFetch";

export async function updateProfileImage(file, navigate) {
  const formData = new FormData();
  formData.append("profile_img", file);

  const response = await authFetch(
    "http://localhost:4000/users/updateProfileImg",
    {
      method: "POST",
      body: formData,
    },
    navigate
  );
  if (!response) throw new Error("이미지 업로드 실패");
}
