import React, { Component } from "react"
import gql from "graphql-tag"
import { Query } from "react-apollo"
import styled from "styled-components"
import Head from "next/head"
import Error from "../components/ErrorMessage"

const StyledSingleItem = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  box-shadow: ${props => props.theme.bs};
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  min-height: 800px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .details {
    margin: 3rem;
    font-size: 2rem;
  }
`

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      largeImage
    }
  }
`

class SingleItem extends Component {
  render() {
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
        {({ error, loading, data }) => {
          if (error) return <Error error={error} />
          if (loading) return <p>loading...</p>

          if (!data.item) return <p>no item found for ID: {this.props.id}</p>

          const { item } = data

          return (
            <StyledSingleItem>
              <Head>
                <title>{item.title} | Sick Fits</title>
              </Head>
              <img src={item.largeImage} alt={item.title} />
              <div className="details">
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </div>
            </StyledSingleItem>
          )
        }}
      </Query>
    )
  }
}

export default SingleItem
