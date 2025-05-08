export async function authFetch(url, options = {}, navigate) {
  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : undefined,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (
      (response.status === 401 || response.status === 403) &&
      !url.includes("/login") &&
      !url.includes("/register")
    ) {
      alert("로그인 시간이 만료되었습니다. 다시 로그인 해주세요.");
      localStorage.removeItem("token");
      if (navigate) navigate("/login");
      return null;
    }

    return response;
  } catch (err) {
    console.log("네트워크 오류: ", err);
    return null;
  }
}
