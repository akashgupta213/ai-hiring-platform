-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "raw_text" TEXT NOT NULL,
    "skills" TEXT[],
    "score" INTEGER NOT NULL DEFAULT 0,
    "readability" INTEGER NOT NULL DEFAULT 0,
    "keyword_match" INTEGER NOT NULL DEFAULT 0,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resumes_user_id_key" ON "resumes"("user_id");

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
