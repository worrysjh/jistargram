import { authFetch } from "../../utils/authFetch";

export async function fetchUserList(searchKeyword = "") {
  const base = `${process.env.REACT_APP_API_URL}/users/all`;
  console.log("Fetching users with keyword:", searchKeyword);
  const url = new URL(base);
  if (searchKeyword) {
    url.searchParams.set("search", searchKeyword);
  }

  const res = await authFetch(url.toString(), { method: "GET" });
  if (!res.ok) throw new Error("네트워크 응답 실패");
  return res.json();
}
