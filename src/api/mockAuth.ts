export const signup = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  return new Promise<{ token: string; user: { email: string } }>(
    (resolve, reject) => {
      setTimeout(() => {
        if (email === "userone@user.com" && password === "123456") {
          resolve({
            token: "mock-auth-token-abc123",
            user: { email },
          });
        } else if (email === "userone@user.com") {
          reject("Invalid password");
        } else {
          reject("Invalid credentials or email not registered");
        }
      }, 1000);
    }
  );
};
