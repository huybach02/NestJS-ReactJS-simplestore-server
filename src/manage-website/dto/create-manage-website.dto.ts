import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHomeSliderDto {
  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  btnText: string;

  @IsString()
  @IsNotEmpty()
  btnLink: string;
}

export class CreateManageWebsiteDto {
  @IsOptional()
  homeSlider?: CreateHomeSliderDto;

  @IsOptional()
  homeBanner: {
    bannerLeft: {
      image: string;
      linkUrl: string;
    };
  };

  @IsOptional()
  homeCommitment: {
    title: string;
    description: string;
    order: number;
  };

  @IsOptional()
  productQuestionAnswer: {
    question: string;
    answer: string;
    order: number;
  };

  @IsOptional()
  aboutUsContent: string;
}
