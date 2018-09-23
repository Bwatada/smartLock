
const initialState = {
  status: false
}
const reduce = (state = initialState, action) => {
  switch (action.type) {
      case 'Data':
          return {
              ...state,
              status: action.data
          }

      default:
          return state
  }
}

export default reduce 