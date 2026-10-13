FROM oven/bun:1-slim

WORKDIR /app

COPY package.json tsconfig.json ./
RUN bun install

COPY . .

EXPOSE 8000

ENV PORT=8000
CMD ["bun", "src/index.ts"]
