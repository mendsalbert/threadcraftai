let client: any;

export const initMailtrap = async () => {
  if (typeof window === "undefined") {
    const { MailtrapClient } = await import("mailtrap");
    client = new MailtrapClient({
      token: process.env.MAILTRAP_API_TOKEN!,
    });
  }
};

export const sendWelcomeEmail = async (toEmail: string, name: string) => {
  if (typeof window !== "undefined") {
    console.error("sendWelcomeEmail should only be called on the server side");
    return;
  }

  if (!client) {
    await initMailtrap();
  }

  const sender = { name: "ThreadCraft AI", email: "hello@demomailtrap.com" };

  await client.send({
    from: sender,
    to: [{ email: toEmail }],
    subject: "Welcome to ThreadCraft AI!",
    html: `
      <h1>Welcome to ThreadCraft AI, ${name}!</h1>
      <p>We're excited to have you on board. Get started by...</p>
    `,
  });
};
