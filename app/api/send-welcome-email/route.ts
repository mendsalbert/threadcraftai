import { NextResponse } from "next/server";
import { MailtrapClient } from "mailtrap";

const TOKEN = process.env.MAILTRAP_API_TOKEN!;

const client = new MailtrapClient({ token: TOKEN });

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    const sender = { name: "ThreadCraft AI", email: "hello@demomailtrap.com" };
    const recipients = [{ email }];

    await client.send({
      from: sender,
      to: recipients,
      subject: "Welcome to ThreadCraft AI!",
      html: `
        <h1>Welcome to ThreadCraft AI, ${name}!</h1>
        <p>We're excited to have you on board. Get started by...</p>
      `,
      category: "Welcome Email",
    });

    return NextResponse.json({ message: "Welcome email sent successfully" });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 }
    );
  }
}
