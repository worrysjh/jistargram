export async function authFetch(url, options = {}, navigate) {
  const access_token = localStorage.getItem("access_token");

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...options.headers,
    Authorization: access_token ? `Bearer ${access_token}` : undefined,
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  };

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 || res.status === 403) {
    const refreshRes = await fetch(
      `${process.env.REACT_APP_API_URL}/auth/refresh`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (refreshRes.ok) {
      const { access_token } = await refreshRes.json();
      localStorage.setItem("access_token", access_token);

      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${access_token}`,
      };

      res = await fetch(url, {
        ...options,
        headers: retryHeaders,
        credentials: "include",
      });
    } else {
      //리프레시 실패시 로그아웃 처리
      localStorage.removeItem("access_token");
      if (navigate) navigate("/login");
      return null;
    }
  }
  return res;
}
