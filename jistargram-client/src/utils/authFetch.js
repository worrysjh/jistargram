export async function authFetch(url, options = {}, navigate) {
  const token = localStorage.getItem("token");

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : undefined,
    ...(isFormData ? {} : { "Content-Type": "application/json" }), // FormData면 Content-Type 추가 안함
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 토큰 만료 처리 생략...
    return response;
  } catch (err) {
    console.log("네트워크 오류: ", err);
    return null;
  }
}
