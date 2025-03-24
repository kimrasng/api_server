FROM node:14

# MySQL 5.7 설치를 위한 리포지터리 추가
RUN apt-get update && apt-get install -y gnupg && \
    wget https://dev.mysql.com/get/mysql-apt-config_0.8.17-1_all.deb && \
    dpkg -i mysql-apt-config_0.8.17-1_all.deb && \
    apt-get update && apt-get install -y mysql-server=5.7.*

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# 애플리케이션 코드 복사
COPY . .

# 애플리케이션 종속성 설치
RUN npm install

# MySQL 서버 시작
CMD service mysql start && npm start
