import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "failed", message: "Method not allowed" });
  }

  // Get data from the request
  const { username, score } = req.body;

  // Return if username or scores are not provided
  if (username === "" || !username || score === null) {
    return res
      .status(401)
      .json({ status: "failed", message: "Insufficient data" });
  }

  try {
    const updatedUser = await prisma.users.update({
      where: {
        username: username,
      },
      data: { highscore: score },
    });

    return res.status(200).json({ status: "success", message: "User updated" });
  } catch (e) {
    // Handle DB update error
    const errorData = e.meta && e.meta.cause ? e.meta.cause : e;
    return res.status(404).json({ status: "failed", message: errorData });
  }
}
