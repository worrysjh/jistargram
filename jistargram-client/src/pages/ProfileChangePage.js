// src/pages/ProfileChangePage.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileChangePage.css";

import {
  fetchProfile,
  updateProfileBio,
  updateProfileImage,
} from "../actions/profile/profileActions";

function ProfileChangePage() {
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  // 프로필 로드
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchProfile(navigate);
        setProfile(data);
        setBio(data.biography);
      } catch (err) {
        console.error("프로필 로딩 오류:", err);
      }
    })();
  }, [navigate]);

  if (!profile) return <p>로딩 중...</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfileBio(bio, navigate);
      alert("프로필이 수정되었습니다.");
      navigate("/profile");
    } catch (err) {
      console.error("소개 수정 실패:", err);
      alert("소개 수정 중 오류가 발생했습니다.");
    }
  };

  // 파일 선택
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // 이미지 업로드 핸들러
  const handleUpload = async () => {
    if (!selectedFile) return alert("파일을 선택하세요");
    try {
      await updateProfileImage(selectedFile, navigate);
      alert("프로필 사진이 변경되었습니다.");
      setShowModal(false);
      window.location.reload();
    } catch (err) {
      console.error("이미지 업로드 실패:", err);
      alert("이미지 업로드 중 오류가 발생했습니다.");
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
          <h2 className="profile-edit-username">{profile.user_name}</h2>
          <p>{profile.user_name}</p>
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
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="작성된 자기소개가 없습니다."
          maxLength={149}
        />
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
