import React from 'react'
import Category from '../[category]/_components/Category'

const page = async (props: {
    params: Promise<{ category: string }>,
    searchParams: Promise<any>
}) => {
    const params = await props.params;
    const searchParams = await props.searchParams;
    return (
        <Category category={searchParams?.category} />
    )
}

export default page