FROM node:14

# MySQL 설치
RUN apt-get update && apt-get install -y mysql-server

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# 애플리케이션 코드 복사
COPY . .

# 애플리케이션 종속성 설치
RUN npm install

# MySQL 서버 시작
CMD service mysql start && npm start
