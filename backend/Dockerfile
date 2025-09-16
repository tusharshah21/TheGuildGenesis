FROM rust:latest AS build
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    netcat-openbsd \
 && rm -rf /var/lib/apt/lists/*
RUN useradd -m appuser
WORKDIR /app
COPY --from=build /app/target/release/guild-backend /app/app
ENV RUST_LOG=info PORT=3001
EXPOSE 3001
USER appuser
CMD ["/app/app"]

