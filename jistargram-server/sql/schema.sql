DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS follows;

--사용자 테이블
CREATE TABLE  users (
    userid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    passwd VARCHAR(255) NOT NULL,
    birthdate DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    biography TEXT,
    profile_img VARCHAR(255),
    user_state VARCHAR(20) DEFAULT '활성' NOT NULL
);

--게시글 테이블
CREATE TABLE posts (
    postid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userid UUID REFERENCES users(userid),
    content TEXT,
    media_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    post_state VARCHAR(20) DEFAULT '공개' NOT NULL
);


--댓글 테이블
CREATE TABLE comments (
    commentid SERIAL PRIMARY KEY,
    postid UUID NOT NULL REFERENCES posts(postid) ON DELETE CASCADE,
    userid NOT NULL REFERENCES users(userid),
    comment_content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    parent_id INTEGER REFERENCES comments(commentid) ON DELETE CASCADE
);

--좋아요 테이블
CREATE TABLE likes (
    likeid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userid UUID NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
    target_id UUID NOT NULL,
    UNIQUE (userid, target_type, target_id)
);