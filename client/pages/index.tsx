
import FeedCard from "@/components/FeedCard";

import { useCreateTweet, useGetAllTweets } from "@/hooks/tweet";
import { Tweet } from "@/gql/graphql";

import TwitterLayout from "@/components/Layout/TwitterLayout";

import { GetServerSideProps } from "next";
import { graphqlClient } from "@/clients/api";
import { getAllTweetsQuery, getSignedURLForTweetQuery } from "@/graphql/query/tweet";


interface HomeProps {
  tweets?: Tweet[]
}


export default function Home(props: HomeProps) {



  const {tweets = props.tweets as Tweet[]} = useGetAllTweets();



  return (
    <TwitterLayout>
    
      {
        tweets?.map(tweet => tweet ? <FeedCard key={tweet?.id} data={tweet as Tweet} /> : null)
      }
    </TwitterLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const allTweets = await graphqlClient.request(getAllTweetsQuery);
  return {
    props: {
      tweets: allTweets.getAllTweets as Tweet[],
    }
  }
}


