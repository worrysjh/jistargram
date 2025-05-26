
--사용자 테이블
CREATE TABLE  users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR(255) UNIQUE NOT NULL,
    nick_name VARCHAR(255) NOT NULL,
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
    post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    content TEXT,
    media_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    post_state VARCHAR(20) DEFAULT '공개' NOT NULL
);


--댓글 테이블
CREATE TABLE comments (
    comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(post_id),
    user_id UUID NOT NULL REFERENCES users(user_id),
    comment_content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    parent_id UUID REFERENCES comments(comment_id),
    comment_state VARCHAR(20) DEFAULT '생성' NOT NULL
);

--좋아요 테이블
CREATE TABLE likes (
    like_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
    target_id UUID NOT NULL,
    UNIQUE (user_id, target_type, target_id)
);

--refreshToken 테이블
create table refresh_tokens (
	token_id UUID PRIMARY KEY default gen_random_uuid(),
	user_id UUID UNIQUE not null references users(user_id),
	payload text not null,
	expires_at timestamp not null,
	created_at timestamp default now()
);