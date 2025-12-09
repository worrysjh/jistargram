export async function authFetch(url, options = {}, navigate) {
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...options.headers,
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
      res = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });
    } else {
      //리프레시 실패시 로그아웃 처리
      if (navigate) navigate("/login");
      return null;
    }
  }
  return res;
}
