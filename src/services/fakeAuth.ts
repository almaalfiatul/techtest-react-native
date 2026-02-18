import { jwtDecode } from "jwt-decode";

type Payload = {
  email: string;
  exp: number;
};

export const fakeLogin = async (email: string, password: string) => {
  if (password.length < 6) {
    throw new Error("Invalid credentials");
  }

  const payload: Payload = {
    email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };

  const token = btoa(JSON.stringify(payload));

  return {
    token,
    email,
  };
};

export const isTokenExpired = (token: string) => {
  try {
    const decoded = jwtDecode<Payload>(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};
