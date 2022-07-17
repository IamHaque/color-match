import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "failed", message: "Method not allowed" });
  }

  // Get username from the request
  const username = req.body.username;

  // Check if username empty or undefined
  if (username === "" || !username) {
    return res
      .status(401)
      .json({ status: "failed", message: "Enter a username" });
  }

  // Check if username is valid
  if (
    /^(?=.{5,15}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/.test(
      username
    ) === false
  ) {
    return res.status(401).json({
      status: "failed",
      message:
        "Username must have 5 to 15 characters.<br>Username can only have alphabets, numbers, . and _<br>Username must not start or end with . or _",
    });
  }

  try {
    // Add user to db
    await prisma.users.create({
      data: {
        username,
        highscore: 0,
      },
    });

    return res.status(200).json({ status: "success", message: "User created" });
  } catch (e) {
    // Handling DB write error
    const errorData =
      e.meta && e.meta.target
        ? e.meta.target.map((item) => `${item} already exists.`)
        : "An error occurred.";
    return res.status(404).json({ status: "failed", message: errorData });
  }
}
