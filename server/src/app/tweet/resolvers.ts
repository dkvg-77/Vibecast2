import { Tweet } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import UserService from "../../services/user";
import TweetService, { CreateTweetPayload } from "../../services/tweet";


const s3Client = new S3Client({
     region: process.env.AWS_DEFAULT_REGION,
     credentials:{
          accessKeyId: `${process.env.AWS_ACCESS_KEY}`,
          secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`
     }
})

const mutations = {
     createTweet: async (parents: any, { payload }: { payload: CreateTweetPayload }, ctx: GraphqlContext) => {
          if (!ctx.user) { throw new Error('You are not authenticated') }

          const tweet = await TweetService.createTweet({
               ...payload,
               userId: ctx.user.id,
          })
          return tweet;
     }
}
const extraResolvers = {
     Tweet: {
          author: (parent: Tweet) => UserService.getUserById(parent.authorId),
     }
}

const queries = {
     getAllTweets: () => TweetService.getAllTweets(),
     getSignedURLForTweet: async (
          parent: any,
          { imageType, imageName }: { imageType: string, imageName: string },
           ctx: GraphqlContext
     ) => {
          if (!ctx.user || !ctx.user.id) {
               throw new Error('Unauthenticated');
          }
          const allowedImageTypes = [
               "image/jpg", 
               "image/jpeg", 
               "image/png", 
               "image/webp"
          ];
          if (!allowedImageTypes.includes(imageType)) {
               throw new Error('Unsupported file type');
          }
          
          const putObjectCommand = new PutObjectCommand({
               
               Bucket: process.env.AWS_S3_BUCKET,
               ContentType:imageType,
               Key: `uploads/${ctx.user.id}/tweets/${imageName}-${Date.now()}`
          })
          
          const signedURL = await getSignedUrl(s3Client, putObjectCommand);
          return signedURL
     }

}
export const resolvers = { mutations, extraResolvers, queries }