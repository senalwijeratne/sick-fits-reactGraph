import React, { Component } from "react"
import PropTypes from "prop-types"
import { Mutation } from "react-apollo"
import gql from "graphql-tag"
import Form from "./styles/Form"
import Error from "./ErrorMessage"
import { CURRENT_USER_QUERY } from "./User"

const RESET_MUTATION = gql`
  mutation RESET_MUTATION(
    $resetToken: String!
    $password: String!
    $confirmPassword: String!
  ) {
    resetPassword(
      resetToken: $resetToken
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      email
      name
    }
  }
`

class Reset extends Component {
  static propTypes = {
    resetToken: PropTypes.string.isRequired
  }

  state = {
    password: "",
    confirmPassword: ""
  }

  saveToState = event => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  render() {
    return (
      <Mutation
        mutation={RESET_MUTATION}
        variables={{
          resetToken: this.props.resetToken,
          password: this.state.password,
          confirmPassword: this.state.confirmPassword
        }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(reset, { error, loading, called }) => {
          return (
            <Form
              method="post"
              onSubmit={async event => {
                event.preventDefault()
                await reset()

                this.setState({ password: "", confirmPassword: "" })
              }}
            >
              <fieldset disables={loading} aria-busy={loading}>
                <h2>Reset your password</h2>
                <Error error={error} />
                <label htmlFor="password">
                  New Password
                  <input
                    type="password"
                    name="password"
                    placeholder="password"
                    value={this.state.password}
                    onChange={this.saveToState}
                  />
                </label>
                <label htmlFor="confirmPassword">
                  Re-enter new Password
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="confirmPassword"
                    value={this.state.confirmPassword}
                    onChange={this.saveToState}
                  />
                </label>
                <button type="submit">Reset Password</button>
              </fieldset>
            </Form>
          )
        }}
      </Mutation>
    )
  }
}

export default Reset
