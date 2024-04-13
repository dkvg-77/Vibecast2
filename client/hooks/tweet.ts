import { graphqlClient } from "@/clients/api"

import { useMutation, useQuery, QueryClient, useQueryClient } from '@tanstack/react-query';
import { getAllTweetsQuery } from '@/graphql/query/tweet';
import { createTweetMutation } from "@/graphql/mutations/tweet";
import { CreateTweetData } from "@/gql/graphql";
import toast from "react-hot-toast";

export const useCreateTweet = () =>{
     const queryClient = useQueryClient();
     const mutation = useMutation({
          mutationFn: (payload: CreateTweetData) =>graphqlClient.request(createTweetMutation,{payload}),
          onMutate: (payload) =>toast.loading('Creating post',{id:'1'}),
          onSuccess:async (payload) => {queryClient.invalidateQueries(["all-tweets"])
          toast.success('Post successfull'),{id:'1'}},
     })
     return mutation;
}

export const useGetAllTweets = () =>{
     const query = useQuery({
          queryKey: ["all-tweets"],
          queryFn:() => graphqlClient.request(getAllTweetsQuery),
     })
     return {...query,tweets: query.data?.getAllTweets}
}