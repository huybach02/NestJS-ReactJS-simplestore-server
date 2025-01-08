import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true },
})
export class ManageWebsite extends Document {
  @Prop({
    required: false,
    type: [
      {
        image: String,
        title: String,
        description: String,
        btnText: String,
        btnLink: String,
        order: Number,
      },
    ],
    default: [],
  })
  homeSlider: {
    image: string;
    title: string;
    description: string;
    btnText: string;
    btnLink: string;
    order: number;
  }[];

  @Prop({
    required: false,
    type: {
      bannerLeft: {
        type: {
          image: { type: String, required: true },
          linkUrl: { type: String, required: true },
        },
      },
      bannerRight: {
        type: {
          image: { type: String, required: true },
          linkUrl: { type: String, required: true },
        },
      },
    },
    default: {},
  })
  homeBanner: {
    bannerLeft: {
      image: string;
      linkUrl: string;
    };
    bannerRight: {
      image: string;
      linkUrl: string;
    };
  };

  @Prop({
    required: false,
    type: [
      {
        icon: String,
        title: String,
        description: String,
        order: Number,
      },
    ],
    default: [],
  })
  homeCommitment: {
    title: string;
    description: string;
    order: number;
  }[];

  @Prop({
    required: false,
    default: [],
    type: [
      {
        question: String,
        answer: String,
        order: Number,
      },
    ],
  })
  productQuestionAnswer: {
    question: string;
    answer: string;
    order: number;
  }[];

  @Prop({
    required: false,
    default: '',
  })
  aboutUsContent: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ManageWebsiteSchema = SchemaFactory.createForClass(ManageWebsite);
