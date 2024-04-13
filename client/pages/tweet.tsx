import TwitterLayout from '../components/Layout/TwitterLayout';
import Image from "next/image";
import { Tweet, User } from '@/gql/graphql';

import { useCurrentUser } from '@/hooks/user';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { BiImageAlt } from 'react-icons/bi';
import { useCreateTweet } from '@/hooks/tweet';
import { graphqlClient } from '@/clients/api';
import { getSignedURLForTweetQuery } from '@/graphql/query/tweet';
import toast from 'react-hot-toast';
import axios from 'axios';

const tweetsPage: any = () => {
  const [content, setContent] = useState('');
  const [imageURL, setImageURL] = useState('');
  const { user } = useCurrentUser()

  const { mutateAsync } = useCreateTweet();



  const handleInputChangeFile = useCallback((input: HTMLInputElement) => {
    return async (event: Event) => {
      event.preventDefault();
      // console.log(input.files);
      const file: File | null | undefined = input.files?.item(0);
      if (!file) { return };

      const { getSignedURLForTweet } = await graphqlClient.request(getSignedURLForTweetQuery, {
        imageName: file.name,
        imageType: file.type
      })

      if (getSignedURLForTweet) {
        toast.loading('Uploading File...', { id: '2' });
        await axios.put(getSignedURLForTweet, file, {
          headers: {
            'Content-Type': file.type
          }
        })
        toast.success('Upload completed', { id: '2' });

        const url = new URL(getSignedURLForTweet);
        const myFilePath = `${url.origin}${url.pathname}`
        setImageURL(myFilePath);
      }

    }
  }, [])


  const handleSelectImage = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');

    const handlerFn = handleInputChangeFile(input);

    input.addEventListener('change', handlerFn)

    input.click();
  }, [handleInputChangeFile])

  const handleCreateTweet = useCallback(async () => {
    await mutateAsync({
      content,
      imageURL,
    });
    setContent('');
    setImageURL('');
  }, [content, mutateAsync, imageURL])





  return (
    <div className='overflow-hidden'>
      <TwitterLayout>

        <div className='py-4 px-12 border-b border-gray-600 hover:bg-slate-900 transition-all cursor-pointer'>
          <div className='grid grid-cols-12 gap-3'>
            <div className='col-span-1'>
              {user?.profileImageURL &&
                <Image className='rounded-full' src={user?.profileImageURL} alt='user-image' width={50} height={50} >
                </Image>}
            </div>
            <div className="col-span-11">
              <textarea className="w-full bg-transparent text-xl px-3 border-b border-slate-700" placeholder="Share a Vibe!" rows={3}
                value={content}
                onChange={e => setContent(e.target.value)}>

              </textarea>

              {
                imageURL && <Image src={imageURL} alt={"tweet-image"} width={300} height={300}></Image>
              }

              <div className="mt-2 flex justify-between">
                <BiImageAlt onClick={handleSelectImage} className="text-xl">
                </BiImageAlt>
                <button className="bg-[#1d9bf0] font-semibold text-sm py-1 px-3 rounded-full"
                  onClick={handleCreateTweet}
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

      </TwitterLayout>
    </div>
  )
}


export default tweetsPage;