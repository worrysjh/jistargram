import React, { useState, useEffect } from "react";
import { authFetch } from "../utils/authFetch";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileChangePage.css";

function ProfileChangePage() {
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const response = await authFetch(
        "http://localhost:4000/users/getMyProfile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        navigate
      );

      const data = await response.json();
      setProfile(data);
    };

    fetchProfile();
  }, [navigate]);

  if (!profile) return <p>로딩 중...</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await authFetch(
      "http://localhost:4000/users/updateProfile",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ biography: bio }),
      },
      navigate
    );
    if (!response) {
      console.log("서버 응답 없음 또는 인증 실패");
      return;
    }

    if (response && response.ok) {
      alert("프로필이 수정되었습니다.");
    } else {
      alert("수정 실패: 서버 오류 또는 권한 없음");
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("파일을 선택하세요");

    const formData = new FormData();
    formData.append("profile_img", selectedFile);

    const response = await authFetch(
      "http://localhost:4000/users/updateProfileImg",
      {
        method: "POST",
        body: formData,
      },
      navigate
    );

    if (response && response.ok) {
      alert("프로필 사진이 변경되었습니다.");
      setShowModal(false);
      window.location.reload();
    } else {
      alert("업로드 실패");
    }
  };

  return (
    <div className="profile-edit-container">
      <div className="profile-edit-header">
        <img
          src={
            profile.profile_img
              ? `http://localhost:4000${profile.profile_img}`
              : "/common/img/사용자이미지.jpeg"
          }
          alt="프로필 이미지"
          className="profile-edit-picture"
        />
        <div>
          <h2 className="profile-edit-username">{profile.userid}</h2>
          <p>{profile.username}</p>
          <button
            className="photo-change-btn"
            onClick={() => setShowModal(true)}
          >
            사진 변경
          </button>
        </div>
      </div>

      <form className="profile-edit-form" onSubmit={handleSubmit}>
        <label>소개</label>
        <textarea
          value={profile.biography}
          onChange={(e) => setBio(e.target.value)}
          placeholder="작성된 자기소개가 없습니다."
          maxLength={149}
        ></textarea>
        <small>{bio.length}/150</small>

        <button type="submit" className="submit-btn">
          제출
        </button>
      </form>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>프로필 사진 변경</h3>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button onClick={handleUpload}>업로드</button>
            <button onClick={() => setShowModal(false)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileChangePage;
