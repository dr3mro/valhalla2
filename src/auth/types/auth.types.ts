export type AuthInput = {
  username: string;
  password: string;
};

export type SignInResponse = {
  accessToken: string;
  user: {
    id: string;
    username: string;
  };
};
