'use client'

import dynamic from 'next/dynamic'

const LikeShareBar = dynamic(() => import('./LikeShareBar'), { ssr: false })

export default LikeShareBar


