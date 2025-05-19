import { authFetch } from "../../utils/authFetch";

export async function updateProfileBio(biography, navigate) {
  const response = await authFetch(
    "http://localhost:4000/users/updateProfile",
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ biography }),
    },
    navigate
  );
  if (!response) throw new Error("소개 수정 실패");
}
