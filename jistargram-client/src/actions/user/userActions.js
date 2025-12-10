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

export async function addFollowUser(target_user_id) {
  const response = await authFetch(
    `${process.env.REACT_APP_API_URL}/users/addFollow/${target_user_id}`,
    {
      method: "POST",
    }
  );
  if (!response.ok) throw new Error("팔로우 추가 실패");
  return response.json();
}

export async function removeFollowUser(target_user_id) {
  const response = await authFetch(
    `${process.env.REACT_APP_API_URL}/users/removeFollower/${target_user_id}`,
    {
      method: "DELETE",
    }
  );
  if (!response.ok) throw new Error("팔로우 취소 실패");
  return response.json();
}

export async function fetchFollowStatus(target_user_id) {
  const response = await authFetch(
    `${process.env.REACT_APP_API_URL}/users/followStatus/${target_user_id}`,
    {
      method: "GET",
    }
  );
  if (!response.ok) throw new Error("팔로우 상태 조회 실패");
  return response.json();
}

export async function fetchFollowList(user_id) {
  const response = await authFetch(
    `${process.env.REACT_APP_API_URL}/users/followerlists/${user_id}`,
    {
      method: "GET",
    }
  );
  if (!response.ok) throw new Error("팔로워 목록 조회 실패");
  return response.json();
}

export async function fetchFollowerList(user_id) {
  const response = await authFetch(
    `${process.env.REACT_APP_API_URL}/users/followinglists/${user_id}`,
    {
      method: "GET",
    }
  );
  if (!response.ok) throw new Error("팔로우 목록 조회 실패");
  return response.json();
}
