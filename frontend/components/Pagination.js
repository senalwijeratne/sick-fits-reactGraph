import React from "react"
import gql from "graphql-tag"
import { Query } from "react-apollo"
import Head from "next/head"
import Link from "next/link"
import PaginationStyles from "./styles/PaginationStyles"
import { perPage } from "../config"

const PAGINATION_QUERY = gql`
  query PAGINATION_QUERY {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`

const Pagination = props => {
  return (
    <Query query={PAGINATION_QUERY}>
      {({ loading, error, data }) => {
        if (loading) return <p>loading...</p>
        if (error) return <p>error! {error.message}</p>

        const count = data.itemsConnection.aggregate.count
        const pages = Math.ceil(count / perPage)
        const page = props.page

        return (
          <PaginationStyles>
            <Head>
              <title>
                Page {page} of {pages} pages | Sick Fits
              </title>
            </Head>
            <Link
              prefetch
              href={{
                path: "items",
                query: { page: page - 1 }
              }}
            >
              <a className="prev" aria-disabled={page <= 1}>
                ⬅ prev
              </a>
            </Link>
            <p>
              Page {page} out of {pages}
            </p>
            <p>{count} items total</p>
            <Link
              prefetch
              href={{
                path: "items",
                query: { page: page + 1 }
              }}
            >
              <a className="prev" aria-disabled={page >= pages}>
                next ➡
              </a>
            </Link>
          </PaginationStyles>
        )
      }}
    </Query>
  )
}

export default Pagination
