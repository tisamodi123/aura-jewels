"use client"

import { useRouter } from 'next/navigation';
import { startTransition } from 'react'

export default function Error({ error }) {
  const router = useRouter();

  return (
    <div className="rounded-md border border-gray-200 p-2 mb-3 bg-white shadow-sm flex justify-between">
      <div className="bg-white border border-zinc-200 shadow-md rounded-md p-3 mb-5">
        <p>{error.message}</p>
        <button
          className='bg-blue-500 hover:bg-blue-700 text-white text-xs py-2 px-4 hand'
          onClick={() => {
            startTransition(() => {
              router.push('/dashboard');
            })
          }}
        >Try Again </button>

      </div>
    </div>
  )
}
