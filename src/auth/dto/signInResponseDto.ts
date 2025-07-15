import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'The id of the user',
    example: 'clz16syr4000008l823652n2h',
  })
  id: string;

  @ApiProperty({
    description: 'The username of the user',
    example: 'test@test.com',
  })
  username: string;
}

export class SignInResponseDto {
  @ApiProperty({
    description: 'The access token for the user',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHoxNnN5cjQwMDAwMDhsODIzNjUybjJoIiwidXNlcm5hbWUiOiJ0ZXN0QHRlc3QuY29tIiwiaWF0IjoxNzIwNzc3Mjg0LCJleHAiOjE3MjA3NzcwODR9.5vB_3J-3X_7Y-ZzD-QYJ_4a_8Z-X_7Y-ZzD-QYJ_4a_8',
  })
  accessToken: string;

  @ApiProperty({ description: 'The user object', type: UserDto })
  user: UserDto;
}
