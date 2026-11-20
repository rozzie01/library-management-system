import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateGenreDto {
  @IsString() @IsNotEmpty() name: string;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase letters, numbers and hyphens, e.g. science-fiction',
  })
  slug: string;
}