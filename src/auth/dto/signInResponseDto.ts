export class SignInResponseDto {
  accessToken: string;
  user: {
    id: string;
    username: string;
  };
}
