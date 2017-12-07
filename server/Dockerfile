FROM golang:onbuild

RUN go get -u github.com/c9s/gomon
RUn mkdir /app
RUN gomon /app -- go run server.go &
