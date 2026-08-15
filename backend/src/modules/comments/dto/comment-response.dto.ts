export class CommentUserResponseDto {
  id!: string;
  name!: string;
  email!: string;
}

export class TicketCommentResponseDto {
  id!: string;

  content!: string;

  isInternal!: boolean;

  createdAt!: Date;

  updatedAt!: Date;

  user!: CommentUserResponseDto;
}